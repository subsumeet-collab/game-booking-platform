import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar user={{ name: user.name, walletBalance: user.walletBalance, isHost: user.isHost }} />
      <div className="flex-1 min-w-0">
        <Topbar city={user.city} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
