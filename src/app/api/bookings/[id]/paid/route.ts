import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ paid: z.boolean() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { game: true } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.game.hostId !== session.user.id) {
    return NextResponse.json({ error: "Only the host of this game can mark payments." }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { paid: parsed.data.paid },
  });

  return NextResponse.json({ booking: updated });
}
