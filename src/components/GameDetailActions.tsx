"use client";

import { useState } from "react";
import type { GameCardData } from "@/lib/game";
import { BookingModal } from "@/components/BookingModal";
import { ShareGameButton } from "@/components/ShareGameButton";

export function GameDetailActions({ game }: { game: GameCardData }) {
  const [open, setOpen] = useState(false);
  const isFull = game.badge === "FULL";
  const isClosed = game.badge === "CANCELLED" || game.badge === "COMPLETED";

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        {!isClosed && (
          <button onClick={() => setOpen(true)} className={isFull ? "btn-waitlist flex-1" : "btn-primary flex-1"}>
            {isFull ? "📋 Join Waitlist" : "⚽ Book"}
          </button>
        )}
        <ShareGameButton gameId={game.id} title={game.title} />
      </div>
      {open && <BookingModal game={game} onClose={() => setOpen(false)} />}
    </>
  );
}
