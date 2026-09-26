import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGameDate, formatGameTime, payableBookings, paymentTotals, spotsLeft } from "@/lib/game";
import { PaidToggleButton } from "@/components/PaidToggleButton";
import { SetPriceForm } from "@/components/SetPriceForm";
import { RemovePlayerButton } from "@/components/RemovePlayerButton";
import { ApproveWaitlistButton } from "@/components/ApproveWaitlistButton";

export default async function ManageGamePaymentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isHost) redirect("/");

  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { venue: true, bookings: true },
  });
  if (!game || game.hostId !== me.id) notFound();

  const totals = paymentTotals(game);
  const rows = payableBookings(game).sort((a, b) => a.playerName.localeCompare(b.playerName));
  const waitlist = game.bookings
    .filter((b) => b.status === "WAITLISTED")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="max-w-3xl">
      <Link href="/host" className="text-sm text-muted hover:text-fg">
        ← Games You Host
      </Link>
      <h1 className="text-3xl font-black mt-2 mb-1">{game.title}</h1>
      <p className="text-muted mb-6">
        🏟️ {game.venue.name} · 📍 {game.venue.city} · {formatGameDate(game.date)} · {formatGameTime(game.date)}
      </p>

      <SetPriceForm gameId={game.id} currentPrice={game.pricePerSpot} />

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

      <h2 className="text-lg font-bold mb-3">Confirmed Players</h2>
      {rows.length === 0 ? (
        <div className="card text-center py-10 text-muted mb-8">No payable spots for this game.</div>
      ) : (
        <div className="space-y-2 mb-8">
          {rows.map((b) => (
            <div key={b.id} className="card flex items-center justify-between !py-3 gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {b.playerName}
                  {b.guestCount > 0 && ` + ${b.guestCount} guest${b.guestCount > 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-muted">
                  {b.status === "CANCELLED" ? "Cancelled late — fee still owed" : "Confirmed"} ·{" "}
                  {game.pricePerSpot === null ? "price not set" : `₹${b.amountDue}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PaidToggleButton bookingId={b.id} paid={b.paid} disabled={game.pricePerSpot === null} />
                {b.status === "CONFIRMED" && <RemovePlayerButton bookingId={b.id} playerName={b.playerName} />}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">Waitlist</h2>
      {waitlist.length === 0 ? (
        <div className="card text-center py-10 text-muted">Nobody's waitlisted for this game.</div>
      ) : (
        <div className="space-y-2">
          {waitlist.map((b, i) => (
            <div key={b.id} className="card flex items-center justify-between !py-3 gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  #{i + 1} {b.playerName}
                  {b.guestCount > 0 && ` + ${b.guestCount} guest${b.guestCount > 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-muted">
                  Waiting since{" "}
                  {b.createdAt.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ApproveWaitlistButton bookingId={b.id} />
                <RemovePlayerButton bookingId={b.id} playerName={b.playerName} />
              </div>
            </div>
          ))}
          {spotsLeft(game) <= 0 && (
            <p className="text-xs text-muted">
              The game is full — approving someone here needs a spot to free up first (or remove a confirmed player).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
