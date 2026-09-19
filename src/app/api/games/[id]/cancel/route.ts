import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const game = await prisma.game.findUnique({ where: { id: params.id } });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (game.hostId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (game.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled." }, { status: 400 });

  // Host cancelled — nobody owes anything for a game that didn't happen.
  await prisma.$transaction([
    prisma.game.update({ where: { id: game.id }, data: { status: "CANCELLED" } }),
    prisma.booking.updateMany({
      where: { gameId: game.id, status: { in: ["CONFIRMED", "WAITLISTED"] } },
      data: { status: "CANCELLED", cancelledAt: new Date(), forfeited: false, amountDue: 0 },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
