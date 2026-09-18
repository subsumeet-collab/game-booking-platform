import type { Booking, Game } from "@prisma/client";

export type GameWithBookings = Game & { bookings: Booking[] };

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

export function pricePerSpotLabel(price: number): string {
  return `₹${price}`;
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
