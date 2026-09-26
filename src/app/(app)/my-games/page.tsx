"use client";

import { useEffect, useState } from "react";
import { BookingRow, type BookingRowData } from "@/components/BookingRow";

const NAME_STORAGE_KEY = "gamebooking:playerName";

export default function MyGamesPage() {
  const [name, setName] = useState("");
  const [searched, setSearched] = useState("");
  const [rows, setRows] = useState<BookingRowData[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_STORAGE_KEY);
      if (saved) setName(saved);
    } catch {
      // ignore
    }
  }, []);

  async function find(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters of your name.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/my-games?name=${encodeURIComponent(trimmed)}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setRows(data.rows);
    setTotalOutstanding(data.totalOutstanding);
    setSearched(trimmed);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-1">My Games</h1>
      <p className="text-muted mb-6">
        No account needed — enter the exact name you booked with to see your games, what you owe, and cancel a spot.
      </p>

      <form onSubmit={find} className="card !py-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="block text-xs uppercase text-muted mb-1">Your Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Raj Mehta"
          />
        </div>
        <button className="btn-primary sm:w-auto" disabled={loading}>
          {loading ? "Searching…" : "Find My Games"}
        </button>
      </form>

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {searched && (
        <>
          <div className="card mb-6 !py-4 text-center">
            <p className="text-[10px] uppercase text-muted">Total Outstanding for {searched}</p>
            <p className={`text-3xl font-black ${totalOutstanding > 0 ? "text-warn" : "text-live"}`}>
              ₹{totalOutstanding}
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="card text-center py-16 text-muted">
              No games found for "{searched}". Double-check the spelling you used when booking.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <BookingRow key={r.id} booking={r} playerName={searched} onCancelled={find} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
