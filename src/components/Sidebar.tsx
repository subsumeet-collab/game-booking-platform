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
  { href: "/payments", label: "Outstanding Payments", icon: "💳" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Sidebar({
  user,
}: {
  user: { name: string; isHost: boolean };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-border min-h-screen flex flex-col">
      <div className="p-5 border-b border-border">
        <span className="text-lg font-black tracking-tight">
          Game<span className="text-accent">Booking</span>
        </span>
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
          <>
            <Link
              href="/host"
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                pathname === "/host"
                  ? "bg-panel2 text-accent border-r-2 border-accent"
                  : "text-gray-300 hover:bg-panel2 hover:text-white"
              }`}
            >
              <span>🏟️</span>
              Host a Game
            </Link>
            <Link
              href="/host/payments"
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                pathname === "/host/payments"
                  ? "bg-panel2 text-accent border-r-2 border-accent"
                  : "text-gray-300 hover:bg-panel2 hover:text-white"
              }`}
            >
              <span>📊</span>
              All Payments
            </Link>
          </>
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
      </div>
    </aside>
  );
}
