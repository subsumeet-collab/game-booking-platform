"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [200, 500, 1000, 2000];

export function TopUpForm() {
  const router = useRouter();
  const [amount, setAmount] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Top-up failed.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Top Up Wallet</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`pill border text-center ${
              amount === p ? "bg-accent text-black border-accent" : "bg-panel2 border-border"
            }`}
          >
            ₹{p}
          </button>
        ))}
      </div>
      <label className="block text-xs uppercase text-muted mb-1">Custom amount</label>
      <input
        type="number"
        min={50}
        max={50000}
        className="input mb-4"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      {error && <p className="text-sm text-danger mb-3">{error}</p>}
      {success && <p className="text-sm text-live mb-3">Wallet topped up successfully.</p>}
      <button className="btn-primary w-full" onClick={submit} disabled={loading || amount < 50}>
        {loading ? "Processing…" : `Add ₹${amount}`}
      </button>
      <p className="text-xs text-muted mt-3">Demo wallet — no real payment is processed.</p>
    </div>
  );
}
