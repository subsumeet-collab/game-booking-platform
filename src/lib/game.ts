import type { Booking, Game, User, Venue } from "@prisma/client";

export type GameWithBookings = Game & { bookings: Booking[] };
export type GameForCard = Game & { venue: Venue; bookings: (Booking & { user: Pick<User, "name"> })[] };

export function spotsTaken(game: GameWithBookings): number {
  return game.bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + 1 + b.guestCount, 0);
}

export function spotsLeft(game: GameWithBookings): number {
  return Math.max(0, game.capacity - spotsTaken(game));
}

export function isFull(game: GameWithBookings): boolean {
  return spotsLeft(game) <= 0;
}

/** Bookings that still owe (or paid) money for this game: confirmed spots, plus late cancellations that forfeited the fee. */
export function payableBookings<B extends Booking>(game: Game & { bookings: B[] }): B[] {
  return game.bookings.filter((b) => b.status === "CONFIRMED" || b.forfeited);
}

export function paymentTotals(game: GameWithBookings): { due: number; paid: number; outstanding: number } {
  const payable = payableBookings(game);
  const due = payable.reduce((sum, b) => sum + b.amountDue, 0);
  const paid = payable.filter((b) => b.paid).reduce((sum, b) => sum + b.amountDue, 0);
  return { due, paid, outstanding: due - paid };
}

export type GameBadge = "LIVE" | "TODAY" | "TOMORROW" | "UPCOMING" | "FULL" | "COMPLETED" | "CANCELLED";

/** Badge shown on the game card: cancelled/completed win, then FULL, then a time-relative badge. */
export function gameBadge(game: GameWithBookings, now: Date = new Date()): GameBadge {
  if (game.status === "CANCELLED") return "CANCELLED";
  if (game.status === "COMPLETED" || game.date.getTime() + game.durationMin * 60_000 < now.getTime()) {
    return "COMPLETED";
  }
  if (isFull(game)) return "FULL";

  const start = game.date.getTime();
  const end = start + game.durationMin * 60_000;
  if (now.getTime() >= start && now.getTime() <= end) return "LIVE";

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfGameDay = new Date(game.date.getFullYear(), game.date.getMonth(), game.date.getDate());
  const dayDiff = Math.round((startOfGameDay.getTime() - startOfToday.getTime()) / 86_400_000);

  if (dayDiff === 0) return "TODAY";
  if (dayDiff === 1) return "TOMORROW";
  return "UPCOMING";
}

export type GameCardData = {
  id: string;
  title: string;
  venueName: string;
  city: string;
  dateISO: string;
  dateLabel: string;
  timeLabel: string;
  format: string;
  pricePerSpot: number | null;
  capacity: number;
  spotsTaken: number;
  spotsLeft: number;
  badge: GameBadge;
  participants: string[];
  cancellationPolicy: string;
};

/** Shared shape used by the game card, the booking modal, and the shareable game-detail page. */
export function buildGameCardData(g: GameForCard, now: Date = new Date()): GameCardData {
  const participants = g.bookings.filter((b) => b.status === "CONFIRMED").map((b) => b.user.name);
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
    badge: gameBadge(g, now),
    participants,
    cancellationPolicy: g.cancellationPolicy,
  };
}

export function pricePerSpotLabel(price: number | null): string {
  return price === null ? "TBD" : `₹${price}`;
}

export function formatGameDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function formatGameTime(d: Date): string {
  return d
    .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toLowerCase()
    .replace(" ", " ");
}
