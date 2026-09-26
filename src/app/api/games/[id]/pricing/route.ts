import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ pricePerSpot: z.number().int().min(0).max(10_000) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });

  const game = await prisma.game.findUnique({ where: { id: params.id }, include: { bookings: true } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (game.hostId !== session.user.id) {
    return NextResponse.json({ error: "Only the host of this game can set the price." }, { status: 403 });
  }

  const { pricePerSpot } = parsed.data;

  await prisma.$transaction([
    prisma.game.update({ where: { id: game.id }, data: { pricePerSpot } }),
    // Recompute what's owed for anyone who hasn't paid yet; settled amounts stay as they were.
    ...game.bookings
      .filter((b) => (b.status === "CONFIRMED" || b.forfeited) && !b.paid)
      .map((b) =>
        prisma.booking.update({
          where: { id: b.id },
          data: { amountDue: pricePerSpot * (1 + b.guestCount) },
        })
      ),
  ]);

  return NextResponse.json({ ok: true });
}
