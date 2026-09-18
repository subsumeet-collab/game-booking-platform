"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeedbackForm() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not submit feedback.");
      return;
    }
    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="text-lg font-bold">Leave Feedback</h2>
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
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
}
