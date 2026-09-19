import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime } from "@/lib/game";
import { BookingRow, type BookingRowData } from "@/components/BookingRow";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session!.user.id,
      status: { in: ["CONFIRMED", "WAITLISTED"] },
      game: { status: { not: "CANCELLED" } },
    },
    include: { game: { include: { venue: true } } },
    orderBy: { game: { date: "asc" } },
  });

  const now = Date.now();
  const rows: BookingRowData[] = bookings
    .filter((b) => b.game.date.getTime() + b.game.durationMin * 60_000 >= now)
    .map((b) => ({
      id: b.id,
      gameTitle: b.game.title,
      venueName: b.game.venue.name,
      city: b.game.venue.city,
      dateLabel: formatGameDate(b.game.date),
      timeLabel: formatGameTime(b.game.date),
      format: b.game.format,
      status: b.status as BookingRowData["status"],
      guestCount: b.guestCount,
      amountDue: b.amountDue,
      paid: b.paid,
      forfeited: b.forfeited,
      cancellable: true,
    }));

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">My Bookings</h1>
      {rows.length === 0 ? (
        <div className="card text-center py-16 text-muted">
          No upcoming bookings yet. Head to Browse Games to join one!
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <BookingRow key={r.id} booking={r} />
          ))}
        </div>
      )}
    </div>
  );
}
