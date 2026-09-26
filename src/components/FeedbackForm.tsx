"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeedbackForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not submit feedback.");
      return;
    }
    setComment("");
    setSent(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="text-lg font-bold">Leave Feedback</h2>
      <div>
        <label className="block text-xs uppercase text-muted mb-1">Name (optional)</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-accent" : "text-border"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="How was your experience?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {sent && <p className="text-sm text-live">Thanks for the feedback!</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}
