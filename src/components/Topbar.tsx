export function Topbar({ city, onMenuClick }: { city: string; onMenuClick: () => void }) {
  return (
    <header className="h-16 border-b border-border flex items-center px-4 sm:px-6 justify-between bg-bg gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-border bg-panel text-lg"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex items-center gap-2 bg-panel border border-border rounded-lg px-3 py-2 min-w-0">
          <span>📍</span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-muted leading-none">Playing in</p>
            <p className="text-sm font-bold leading-tight truncate">{city}</p>
          </div>
        </div>
      </div>
      <div className="text-xl shrink-0">🔔</div>
    </header>
  );
}
