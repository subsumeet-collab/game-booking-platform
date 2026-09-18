import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime, gameBadge, spotsLeft, spotsTaken } from "@/lib/game";
import { GameCard, type GameCardData } from "@/components/GameCard";
import { Filters } from "@/components/Filters";

export default async function BrowseGamesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  const city = user?.city ?? "Mumbai";

  const games = await prisma.game.findMany({
    where: { venue: { city }, status: { not: "CANCELLED" } },
    include: { venue: true, bookings: { include: { user: true } } },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  let cards: GameCardData[] = games.map((g) => {
    const badge = gameBadge(g, now);
    const participants = g.bookings
      .filter((b) => b.status === "CONFIRMED")
      .map((b) => b.user.name);
    return {
      id: g.id,
      title: g.title,
      venueName: g.venue.name,
      city: g.venue.city,
      dateISO: g.date.toISOString(),
      dateLabel: formatGameDate(g.date),
      timeLabel: formatGameTime(g.date),
      format: g.format,
      pricePerSpot: g.pricePerSpot,
      capacity: g.capacity,
      spotsTaken: spotsTaken(g),
      spotsLeft: spotsLeft(g),
      badge,
      participants,
      cancellationPolicy: g.cancellationPolicy,
    };
  });

  // Hide completed games from the browse list; they live under "Completed Games".
  cards = cards.filter((c) => c.badge !== "COMPLETED");

  const { date, time, format, price, spots, sort } = searchParams;

  if (date) {
    cards = cards.filter((c) => {
      const d = new Date(c.dateISO);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayDiff = Math.round(
        (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - startOfToday.getTime()) /
          86_400_000
      );
      if (date === "today") return dayDiff === 0;
      if (date === "tomorrow") return dayDiff === 1;
      if (date === "week") return dayDiff >= 0 && dayDiff <= 7;
      return true;
    });
  }

  if (time) {
    cards = cards.filter((c) => {
      const h = new Date(c.dateISO).getHours();
      if (time === "morning") return h < 12;
      if (time === "afternoon") return h >= 12 && h < 17;
      if (time === "evening") return h >= 17;
      return true;
    });
  }

  if (format) cards = cards.filter((c) => c.format === format);
  if (price) cards = cards.filter((c) => c.pricePerSpot <= Number(price));
  if (spots === "available") cards = cards.filter((c) => c.spotsLeft > 0);

  if (sort === "price_low") cards.sort((a, b) => a.pricePerSpot - b.pricePerSpot);
  else if (sort === "price_high") cards.sort((a, b) => b.pricePerSpot - a.pricePerSpot);
  else cards.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());

  const hasLive = cards.some((c) => c.badge === "LIVE");

  return (
    <div>
      {hasLive && (
        <span className="pill bg-live/20 text-live border border-live inline-flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-live inline-block" /> LIVE
        </span>
      )}
      <h1 className="text-4xl font-black mb-6">
        Your Football <span className="text-accent">World</span>
      </h1>

      <Filters />

      {cards.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          No games match your filters in {city} right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
