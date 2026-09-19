import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime } from "@/lib/game";
import { BookingRow, type BookingRowData } from "@/components/BookingRow";

export default async function CancelledEventsPage() {
  const session = await getServerSession(authOptions);

  const bookings = await prisma.booking.findMany({
    where: { userId: session!.user.id, status: "CANCELLED" },
    include: { game: { include: { venue: true } } },
    orderBy: { cancelledAt: "desc" },
  });

  const rows: BookingRowData[] = bookings.map((b) => ({
    id: b.id,
    gameTitle: b.game.title,
    venueName: b.game.venue.name,
    city: b.game.venue.city,
    dateLabel: formatGameDate(b.game.date),
    timeLabel: formatGameTime(b.game.date),
    format: b.game.format,
    status: "CANCELLED",
    guestCount: b.guestCount,
    amountDue: b.amountDue,
    paid: b.paid,
    forfeited: b.forfeited,
    cancellable: false,
  }));

  return (
    <div>
      <h1 className="text-3xl font-black mb-6">Cancelled Events</h1>
      {rows.length === 0 ? (
        <div className="card text-center py-16 text-muted">Nothing cancelled — long may it stay that way.</div>
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
