"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameCardData } from "@/components/GameCard";

const MAX_GUESTS = 4;

export function BookingModal({ game, onClose }: { game: GameCardData; onClose: () => void }) {
  const router = useRouter();
  const [guestCount, setGuestCount] = useState(0);
  const [note, setNote] = useState("");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"booked" | "waitlisted" | null>(null);

  const isFull = game.badge === "FULL";
  const maxAddableGuests = Math.max(0, Math.min(MAX_GUESTS, game.spotsLeft - 1));
  const priceKnown = game.pricePerSpot !== null;
  const amountDue = priceKnown ? game.pricePerSpot! * (1 + guestCount) : null;

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    const endpoint = isFull ? `/api/games/${game.id}/waitlist` : `/api/games/${game.id}/book`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestCount, note }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setDone(isFull ? "waitlisted" : "booked");
    router.refresh();
  }

  if (done) {
    return (
      <Overlay onClose={() => { onClose(); }}>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">{done === "booked" ? "🎉" : "📋"}</div>
          <h2 className="text-xl font-bold mb-2">
            {done === "booked" ? "You're in!" : "You're on the waitlist"}
          </h2>
          <p className="text-muted text-sm mb-6">
            {done === "booked"
              ? `Spot confirmed for ${game.title}. Check My Bookings for details.`
              : `We'll notify you if a spot opens up for ${game.title}.`}
          </p>
          <button className="btn-primary w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-xs uppercase text-muted mb-1">{isFull ? "Join Waitlist" : "Confirm Spot"}</p>
      <h2 className="text-2xl font-bold mb-4 leading-tight">
        {game.venueName}
        <br />
        <span className="text-muted text-lg font-medium">{game.city}</span>
      </h2>

      <div className="grid grid-cols-4 gap-2 border-y border-border py-4 mb-4 text-sm">
        <div>
          <p className="text-[10px] uppercase text-muted mb-1">Date</p>
          <p className="font-bold">{game.dateISO.slice(0, 10)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted mb-1">Time</p>
          <p className="font-bold">{game.timeLabel}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted mb-1">Format</p>
          <p className="font-bold">{game.format}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted mb-1">Spots Left</p>
          <p className="font-bold">{game.spotsLeft}</p>
        </div>
      </div>

      {!isFull && (
        <>
          <button
            type="button"
            onClick={() => setPrefsOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-panel2 border border-border rounded-lg px-4 py-3 mb-4 text-xs uppercase tracking-wide"
          >
            Preferences
            <span>{prefsOpen ? "▲" : "▼"}</span>
          </button>
          {prefsOpen && (
            <textarea
              className="input mb-4"
              rows={2}
              placeholder="Preferred position, team request, etc. (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-muted">Bring Friends</p>
              <p className="text-sm text-muted">
                Add up to {MAX_GUESTS} confirmed guests
                {priceKnown ? ` — each adds ₹${game.pricePerSpot}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary !px-3 !py-2"
                disabled={guestCount === 0}
                onClick={() => setGuestCount((c) => Math.max(0, c - 1))}
              >
                −
              </button>
              <span className="w-6 text-center font-bold">{guestCount}</span>
              <button
                type="button"
                className="btn-secondary !px-3 !py-2"
                disabled={guestCount >= maxAddableGuests}
                onClick={() => setGuestCount((c) => Math.min(maxAddableGuests, c + 1))}
              >
                + Add Guest
              </button>
            </div>
          </div>

          <div className="bg-panel2 border border-border rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase text-muted">Amount Due</p>
            <p className="text-2xl font-black text-accent">{priceKnown ? `₹${amountDue}` : "TBD"}</p>
            <p className="text-xs text-muted mt-1">
              {priceKnown
                ? "Pay the host directly — they'll mark you as paid once settled."
                : "The host will set the price after the game and you'll owe it then."}
            </p>
          </div>

          <p className="text-xs text-muted mb-4">{game.cancellationPolicy}</p>
        </>
      )}

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      <button className="btn-primary w-full" disabled={submitting} onClick={handleConfirm}>
        {submitting ? "Processing…" : isFull ? "Join Waitlist" : "Confirm Spot"}
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white text-xl">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
