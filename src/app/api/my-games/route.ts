import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime } from "@/lib/game";

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name")?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter at least 2 characters of your name." }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    include: { game: { include: { venue: true } } },
    orderBy: { game: { date: "desc" } },
  });

  const matches = bookings.filter((b) => b.playerName.trim().toLowerCase() === name.toLowerCase());

  const now = Date.now();
  const rows = matches.map((b) => {
    const isPast = b.game.date.getTime() + b.game.durationMin * 60_000 < now;
    const status = b.status === "CONFIRMED" && isPast ? "COMPLETED" : b.status;
    return {
      id: b.id,
      gameTitle: b.game.title,
      venueName: b.game.venue.name,
      city: b.game.venue.city,
      dateLabel: formatGameDate(b.game.date),
      timeLabel: formatGameTime(b.game.date),
      format: b.game.format,
      status,
      guestCount: b.guestCount,
      amountDue: b.amountDue,
      paid: b.paid,
      forfeited: b.forfeited,
      cancellable: (b.status === "CONFIRMED" || b.status === "WAITLISTED") && !isPast,
    };
  });

  const totalOutstanding = rows
    .filter((r) => !r.paid && r.amountDue > 0 && (r.status === "CONFIRMED" || r.forfeited))
    .reduce((sum, r) => sum + r.amountDue, 0);

  return NextResponse.json({ rows, totalOutstanding });
}
