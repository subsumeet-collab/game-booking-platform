"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemovePlayerButton({ bookingId, playerName }: { bookingId: string; playerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!confirm(`Remove ${playerName} from this game?`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/remove`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not remove.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button onClick={remove} disabled={loading} className="btn-secondary !py-2">
        {loading ? "Removing…" : "Remove"}
      </button>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
