"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FORMATS = ["5v5", "6v6", "7v7", "11v11"];

export function CreateGameForm({ defaultCity }: { defaultCity: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [address, setAddress] = useState("");
  const [format, setFormat] = useState("6v6");
  const [date, setDate] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [pricePerSpot, setPricePerSpot] = useState("");
  const [capacity, setCapacity] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        venueName,
        city,
        address,
        format,
        date: new Date(date).toISOString(),
        durationMin,
        pricePerSpot: pricePerSpot === "" ? null : Number(pricePerSpot),
        capacity,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create game.");
      return;
    }
    setSuccess(true);
    setTitle("");
    setVenueName("");
    setAddress("");
    setDate("");
    setPricePerSpot("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="text-lg font-bold">Host a Game</h2>

      <div>
        <label className="block text-xs uppercase text-muted mb-1">Game Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Friday Night Game"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Venue</label>
          <input
            className="input"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Inbox Woods Sports Arena"
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-muted mb-1">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase text-muted mb-1">Address (optional)</label>
        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Date &amp; Time</label>
          <input
            type="datetime-local"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Format</label>
          <select className="input" value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Duration (min)</label>
          <input
            type="number"
            className="input"
            min={30}
            max={240}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Price / Spot (₹, optional)</label>
          <input
            type="number"
            className="input"
            min={0}
            placeholder="Set after the game"
            value={pricePerSpot}
            onChange={(e) => setPricePerSpot(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-muted mb-1">Capacity</label>
          <input
            type="number"
            className="input"
            min={2}
            max={30}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>
      </div>

      <p className="text-xs text-muted -mt-2">
        Don't know the cost yet? Leave price blank and set it later from "Manage Payments" once the game's done.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-live">Game created!</p>}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating…" : "Create Game"}
      </button>
    </form>
  );
}
