import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime, payableBookings } from "@/lib/game";
import { PaidToggleButton } from "@/components/PaidToggleButton";

export default async function AllPaymentsPage() {
  const session = await getServerSession(authOptions);
  const me = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!me?.isHost) redirect("/");

  const games = await prisma.game.findMany({
    where: { hostId: me.id, status: { not: "CANCELLED" } },
    include: { venue: true, bookings: { include: { user: true } } },
    orderBy: { date: "desc" },
  });

  type Row = {
    bookingId: string;
    playerName: string;
    gameId: string;
    gameTitle: string;
    dateLabel: string;
    timeLabel: string;
    amountDue: number;
    paid: boolean;
    priceSet: boolean;
  };

  const rows: Row[] = games.flatMap((g) =>
    payableBookings(g).map((b) => ({
      bookingId: b.id,
      playerName: b.user.name,
      gameId: g.id,
      gameTitle: g.title,
      dateLabel: formatGameDate(g.date),
      timeLabel: formatGameTime(g.date),
      amountDue: b.amountDue,
      paid: b.paid,
      priceSet: g.pricePerSpot !== null,
    }))
  );

  rows.sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1; // unpaid first
    return b.amountDue - a.amountDue;
  });

  const byPlayer = new Map<string, { owed: number; paid: number }>();
  for (const r of rows) {
    const entry = byPlayer.get(r.playerName) ?? { owed: 0, paid: 0 };
    if (r.paid) entry.paid += r.amountDue;
    else entry.owed += r.amountDue;
    byPlayer.set(r.playerName, entry);
  }
  const playerSummaries = [...byPlayer.entries()]
    .map(([name, totals]) => ({ name, ...totals }))
    .sort((a, b) => b.owed - a.owed);

  const totalOutstanding = rows.filter((r) => !r.paid).reduce((sum, r) => sum + r.amountDue, 0);

  return (
    <div>
      <h1 className="text-3xl font-black mb-1">All Payments</h1>
      <p className="text-muted mb-6">Every payable spot across every game you host.</p>

      <div className="card mb-6 !py-4 text-center">
        <p className="text-[10px] uppercase text-muted">Total Outstanding</p>
        <p className={`text-3xl font-black ${totalOutstanding > 0 ? "text-warn" : "text-live"}`}>
          ₹{totalOutstanding}
        </p>
      </div>

      <h2 className="text-lg font-bold mb-3">By Player</h2>
      {playerSummaries.length === 0 ? (
        <div className="card text-center py-10 text-muted mb-6">No payable bookings yet.</div>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-muted uppercase text-[10px] border-b border-border">
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Owes</th>
                <th className="py-2 pr-4">Paid</th>
              </tr>
            </thead>
            <tbody>
              {playerSummaries.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-semibold">{p.name}</td>
                  <td className={`py-2 pr-4 font-bold ${p.owed > 0 ? "text-warn" : "text-muted"}`}>₹{p.owed}</td>
                  <td className="py-2 pr-4 text-live">₹{p.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">Every Payable Spot</h2>
      {rows.length === 0 ? (
        <div className="card text-center py-10 text-muted">Nothing to show yet.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.bookingId} className="card flex items-center justify-between !py-3 gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{r.playerName}</p>
                <p className="text-xs text-muted truncate">
                  <Link href={`/host/games/${r.gameId}`} className="underline hover:text-white">
                    {r.gameTitle}
                  </Link>{" "}
                  · {r.dateLabel} · {r.timeLabel} · {r.priceSet ? `₹${r.amountDue}` : "price not set"}
                </p>
              </div>
              <PaidToggleButton bookingId={r.bookingId} paid={r.paid} disabled={!r.priceSet} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
