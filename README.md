# Game Booking Platform

A pickup-sports game booking platform: hosts create scheduled games at a venue, and other players discover and book individual spots — not the whole venue.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/subsumeet-collab/game-booking-platform)

Click the button above (or see **Deploying to Render** below) to get a live URL on Render's free tier in a couple of minutes.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark/neon theme
- **Prisma + SQLite** (swap `DATABASE_URL` for Postgres/MySQL in production)
- **NextAuth** (credentials login, host vs player role)

## Core model

- A **host** creates a **Game**: venue, date/time, format (e.g. `6v6`), price per spot, capacity.
- **Players** browse games (filterable by date, time, format, price, spots) and **confirm** a spot, optionally bringing up to 4 guests. There's no online payment — players settle up with the host directly (cash, UPI, etc.).
- If a game is full, players can **join the waitlist**. When a confirmed player cancels, the longest-waiting eligible waitlisted player is automatically promoted.
- Cancelling a booking **≥4 hours before kickoff** lets you off the fee; later cancellations still owe it (per the game's cancellation policy) even though the booking itself is cancelled.
- If a **host cancels a game**, every confirmed player is notified and nobody owes anything.
- **Hosts mark who's paid**: from "Games You Host" → "Manage Payments" on any game, a host sees every payable player (confirmed, plus late cancellations that still owe), toggles them paid/unpaid, and sees a live running total of amount due / paid / outstanding for that game.
- **Every player** can see what they owe across all their games on the **Outstanding Payments** page.

## Getting started

```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db and applies the schema
npm run seed                         # seeds demo users and venues (no games)
npm run dev
```

Visit `http://localhost:3000`.

### Demo accounts (all use password `password123`)

| Email | Role | Notes |
| --- | --- | --- |
| `sumeet@example.com` | Host + player | |
| `kanha@example.com` | Host + player | |
| `karan@example.com` | Host + player | |
| `player1@example.com` … `player10@example.com` | Player | |

No games are seeded — log in as a host and create one from the **Host a Game** tab, then join it as another account.

## Deploying to Render

This repo includes a `render.yaml` blueprint.

1. Click the **Deploy to Render** badge above (or in the Render dashboard: **New +** → **Blueprint**, and point it at this repo).
2. Render provisions a free web service and runs the build. First deploy takes a few minutes.
3. Once live, your URL is `https://game-booking-platform.onrender.com` (or a Render-assigned variant if that name is taken — update the `NEXTAUTH_URL` env var on the service to match, then redeploy).

**Persistence note:** the deployed app uses SQLite on the free plan's ephemeral disk, and the start command re-seeds automatically whenever the database is empty (e.g. after a cold start following Render's free-tier spin-down). That means games/bookings you create live may reset after a period of inactivity — fine for demoing the product, not for real usage. For persistent data, point `DATABASE_URL` at a real Postgres instance (Render's own Postgres, Neon, Supabase, etc.) and re-run `npx prisma migrate deploy` against it.

## Project layout

- `src/app/(app)/*` — authenticated pages (Browse Games, My Bookings, Cancelled Events, Completed Games, Outstanding Payments, Host, Feedback, FAQ, Notifications, Profile)
- `src/app/(app)/host/games/[id]` — per-game payment management for hosts
- `src/app/api/*` — booking, waitlist, cancellation, payment-marking, game creation, feedback endpoints
- `src/lib/game.ts` — spots/badge/payment-total computation shared by list and detail views
- `src/lib/booking.ts` — waitlist promotion logic
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo users and venues (no games)

## Notes / next steps for a production version

- No online payment gateway — by design, payments happen off-platform and hosts mark them settled.
- Auth is a simple seeded credentials flow — swap in a real signup flow + OAuth as needed.
- No image uploads for venues/games yet; venue "photos" aren't modeled.
