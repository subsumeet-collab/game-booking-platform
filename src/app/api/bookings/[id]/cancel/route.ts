import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryPromoteWaitlist } from "@/lib/booking";

const FEE_WAIVER_WINDOW_HOURS = 4;

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
  // Cancel late and the fee is still owed to the host, even though the booking itself is cancelled.
  const forfeited = wasConfirmed && !booking.paid && hoursUntil < FEE_WAIVER_WINDOW_HOURS;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", cancelledAt: new Date(), forfeited },
  });

  if (wasConfirmed) await tryPromoteWaitlist(booking.gameId);

  return NextResponse.json({ ok: true, forfeited });
}
