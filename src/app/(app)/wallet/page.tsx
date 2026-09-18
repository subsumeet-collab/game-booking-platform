import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopUpForm } from "@/components/TopUpForm";

const TYPE_LABEL: Record<string, string> = {
  TOPUP: "Top-up",
  BOOKING_PAYMENT: "Booking",
  REFUND: "Refund",
};

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  const txns = await prisma.walletTransaction.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black mb-1">Wallet</h1>
        <p className="text-muted mb-6">Balance: <span className="text-accent font-bold">₹{user?.walletBalance ?? 0}</span></p>

        <div className="space-y-2">
          {txns.length === 0 ? (
            <div className="card text-center py-12 text-muted">No transactions yet.</div>
          ) : (
            txns.map((t) => (
              <div key={t.id} className="card flex items-center justify-between !py-3">
                <div>
                  <p className="font-semibold text-sm">{TYPE_LABEL[t.type] ?? t.type}</p>
                  <p className="text-xs text-muted">{t.note}</p>
                  <p className="text-xs text-muted">{t.createdAt.toLocaleString("en-IN")}</p>
                </div>
                <span className={`font-bold ${t.amount < 0 ? "text-danger" : "text-live"}`}>
                  {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <TopUpForm />
      </div>
    </div>
  );
}
