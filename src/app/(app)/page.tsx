import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildGameCardData, type GameCardData } from "@/lib/game";
import { DEFAULT_CITY } from "@/lib/city";
import { GameCard } from "@/components/GameCard";
import { Filters } from "@/components/Filters";

export default async function BrowseGamesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const city = DEFAULT_CITY;

  const games = await prisma.game.findMany({
    where: { venue: { city }, status: { not: "CANCELLED" } },
    include: { venue: true, bookings: true },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  let cards: GameCardData[] = games.map((g) => buildGameCardData(g, now));

  // Hide completed games from the browse list — they're only useful to look up via My Games.
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
  // A TBD price might still end up affordable, so don't filter those out.
  if (price) cards = cards.filter((c) => c.pricePerSpot === null || c.pricePerSpot <= Number(price));
  if (spots === "available") cards = cards.filter((c) => c.spotsLeft > 0);

  if (sort === "price_low") cards.sort((a, b) => (a.pricePerSpot ?? Infinity) - (b.pricePerSpot ?? Infinity));
  else if (sort === "price_high") cards.sort((a, b) => (b.pricePerSpot ?? -Infinity) - (a.pricePerSpot ?? -Infinity));
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
        Our Sporting <span className="text-accent">Club</span>
      </h1>

      <Link
        href="/my-games"
        className="card !py-3 mb-6 flex items-center justify-between hover:bg-panel2 transition-colors block"
      >
        <span className="text-sm">Already booked a spot? Look up what you owe and manage it.</span>
        <span className="text-sm text-muted">My Games →</span>
      </Link>

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
