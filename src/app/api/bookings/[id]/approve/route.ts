import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spotsLeft } from "@/lib/game";

/** Host manually promotes a specific waitlisted booking, out of FIFO order if they want. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { game: { include: { bookings: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.game.hostId !== session.user.id) {
    return NextResponse.json({ error: "Only the host of this game can approve a waitlisted player." }, { status: 403 });
  }
  if (booking.status !== "WAITLISTED") {
    return NextResponse.json({ error: "This booking isn't on the waitlist." }, { status: 400 });
  }

  const needed = 1 + booking.guestCount;
  if (needed > spotsLeft(booking.game)) {
    return NextResponse.json({ error: "Not enough spots left to approve this player." }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      amountDue: booking.game.pricePerSpot === null ? 0 : needed * booking.game.pricePerSpot,
    },
  });

  return NextResponse.json({ booking: updated });
}
