-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "pricePerSpot" INTEGER,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "cancellationPolicy" TEXT NOT NULL DEFAULT 'Cancel up to 24 hours before kickoff to be let off the hook for the spot fee. Later cancellations still owe the fee.',
    "venueId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "games_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "games_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_games" ("cancellationPolicy", "capacity", "createdAt", "date", "durationMin", "format", "hostId", "id", "pricePerSpot", "status", "title", "venueId") SELECT "cancellationPolicy", "capacity", "createdAt", "date", "durationMin", "format", "hostId", "id", "pricePerSpot", "status", "title", "venueId" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
