# Kasa Kai — Game Booking Platform

A pickup-sports game booking platform inspired by [kasakai.in](https://www.kasakai.in): hosts create scheduled games at a venue, and other players discover and book individual spots — not the whole venue.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark/neon theme matching the reference app
- **Prisma + SQLite** (swap `DATABASE_URL` for Postgres/MySQL in production)
- **NextAuth** (credentials login, host vs player role)

## Core model

- A **host** creates a **Game**: venue, date/time, format (e.g. `6v6`), price per spot, capacity.
- **Players** browse games (filterable by date, time, format, price, spots) and **book** a spot, optionally bringing up to 4 guests, paid from their **wallet**.
- If a game is full, players can **join the waitlist**. When a confirmed player cancels, the longest-waiting eligible waitlisted player is automatically promoted and charged.
- Cancelling a booking **≥4 hours before kickoff** refunds it in full to the wallet; later cancellations forfeit the fee.
- If a **host cancels a game**, every confirmed player is refunded automatically.

## Getting started

```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db and applies the schema
npm run seed                         # seeds demo venues, games, and users
npm run dev
```

Visit `http://localhost:3000`.

### Demo accounts (all use password `password123`)

| Email | Role | Notes |
| --- | --- | --- |
| `sumeet@kasakai.demo` | Host + player | Wallet starts at ₹0 — try the "insufficient balance" flow, then top up. |
| `kanha@kasakai.demo` | Host + player | Hosts several seeded games. |
| `karan@kasakai.demo` | Host + player | Hosts several seeded games. |
| `player1@kasakai.demo` … `player14@kasakai.demo` | Player | Prefilled wallet balances. |

## Project layout

- `src/app/(app)/*` — authenticated pages (Browse Games, My Bookings, Cancelled Events, Completed Games, Wallet, Host, Feedback, FAQ, Notifications, Profile)
- `src/app/api/*` — booking, waitlist, cancellation, wallet top-up, game creation, feedback endpoints
- `src/lib/game.ts` — spots/badge computation shared by list and detail views
- `src/lib/booking.ts` — waitlist promotion logic
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo data matching the reference app's screenshots

## Notes / next steps for a production version

- Wallet top-up is mocked (no real payment gateway wired in).
- Auth is a simple seeded credentials flow — swap in a real signup flow + OAuth as needed.
- No image uploads for venues/games yet; venue "photos" aren't modeled.
