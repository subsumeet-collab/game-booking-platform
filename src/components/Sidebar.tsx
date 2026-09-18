"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/", label: "Browse Games", icon: "🌐" },
  { href: "/bookings", label: "My Bookings", icon: "📋" },
  { href: "/bookings/cancelled", label: "Cancelled Events", icon: "⛔" },
  { href: "/bookings/completed", label: "Completed Games", icon: "✅" },
  { href: "/feedback", label: "My Feedback", icon: "⭐" },
  { href: "/wallet", label: "Wallet", icon: "💰" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Sidebar({
  user,
}: {
  user: { name: string; walletBalance: number; isHost: boolean };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-border min-h-screen flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="bg-white text-black font-black text-xs px-2 py-1 inline-block leading-tight">
          KASA
          <br />
          KAI
        </div>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-panel2 text-accent border-r-2 border-accent"
                  : "text-gray-300 hover:bg-panel2 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        {user.isHost && (
          <Link
            href="/host"
            className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
              pathname.startsWith("/host")
                ? "bg-panel2 text-accent border-r-2 border-accent"
                : "text-gray-300 hover:bg-panel2 hover:text-white"
            }`}
          >
            <span>🏟️</span>
            Host a Game
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent text-black font-bold flex items-center justify-center text-sm">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-muted hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="card !p-3">
          <p className="text-xs uppercase text-muted mb-1">Wallet Balance</p>
          <p className="text-lg font-bold text-accent">₹{user.walletBalance}</p>
          <Link href="/wallet" className="btn-primary w-full text-center block mt-2 !py-2">
            + Top Up
          </Link>
        </div>
      </div>
    </aside>
  );
}
