import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryPromoteWaitlist } from "@/lib/booking";

const FULL_REFUND_WINDOW_HOURS = 4;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { game: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return NextResponse.json({ error: "This booking can't be cancelled." }, { status: 400 });
  }

  const wasConfirmed = booking.status === "CONFIRMED";
  const hoursUntil = (booking.game.date.getTime() - Date.now()) / 3_600_000;
  const refund = wasConfirmed && hoursUntil >= FULL_REFUND_WINDOW_HOURS ? booking.totalPaid : 0;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (refund > 0) {
      await tx.user.update({ where: { id: booking.userId }, data: { walletBalance: { increment: refund } } });
      await tx.walletTransaction.create({
        data: {
          userId: booking.userId,
          type: "REFUND",
          amount: refund,
          note: `Refund: ${booking.game.title}`,
        },
      });
    }
  });

  if (wasConfirmed) await tryPromoteWaitlist(booking.gameId);

  return NextResponse.json({
    ok: true,
    refunded: refund,
    forfeited: wasConfirmed && refund === 0 ? booking.totalPaid : 0,
  });
}
