"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type BookingRowData = {
  id: string;
  gameTitle: string;
  venueName: string;
  city: string;
  dateLabel: string;
  timeLabel: string;
  format: string;
  status: "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "COMPLETED";
  guestCount: number;
  amountDue: number;
  paid: boolean;
  forfeited: boolean;
  cancellable: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-live/20 text-live border-live",
  WAITLISTED: "bg-warn/20 text-warn border-warn",
  CANCELLED: "bg-danger/20 text-danger border-danger",
  COMPLETED: "bg-panel2 text-muted border-border",
};

export function BookingRow({ booking }: { booking: BookingRowData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm(`Cancel your spot in "${booking.gameTitle}"?`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not cancel.");
      return;
    }
    router.refresh();
  }

  const owesMoney = booking.amountDue > 0 && !booking.paid && (booking.status === "CONFIRMED" || booking.forfeited);

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`pill border text-[10px] ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
          {booking.forfeited && (
            <span className="pill border text-[10px] bg-warn/20 text-warn border-warn">FEE OWED</span>
          )}
          <h3 className="font-bold truncate">{booking.gameTitle}</h3>
        </div>
        <p className="text-sm text-muted">
          🏟️ {booking.venueName} · 📍 {booking.city}
        </p>
        <p className="text-sm text-muted">
          {booking.dateLabel} · {booking.timeLabel} · {booking.format}
          {booking.guestCount > 0 && ` · +${booking.guestCount} guest${booking.guestCount > 1 ? "s" : ""}`}
        </p>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {booking.amountDue > 0 && (
          <div className="text-right">
            <span className="font-bold">₹{booking.amountDue}</span>
            <p className={`text-xs ${owesMoney ? "text-warn" : "text-live"}`}>
              {booking.paid ? "Paid" : owesMoney ? "Unpaid" : ""}
            </p>
          </div>
        )}
        {booking.cancellable && (
          <button onClick={cancel} disabled={loading} className="btn-secondary !py-2">
            {loading ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
