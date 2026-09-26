"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApproveWaitlistButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/approve`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not approve.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button onClick={approve} disabled={loading} className="btn-primary !py-2">
        {loading ? "Approving…" : "Approve"}
      </button>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
