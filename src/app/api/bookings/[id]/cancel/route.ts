import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tryPromoteWaitlist } from "@/lib/booking";

const FEE_WAIVER_WINDOW_HOURS = 24;
const bodySchema = z.object({ playerName: z.string().trim().min(1).max(80) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter your name to cancel." }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { game: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.playerName.toLowerCase() !== parsed.data.playerName.toLowerCase()) {
    return NextResponse.json({ error: "That name doesn't match this booking." }, { status: 403 });
  }
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
