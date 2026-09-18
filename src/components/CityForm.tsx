"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad"];

export function CityForm({ currentCity }: { currentCity: string }) {
  const router = useRouter();
  const [city, setCity] = useState(currentCity);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    setSaved(false);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Playing City</h2>
      <select className="input mb-4" value={city} onChange={(e) => setCity(e.target.value)}>
        {CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {saved && <p className="text-sm text-live mb-3">Saved!</p>}
      <button className="btn-primary w-full" onClick={save} disabled={loading || city === currentCity}>
        {loading ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
