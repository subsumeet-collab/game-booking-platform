import { prisma } from "@/lib/prisma";
import type { Booking, Game } from "@prisma/client";
import { spotsLeft } from "@/lib/game";

type GameWithBookings = Game & { bookings: Booking[] };

/**
 * Promotes the longest-waiting WAITLISTED booking into a CONFIRMED one, if a
 * spot has opened up and the waitlisted user can afford it. Skips (leaves
 * waitlisted) anyone who can no longer afford their spot so a later entry
 * gets a chance instead.
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

    const user = await prisma.user.findUnique({ where: { id: entry.userId } });
    if (!user) continue;
    const total = needed * game.pricePerSpot;
    if (user.walletBalance < total) continue;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: entry.id },
        data: { status: "CONFIRMED", totalPaid: total },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: total } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: user.id,
          type: "BOOKING_PAYMENT",
          amount: -total,
          note: `Promoted from waitlist: ${game.title}`,
        },
      }),
    ]);

    free -= needed;
    if (free <= 0) break;
  }
}
