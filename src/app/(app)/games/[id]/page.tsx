import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildGameCardData, pricePerSpotLabel } from "@/lib/game";
import { GameDetailActions } from "@/components/GameDetailActions";

const BADGE_STYLES: Record<string, string> = {
  LIVE: "bg-live/20 text-live border border-live",
  TODAY: "bg-panel2 text-fg border border-border",
  TOMORROW: "bg-panel2 text-fg border border-border",
  UPCOMING: "bg-panel2 text-fg border border-border",
  FULL: "bg-danger/20 text-danger border border-danger",
  COMPLETED: "bg-panel2 text-muted border border-border",
  CANCELLED: "bg-danger/20 text-danger border border-danger",
};

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { venue: true, bookings: true },
  });
  if (!game) notFound();

  const data = buildGameCardData(game);
  const fillPct = Math.min(100, Math.round((data.spotsTaken / data.capacity) * 100));

  return (
    <div className="max-w-2xl">
      <Link href="/" className="text-sm text-muted hover:text-fg">
        ← Browse Games
      </Link>

      <div className="card mt-3">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className={`pill flex items-center gap-1.5 ${BADGE_STYLES[data.badge]}`}>
            {data.badge === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-live inline-block" />}
            {data.badge}
          </span>
          <span className={`text-2xl font-black ${data.pricePerSpot === null ? "text-muted text-base uppercase" : ""}`}>
            {pricePerSpotLabel(data.pricePerSpot)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-1">{data.title}</h1>
        <p className="text-muted mb-6 flex items-center gap-1">
          🏟️ {data.venueName} <span className="mx-1">📍</span> {data.city}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-panel2 border border-border rounded-lg p-4 mb-6 text-center">
          <div>
            <p className="text-[10px] uppercase text-muted">Date</p>
            <p className="text-sm font-bold">{data.dateLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted">Time</p>
            <p className="text-sm font-bold">{data.timeLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted">Format</p>
            <p className="text-sm font-bold">{data.format}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted">Spots Left</p>
            <p className="text-sm font-bold">{data.spotsLeft}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold mb-2">
            {data.participants.length === 0 ? "Nobody's joined yet" : "Who's in"}
          </p>
          {data.participants.length > 0 && (
            <p className="text-sm text-muted mb-3">{data.participants.join(", ")}</p>
          )}
          <div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
            <div
              className={`h-full ${data.badge === "FULL" ? "bg-danger" : "bg-accent"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1 text-right">
            {data.spotsTaken} of {data.capacity}
          </p>
        </div>

        <p className="text-xs text-muted mb-6">{data.cancellationPolicy}</p>

        <GameDetailActions game={data} />
      </div>
    </div>
  );
}
