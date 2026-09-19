/*
  Warnings:

  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `totalPaid` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `walletBalance` on the `users` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "wallet_transactions";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "amountDue" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "forfeited" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "bookings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bookings" ("cancelledAt", "createdAt", "gameId", "guestCount", "id", "note", "status", "userId") SELECT "cancelledAt", "createdAt", "gameId", "guestCount", "id", "note", "status", "userId" FROM "bookings";
DROP TABLE "bookings";
ALTER TABLE "new_bookings" RENAME TO "bookings";
CREATE TABLE "new_games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "pricePerSpot" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "cancellationPolicy" TEXT NOT NULL DEFAULT 'Cancel up to 4 hours before kickoff to be let off the hook for the spot fee. Later cancellations still owe the fee.',
    "venueId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "games_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "games_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_games" ("cancellationPolicy", "capacity", "createdAt", "date", "durationMin", "format", "hostId", "id", "pricePerSpot", "status", "title", "venueId") SELECT "cancellationPolicy", "capacity", "createdAt", "date", "durationMin", "format", "hostId", "id", "pricePerSpot", "status", "title", "venueId" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Mumbai',
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("city", "createdAt", "email", "id", "isHost", "name", "passwordHash") SELECT "city", "createdAt", "email", "id", "isHost", "name", "passwordHash" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
