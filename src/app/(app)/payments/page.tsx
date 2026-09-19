import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime } from "@/lib/game";

export default async function OutstandingPaymentsPage() {
  const session = await getServerSession(authOptions);

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session!.user.id,
      amountDue: { gt: 0 },
      OR: [{ status: "CONFIRMED" }, { forfeited: true }],
    },
    include: { game: { include: { venue: true } } },
    orderBy: { game: { date: "desc" } },
  });

  const unpaid = bookings.filter((b) => !b.paid);
  const paid = bookings.filter((b) => b.paid);
  const totalOutstanding = unpaid.reduce((sum, b) => sum + b.amountDue, 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-1">Outstanding Payments</h1>
      <p className="text-muted mb-6">
        Hosts collect payment directly and mark you paid once settled — this page just tracks what you owe.
      </p>

      <div className="card mb-6 !py-4 text-center">
        <p className="text-[10px] uppercase text-muted">Total Outstanding</p>
        <p className={`text-3xl font-black ${totalOutstanding > 0 ? "text-warn" : "text-live"}`}>
          ₹{totalOutstanding}
        </p>
      </div>

      <h2 className="text-lg font-bold mb-3">You Owe</h2>
      {unpaid.length === 0 ? (
        <div className="card text-center py-10 text-muted mb-6">Nothing outstanding — you're all settled up.</div>
      ) : (
        <div className="space-y-2 mb-6">
          {unpaid.map((b) => (
            <div key={b.id} className="card flex items-center justify-between !py-3">
              <div>
                <p className="font-semibold">{b.game.title}</p>
                <p className="text-xs text-muted">
                  🏟️ {b.game.venue.name} · {formatGameDate(b.game.date)} · {formatGameTime(b.game.date)}
                  {b.forfeited && " · cancelled late"}
                </p>
              </div>
              <span className="font-bold text-warn">₹{b.amountDue}</span>
            </div>
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3">Paid</h2>
          <div className="space-y-2">
            {paid.map((b) => (
              <div key={b.id} className="card flex items-center justify-between !py-3">
                <div>
                  <p className="font-semibold">{b.game.title}</p>
                  <p className="text-xs text-muted">
                    🏟️ {b.game.venue.name} · {formatGameDate(b.game.date)} · {formatGameTime(b.game.date)}
                  </p>
                </div>
                <span className="font-bold text-live">₹{b.amountDue}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
