export function Topbar({ city }: { city: string }) {
  return (
    <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-bg">
      <div className="flex items-center gap-2 bg-panel border border-border rounded-lg px-3 py-2">
        <span>📍</span>
        <div>
          <p className="text-[10px] uppercase text-muted leading-none">Playing in</p>
          <p className="text-sm font-bold leading-tight">{city}</p>
        </div>
      </div>
      <div className="text-xl">🔔</div>
    </header>
  );
}
