"use client";

import { useState } from "react";
import type { GameBadge } from "@/lib/game";
import { BookingModal } from "@/components/BookingModal";

export type GameCardData = {
  id: string;
  title: string;
  venueName: string;
  city: string;
  dateISO: string;
  dateLabel: string;
  timeLabel: string;
  format: string;
  pricePerSpot: number;
  capacity: number;
  spotsTaken: number;
  spotsLeft: number;
  badge: GameBadge;
  participants: string[];
  cancellationPolicy: string;
};

const BADGE_STYLES: Record<GameBadge, string> = {
  LIVE: "bg-live/20 text-live border border-live",
  TODAY: "bg-panel2 text-white border border-border",
  TOMORROW: "bg-panel2 text-white border border-border",
  UPCOMING: "bg-panel2 text-white border border-border",
  FULL: "bg-danger/20 text-danger border border-danger",
  COMPLETED: "bg-panel2 text-muted border border-border",
  CANCELLED: "bg-danger/20 text-danger border border-danger",
};

const CARD_BORDER: Record<GameBadge, string> = {
  LIVE: "border-live/60",
  TODAY: "border-border",
  TOMORROW: "border-border",
  UPCOMING: "border-border",
  FULL: "border-danger/60",
  COMPLETED: "border-border",
  CANCELLED: "border-danger/60",
};

function participantSummary(names: string[]): string {
  if (names.length === 0) return "Be the first to join";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others`;
}

export function GameCard({ game }: { game: GameCardData }) {
  const [open, setOpen] = useState(false);
  const isFull = game.badge === "FULL";
  const isClosed = game.badge === "CANCELLED" || game.badge === "COMPLETED";
  const fillPct = Math.min(100, Math.round((game.spotsTaken / game.capacity) * 100));

  return (
    <>
      <div className={`card border ${CARD_BORDER[game.badge]} flex flex-col`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`pill flex items-center gap-1.5 ${BADGE_STYLES[game.badge]}`}>
            {game.badge === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-live inline-block" />}
            {game.badge}
          </span>
          <span className="text-xl font-black">₹{game.pricePerSpot}</span>
        </div>

        <h3 className="text-lg font-bold mb-1 truncate" title={game.title}>
          {game.title}
        </h3>
        <p className="text-sm text-muted mb-4 flex items-center gap-1 truncate">
          🏟️ {game.venueName} <span className="mx-1">📍</span> {game.city}
        </p>

        <div className="grid grid-cols-3 gap-2 bg-panel2 border border-border rounded-lg p-3 mb-4 text-center">
          <div>
            <p className="text-[10px] uppercase text-muted">Date</p>
            <p className="text-sm font-bold">{game.dateLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted">Time</p>
            <p className="text-sm font-bold">{game.timeLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted">Format</p>
            <p className="text-sm font-bold">{game.format}</p>
          </div>
        </div>

        <p className="text-sm text-muted mb-2 truncate">{participantSummary(game.participants)}</p>

        <div className="mb-4">
          <div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
            <div
              className={`h-full ${isFull ? "bg-danger" : "bg-accent"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1 text-right">
            {game.spotsTaken} of {game.capacity}
          </p>
        </div>

        <div className="flex gap-2 mt-auto">
          {!isClosed && (
            <button
              onClick={() => setOpen(true)}
              className={isFull ? "btn-waitlist flex-1" : "btn-primary flex-1"}
            >
              {isFull ? "📋 Join Waitlist" : "⚽ Book"}
            </button>
          )}
          <button onClick={() => setOpen(true)} className="btn-secondary flex-1">
            View More Details →
          </button>
        </div>
      </div>

      {open && <BookingModal game={game} onClose={() => setOpen(false)} />}
    </>
  );
}
