"use client";

import { useState } from "react";

export function ShareGameButton({
  gameId,
  title,
  iconOnly = false,
}: {
  gameId: string;
  title: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/games/${gameId}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={share}
        title="Share this game"
        aria-label="Share this game"
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full border border-border bg-panel2 hover:bg-border transition-colors text-sm"
      >
        {copied ? "✓" : "🔗"}
      </button>
    );
  }

  return (
    <button type="button" onClick={share} className="btn-secondary !py-2.5">
      {copied ? "Link Copied!" : "🔗 Share"}
    </button>
  );
}
