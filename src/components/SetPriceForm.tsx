"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetPriceForm({ gameId, currentPrice }: { gameId: string; currentPrice: number | null }) {
  const router = useRouter();
  const [price, setPrice] = useState(currentPrice?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/games/${gameId}/pricing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricePerSpot: Number(price) }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not update price.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card !py-4 mb-6 flex items-end gap-3 flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs uppercase text-muted mb-1">
          {currentPrice === null ? "Set Price / Spot (₹)" : "Update Price / Spot (₹)"}
        </label>
        <input
          type="number"
          min={0}
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 250"
          required
        />
      </div>
      <button className="btn-primary !py-2.5" disabled={loading || price === ""}>
        {loading ? "Saving…" : currentPrice === null ? "Set Price" : "Update Price"}
      </button>
      {error && <p className="text-sm text-danger w-full">{error}</p>}
      <p className="text-xs text-muted w-full">
        Updates what everyone who hasn't paid yet owes. Anyone already marked paid keeps their settled amount.
      </p>
    </form>
  );
}
