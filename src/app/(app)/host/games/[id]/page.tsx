import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime, payableBookings, paymentTotals } from "@/lib/game";
import { PaidToggleButton } from "@/components/PaidToggleButton";

export default async function ManageGamePaymentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!me?.isHost) redirect("/");

  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { venue: true, bookings: { include: { user: true } } },
  });
  if (!game || game.hostId !== me.id) notFound();

  const totals = paymentTotals(game);
  const rows = payableBookings(game).sort((a, b) => a.user.name.localeCompare(b.user.name));

  return (
    <div className="max-w-3xl">
      <Link href="/host" className="text-sm text-muted hover:text-white">
        ← Games You Host
      </Link>
      <h1 className="text-3xl font-black mt-2 mb-1">{game.title}</h1>
      <p className="text-muted mb-6">
        🏟️ {game.venue.name} · 📍 {game.venue.city} · {formatGameDate(game.date)} · {formatGameTime(game.date)}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center !py-4">
          <p className="text-[10px] uppercase text-muted">Total Due</p>
          <p className="text-2xl font-black">₹{totals.due}</p>
        </div>
        <div className="card text-center !py-4">
          <p className="text-[10px] uppercase text-muted">Paid</p>
          <p className="text-2xl font-black text-live">₹{totals.paid}</p>
        </div>
        <div className="card text-center !py-4">
          <p className="text-[10px] uppercase text-muted">Outstanding</p>
          <p className={`text-2xl font-black ${totals.outstanding > 0 ? "text-warn" : "text-live"}`}>
            ₹{totals.outstanding}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-16 text-muted">No payable spots for this game.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((b) => (
            <div key={b.id} className="card flex items-center justify-between !py-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {b.user.name}
                  {b.guestCount > 0 && ` + ${b.guestCount} guest${b.guestCount > 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-muted">
                  {b.status === "CANCELLED" ? "Cancelled late — fee still owed" : "Confirmed"} · ₹{b.amountDue}
                </p>
              </div>
              <PaidToggleButton bookingId={b.id} paid={b.paid} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
