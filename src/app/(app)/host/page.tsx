import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime, spotsTaken } from "@/lib/game";
import { CreateGameForm } from "@/components/CreateGameForm";
import { HostGameRow, type HostGameRowData } from "@/components/HostGameRow";

export default async function HostPage() {
  const session = await getServerSession(authOptions);
  const me = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!me?.isHost) redirect("/");

  const games = await prisma.game.findMany({
    where: { hostId: me.id },
    include: { venue: true, bookings: true },
    orderBy: { date: "desc" },
  });

  const now = Date.now();
  const rows: HostGameRowData[] = games.map((g) => ({
    id: g.id,
    title: g.title,
    venueName: g.venue.name,
    city: g.venue.city,
    dateLabel: formatGameDate(g.date),
    timeLabel: formatGameTime(g.date),
    format: g.format,
    pricePerSpot: g.pricePerSpot,
    spotsTaken: spotsTaken(g),
    capacity: g.capacity,
    cancelled: g.status === "CANCELLED",
    past: g.date.getTime() + g.durationMin * 60_000 < now,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black mb-6">Games You Host</h1>
        {rows.length === 0 ? (
          <div className="card text-center py-16 text-muted">
            You haven&apos;t hosted a game yet — create one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((g) => (
              <HostGameRow key={g.id} game={g} />
            ))}
          </div>
        )}
      </div>
      <div>
        <CreateGameForm defaultCity={me.city} />
      </div>
    </div>
  );
}
