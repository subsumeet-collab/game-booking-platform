# Game Booking Platform

A pickup-sports game booking platform: hosts create scheduled games at a venue, and other players discover and book individual spots — not the whole venue. Players never need an account; only hosts log in.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/subsumeet-collab/game-booking-platform)

Click the button above (or see **Deploying to Render** below) to get a live URL on Render's free tier in a couple of minutes.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark/neon theme
- **Prisma + Postgres** (point `DATABASE_URL` at any Postgres instance — a free one from [Neon](https://neon.tech) works well; Render's free plan gives the app no persistent disk of its own, so a local SQLite file would get wiped on every idle-then-visited restart)
- **NextAuth** (credentials login — hosts only)

## Core model

- **No player accounts.** Browsing, viewing a game, booking a spot, joining a waitlist, cancelling, and checking what you owe are all public — no signup, no password. A player just types their name when confirming a spot.
- **Hosting is limited to a fixed set of accounts** (see `HOSTS` in `prisma/seed.ts`). Only those accounts can log in (via "Host login" at the bottom of the sidebar), and only they see "Host a Game" / "All Payments".
- The **host** creates a **Game**: venue, date/time, format (e.g. `6v6`), capacity, and *optionally* a price per spot — it's fine to leave the price blank and set it later (e.g. once you know the actual turf cost).
- **Players** browse games (filterable by date, time, format, price, spots) and **confirm** a spot by entering their name, optionally bringing up to 4 guests. There's no online payment — players settle up with the host directly (cash, UPI, etc.). The name is remembered in the browser (`localStorage`) so it's pre-filled next time.
- If a game is full, players can **join the waitlist** the same way (name only).
- **My Games** (public, no login): enter the same name you booked with to see every game you're in, what you owe, and cancel a booking. Cancelling requires typing that name again — it's the only "authentication" a player has, matching the trust level of a small group booking app.
- If a confirmed player cancels, the longest-waiting eligible waitlisted player is automatically promoted.
- **Hosts can also remove a player or approve someone off the waitlist by hand**, from "Manage Payments": Remove drops a confirmed or waitlisted player (a confirmed player removed this way keeps owing whatever they already owed, same as a late cancellation) *without* auto-promoting anyone — the freed spot sits open until the host picks who gets it — and Approve promotes a specific waitlisted player, in any order the host wants, not just first-come-first-served. "Games You Host" shows an "N waiting" count next to each game's fill count.
- Cancelling **≥24 hours before kickoff** lets you off the fee; later cancellations still owe it (per the game's cancellation policy) even though the booking itself is cancelled.
- If a **host cancels a game**, every confirmed player is notified and nobody owes anything.
- **Hosts set/update the price and mark who's paid**: from "Games You Host" → "Manage Payments" on any game, the host can set or change the price per spot at any time (recalculating what everyone who hasn't paid yet owes), sees every payable player (confirmed, plus late cancellations that still owe), toggles them paid/unpaid, and sees a live running total of amount due / paid / outstanding for that game.
- **"All Payments"** (host-only) is a single table of every payable booking across every hosted game, plus a per-player total-owed summary — the at-a-glance ledger.
- **Every game has a shareable link** (`/games/[id]`): a plain, public, deep-linkable page with the game's details and a Book/Join Waitlist button. Hit **Share** (on a game card or the detail page) to send just that one game — it uses the native share sheet on mobile (`navigator.share`) and falls back to copying the link on desktop.
- **The whole app is mobile-responsive**: the sidebar becomes a slide-out drawer (hamburger toggle in the top bar) below the `md` breakpoint, and forms/modals collapse to a single column on small screens.

## Getting started

```bash
npm install
# Point DATABASE_URL (in .env) at a Postgres instance — a local one (e.g. `createdb gamebooking`) or a free Neon project both work.
npx prisma migrate dev   # applies the schema
npm run seed             # seeds host account(s) and venues (no games, no players)
npm run dev
```

Visit `http://localhost:3000` — browsing and booking work immediately, no login needed.

### Host login (password `password123`)

| Email |
| --- |
| `sumeet@example.com` |
| `sumeet.tripathy@impactguru.com` |

Log in at `/login` (or "Host login" at the bottom of the sidebar) to reach **Host a Game**. No games are seeded — create one (price is optional, set it later), then open the game's link or browse to it as a normal visitor and book a spot with any name.

## Deploying to Render

This repo includes a `render.yaml` blueprint.

1. Click the **Deploy to Render** badge above (or in the Render dashboard: **New +** → **Blueprint**, and point it at this repo).
2. Render provisions a free web service and runs the build. First deploy takes a few minutes.
3. Once live, your URL is `https://game-booking-platform.onrender.com` (or a Render-assigned variant if that name is taken — update the `NEXTAUTH_URL` env var on the service to match, then redeploy).

**Persistence:** set the `DATABASE_URL` env var on the Render service to a real Postgres connection string (a free [Neon](https://neon.tech) project works well) *before* the first deploy — it's left unset in `render.yaml` (`sync: false`) on purpose so it's set once by hand rather than checked into the blueprint. Render's free web-service plan has no persistent disk, so without this, games/bookings would vanish every time the service spins down from inactivity and back up.

## Project layout

- `src/app/(app)/*` — pages, mostly public (Browse Games, My Games, Feedback, FAQ) plus host-only ones (Host a Game, All Payments)
- `src/app/(app)/host/games/[id]` — per-game payment management for the host (set/update price, mark paid)
- `src/app/(app)/host/payments` — host-only ledger of every payable booking across every game
- `src/app/(app)/my-games` — public lookup-by-name page (bookings, amounts owed, cancel)
- `src/app/(app)/games/[id]` — the shareable single-game detail page
- `src/middleware.ts` — the only auth gate, and it only covers `/host/**`
- `src/components/AppShell.tsx` — mobile drawer state + layout, wraps Sidebar/Topbar; nav adapts to whether a host is logged in
- `src/app/api/my-games` — the name-based lookup used by the My Games page
- `src/app/api/*` — booking, waitlist, cancellation (all name-based), payment-marking, pricing, game creation, feedback endpoints
- `src/lib/game.ts` — spots/badge/payment-total computation shared by list and detail views
- `src/lib/booking.ts` — waitlist promotion logic
- `src/lib/city.ts` — the single city the app serves (no per-user preference since there are no player accounts)
- `prisma/schema.prisma` — data model (`User` = hosts only; `Booking`/`Feedback` store a plain `playerName`/`name`, not an account)
- `prisma/seed.ts` — host account(s) and venues (no games, no player users)

## Notes / next steps for a production version

- No online payment gateway — by design, payments happen off-platform and hosts mark them settled.
- Player identity is just a typed name — no verification at all. Cancelling requires re-typing the same name, which stops accidental mis-clicks but not someone who knows another player's name. That's an intentional tradeoff for a small trusted group; add real accounts back if that stops being true.
- No image uploads for venues/games yet; venue "photos" aren't modeled.
- No self-serve way to add a host — add an entry to `HOSTS` in `prisma/seed.ts` (or edit the DB directly) if that's ever needed.
