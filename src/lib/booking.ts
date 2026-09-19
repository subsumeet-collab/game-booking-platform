import { prisma } from "@/lib/prisma";
import type { Booking, Game } from "@prisma/client";
import { spotsLeft } from "@/lib/game";

type GameWithBookings = Game & { bookings: Booking[] };

/**
 * Promotes the longest-waiting WAITLISTED booking into a CONFIRMED one, if a
 * spot has opened up. There's no payment gate — hosts settle up separately —
 * so promotion only depends on capacity.
 */
export async function tryPromoteWaitlist(gameId: string) {
  const game = (await prisma.game.findUnique({
    where: { id: gameId },
    include: { bookings: true },
  })) as GameWithBookings | null;
  if (!game) return;

  let free = spotsLeft(game);
  if (free <= 0) return;

  const waitlisted = game.bookings
    .filter((b) => b.status === "WAITLISTED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (const entry of waitlisted) {
    const needed = 1 + entry.guestCount;
    if (needed > free) continue;

    await prisma.booking.update({
      where: { id: entry.id },
      data: { status: "CONFIRMED", amountDue: needed * game.pricePerSpot },
    });

    free -= needed;
    if (free <= 0) break;
  }
}
