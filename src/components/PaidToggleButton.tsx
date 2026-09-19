"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaidToggleButton({ bookingId, paid }: { bookingId: string; paid: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/paid`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: !paid }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={paid ? "btn-secondary !py-2" : "btn-primary !py-2"}
    >
      {loading ? "…" : paid ? "Mark Unpaid" : "Mark Paid"}
    </button>
  );
}
