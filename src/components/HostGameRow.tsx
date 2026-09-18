"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type HostGameRowData = {
  id: string;
  title: string;
  venueName: string;
  city: string;
  dateLabel: string;
  timeLabel: string;
  format: string;
  pricePerSpot: number;
  spotsTaken: number;
  capacity: number;
  cancelled: boolean;
  past: boolean;
};

export function HostGameRow({ game }: { game: HostGameRowData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancelGame() {
    if (!confirm(`Cancel "${game.title}"? All confirmed players will be refunded.`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/games/${game.id}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not cancel.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {game.cancelled && <span className="pill bg-danger/20 text-danger border border-danger text-[10px]">CANCELLED</span>}
          {!game.cancelled && game.past && (
            <span className="pill bg-panel2 text-muted border border-border text-[10px]">COMPLETED</span>
          )}
          <h3 className="font-bold">{game.title}</h3>
        </div>
        <p className="text-sm text-muted">
          🏟️ {game.venueName} · 📍 {game.city}
        </p>
        <p className="text-sm text-muted">
          {game.dateLabel} · {game.timeLabel} · {game.format} · ₹{game.pricePerSpot}/spot
        </p>
        <p className="text-sm text-muted">
          {game.spotsTaken} of {game.capacity} spots filled
        </p>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
      {!game.cancelled && !game.past && (
        <button onClick={cancelGame} disabled={loading} className="btn-secondary shrink-0 !py-2">
          {loading ? "Cancelling…" : "Cancel Game"}
        </button>
      )}
    </div>
  );
}
