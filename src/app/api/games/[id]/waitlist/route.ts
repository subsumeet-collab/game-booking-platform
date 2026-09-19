import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const game = await prisma.game.findUnique({ where: { id: params.id }, include: { bookings: true } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (game.status === "CANCELLED") return NextResponse.json({ error: "This game was cancelled." }, { status: 400 });

  const existing = game.bookings.find(
    (b) => b.userId === session.user.id && (b.status === "CONFIRMED" || b.status === "WAITLISTED")
  );
  if (existing) return NextResponse.json({ error: "You already have a spot in this game." }, { status: 400 });

  const booking = await prisma.booking.create({
    data: { gameId: game.id, userId: session.user.id, status: "WAITLISTED", guestCount: 0, amountDue: 0 },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
