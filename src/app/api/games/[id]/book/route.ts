import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { spotsLeft } from "@/lib/game";

const bodySchema = z.object({
  playerName: z.string().trim().min(2).max(80),
  guestCount: z.number().int().min(0).max(4).default(0),
  note: z.string().max(500).optional().default(""),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { playerName, guestCount, note } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: params.id }, include: { bookings: true } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (game.status === "CANCELLED") return NextResponse.json({ error: "This game was cancelled." }, { status: 400 });
  if (game.date.getTime() < Date.now()) return NextResponse.json({ error: "This game has already started." }, { status: 400 });

  const existing = game.bookings.find(
    (b) =>
      b.playerName.toLowerCase() === playerName.toLowerCase() &&
      (b.status === "CONFIRMED" || b.status === "WAITLISTED")
  );
  if (existing) return NextResponse.json({ error: "You already have a spot in this game." }, { status: 400 });

  const needed = 1 + guestCount;
  if (needed > spotsLeft(game)) {
    return NextResponse.json(
      { error: "Not enough spots left — join the waitlist instead." },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      gameId: game.id,
      playerName,
      status: "CONFIRMED",
      guestCount,
      amountDue: game.pricePerSpot === null ? 0 : needed * game.pricePerSpot,
      note,
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
