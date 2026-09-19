import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CityForm } from "@/components/CityForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-black mb-6">Profile</h1>
        <div className="card space-y-3">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-accent text-black font-bold flex items-center justify-center text-xl">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-muted text-sm">{user.email}</p>
            </div>
          </div>
          <Row label="Role" value={user.isHost ? "Host & Player" : "Player"} />
          <Row label="City" value={user.city} />
          <Row label="Member Since" value={user.createdAt.toLocaleDateString("en-IN")} />
        </div>
      </div>
      <div>
        <CityForm currentCity={user.city} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2 last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
}
