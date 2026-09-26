import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { DEFAULT_CITY } from "@/lib/city";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  return (
    <AppShell user={user ? { name: user.name, isHost: user.isHost } : null} city={DEFAULT_CITY}>
      {children}
    </AppShell>
  );
}
