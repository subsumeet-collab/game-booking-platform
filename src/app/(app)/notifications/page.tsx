import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Notification = { id: string; text: string; at: Date; icon: string };

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const notifications: Notification[] = bookings
    .map((b) => ({
      id: `booking-${b.id}`,
      icon: b.status === "CANCELLED" ? "⛔" : b.status === "WAITLISTED" ? "📋" : "✅",
      text:
        b.status === "CANCELLED"
          ? b.forfeited
            ? `Your booking for "${b.game.title}" was cancelled — the spot fee is still owed.`
            : `Your booking for "${b.game.title}" was cancelled.`
          : b.status === "WAITLISTED"
            ? `You joined the waitlist for "${b.game.title}".`
            : `You're confirmed for "${b.game.title}".`,
      at: b.cancelledAt ?? b.createdAt,
    }))
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="card text-center py-16 text-muted">You&apos;re all caught up.</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="card !py-3 flex items-start gap-3">
              <span className="text-xl">{n.icon}</span>
              <div>
                <p className="text-sm">{n.text}</p>
                <p className="text-xs text-muted">{n.at.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
