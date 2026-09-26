import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  title: z.string().min(3).max(120),
  venueName: z.string().min(2).max(120),
  city: z.string().min(2).max(60),
  address: z.string().max(200).optional().default(""),
  format: z.string().min(2).max(10),
  date: z.string(), // ISO datetime-local value
  durationMin: z.number().int().min(30).max(240).default(60),
  pricePerSpot: z.number().int().min(0).max(10_000).nullable().default(null),
  capacity: z.number().int().min(2).max(30),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isHost) return NextResponse.json({ error: "Only hosts can create games." }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const data = parsed.data;

  const gameDate = new Date(data.date);
  if (Number.isNaN(gameDate.getTime()) || gameDate.getTime() < Date.now()) {
    return NextResponse.json({ error: "Pick a valid date/time in the future." }, { status: 400 });
  }

  let venue = await prisma.venue.findFirst({ where: { name: data.venueName, city: data.city } });
  if (!venue) {
    venue = await prisma.venue.create({
      data: { name: data.venueName, city: data.city, address: data.address ?? "" },
    });
  }

  const game = await prisma.game.create({
    data: {
      title: data.title,
      format: data.format,
      date: gameDate,
      durationMin: data.durationMin,
      pricePerSpot: data.pricePerSpot,
      capacity: data.capacity,
      hostId: me.id,
      venueId: venue.id,
    },
  });

  return NextResponse.json({ game }, { status: 201 });
}
