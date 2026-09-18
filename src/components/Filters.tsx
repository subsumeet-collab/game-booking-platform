"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const FORMATS = ["5v5", "6v6", "7v7", "11v11"];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = params.toString().length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="pill bg-panel2 border border-border flex items-center gap-1">⚙️ Filters</span>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("date") || ""}
        onChange={(e) => set("date", e.target.value)}
      >
        <option value="">Date ▾</option>
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="week">This week</option>
      </select>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("time") || ""}
        onChange={(e) => set("time", e.target.value)}
      >
        <option value="">Time ▾</option>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
      </select>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("format") || ""}
        onChange={(e) => set("format", e.target.value)}
      >
        <option value="">Format ▾</option>
        {FORMATS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("price") || ""}
        onChange={(e) => set("price", e.target.value)}
      >
        <option value="">Price ▾</option>
        <option value="200">Under ₹200</option>
        <option value="300">Under ₹300</option>
        <option value="500">Under ₹500</option>
      </select>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("spots") || ""}
        onChange={(e) => set("spots", e.target.value)}
      >
        <option value="">Spots ▾</option>
        <option value="available">Spots available</option>
      </select>

      <select
        className="pill bg-panel2 border border-border cursor-pointer"
        value={params.get("sort") || ""}
        onChange={(e) => set("sort", e.target.value)}
      >
        <option value="">Starting soonest ▾</option>
        <option value="soonest">Starting soonest</option>
        <option value="price_low">Price: low to high</option>
        <option value="price_high">Price: high to low</option>
      </select>

      {hasFilters && (
        <button onClick={clearAll} className="text-xs text-muted underline ml-2">
          Clear all
        </button>
      )}
    </div>
  );
}
