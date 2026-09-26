import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Host removes a confirmed (or waitlisted) player directly — not a self-cancellation.
 * Deliberately does NOT auto-promote the next waitlisted person: a host removing
 * someone is exactly the moment they want to hand-pick who gets the freed spot via
 * the Approve button, rather than have FIFO claim it before they can decide.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { game: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.game.hostId !== session.user.id) {
    return NextResponse.json({ error: "Only the host of this game can remove a player." }, { status: 403 });
  }
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return NextResponse.json({ error: "This booking is already settled." }, { status: 400 });
  }

  const wasConfirmed = booking.status === "CONFIRMED";
  // Whatever they already owed stays on the books unless it's been paid — being removed
  // by the host isn't the same as being let off the fee.
  const forfeited = wasConfirmed && !booking.paid && booking.amountDue > 0;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED", cancelledAt: new Date(), forfeited },
  });

  return NextResponse.json({ ok: true, forfeited });
}
