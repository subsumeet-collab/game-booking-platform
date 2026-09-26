"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const PUBLIC_NAV = [
  { href: "/", label: "Browse Games", icon: "🌐" },
  { href: "/my-games", label: "My Games", icon: "📋" },
  { href: "/feedback", label: "Feedback", icon: "⭐" },
  { href: "/faq", label: "FAQ", icon: "❓" },
];

export function Sidebar({
  user,
  mobileOpen,
  onClose,
}: {
  user: { name: string; isHost: boolean } | null;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-panel border-r border-border min-h-screen flex flex-col transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <span className="text-lg font-black tracking-tight">
            Game<span className="text-accent">Booking</span>
          </span>
          <button onClick={onClose} className="md:hidden text-muted hover:text-fg text-xl leading-none" aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {PUBLIC_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-panel2 text-accent border-r-2 border-accent"
                    : "text-muted hover:bg-panel2 hover:text-fg"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {user?.isHost && (
            <>
              <div className="px-5 pt-4 pb-1 text-[10px] uppercase tracking-wide text-muted">Host</div>
              <Link
                href="/host"
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  pathname === "/host"
                    ? "bg-panel2 text-accent border-r-2 border-accent"
                    : "text-muted hover:bg-panel2 hover:text-fg"
                }`}
              >
                <span>🏟️</span>
                Host a Game
              </Link>
              <Link
                href="/host/payments"
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  pathname === "/host/payments"
                    ? "bg-panel2 text-accent border-r-2 border-accent"
                    : "text-muted hover:bg-panel2 hover:text-fg"
                }`}
              >
                <span>📊</span>
                All Payments
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent text-black font-bold flex items-center justify-center text-sm shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs text-muted hover:text-fg"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" onClick={onClose} className="text-xs text-muted hover:text-fg">
              Host login →
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
