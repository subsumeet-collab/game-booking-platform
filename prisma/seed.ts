import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITY = "Mumbai";
const PASSWORD = "password123";

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function upsertUser(opts: {
  name: string;
  email: string;
  city?: string;
  walletBalance?: number;
  isHost?: boolean;
}) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: {
      name: opts.name,
      email: opts.email,
      passwordHash,
      city: opts.city ?? CITY,
      walletBalance: opts.walletBalance ?? 1000,
      isHost: opts.isHost ?? false,
    },
  });
}

async function upsertVenue(name: string, city: string, address: string) {
  const existing = await prisma.venue.findFirst({ where: { name, city } });
  if (existing) return existing;
  return prisma.venue.create({ data: { name, city, address } });
}

async function main() {
  const existingGames = await prisma.game.count();
  if (existingGames > 0) {
    console.log(`Database already has ${existingGames} game(s) — skipping seed.`);
    return;
  }

  console.log("Seeding…");

  const sumeet = await upsertUser({
    name: "Sumeet Kumar",
    email: "sumeet@kasakai.demo",
    walletBalance: 0,
    isHost: true,
  });

  const kanha = await upsertUser({ name: "Kanha Bhave", email: "kanha@kasakai.demo", isHost: true });
  const karan = await upsertUser({ name: "Karan Singh", email: "karan@kasakai.demo", isHost: true });

  const others = await Promise.all(
    [
      "Raj Mehta",
      "Nimish Sanghavi",
      "Dhruv Ashok",
      "Suman Dhakad",
      "Pratik Mewada",
      "Aditi Rao",
      "Farhan Sheikh",
      "Vivek Nair",
      "Ishaan Kapoor",
      "Meera Joshi",
      "Ayaan Qureshi",
      "Rohan Desai",
      "Sanya Kapoor",
      "Tanmay Joshi",
    ].map((name, i) =>
      upsertUser({
        name,
        email: `player${i + 1}@kasakai.demo`,
        walletBalance: 800 + i * 50,
      })
    )
  );

  const inboxWoods = await upsertVenue("Inbox Woods Sports Arena", CITY, "Andheri East, Mumbai");
  const daSilvaTurf = await upsertVenue("Dr. Antonio Da Silva Turf", CITY, "Dadar West, Mumbai");
  const nidhivanTurf = await upsertVenue("Nidhivan Turf, Malad", CITY, "Malad West, Mumbai");

  async function confirmBooking(gameId: string, userId: string, pricePerSpot: number, guestCount = 0) {
    const totalPaid = pricePerSpot * (1 + guestCount);
    await prisma.booking.create({
      data: { gameId, userId, status: "CONFIRMED", guestCount, totalPaid },
    });
  }

  // Game 1 — today, 6v6, plenty of spots left (7 of 12)
  const game1 = await prisma.game.create({
    data: {
      title: "Friday Night Game | Inbox Woods",
      format: "6v6",
      date: at(0, 21, 0),
      durationMin: 90,
      pricePerSpot: 220,
      capacity: 12,
      hostId: kanha.id,
      venueId: inboxWoods.id,
    },
  });
  for (const u of [kanha, ...others.slice(0, 6)]) {
    await confirmBooking(game1.id, u.id, 220);
  }

  // Game 2 — today, FULL
  const game2 = await prisma.game.create({
    data: {
      title: "Dadar Turf meet",
      format: "6v6",
      date: at(0, 21, 0),
      durationMin: 90,
      pricePerSpot: 280,
      capacity: 12,
      hostId: karan.id,
      venueId: daSilvaTurf.id,
    },
  });
  for (const u of [karan, ...others.slice(6, 14), ...others.slice(0, 3)]) {
    await confirmBooking(game2.id, u.id, 280);
  }

  // Game 3 — tomorrow morning, FULL
  const game3 = await prisma.game.create({
    data: {
      title: "Saturday Morning Game | Nidhivan Turf",
      format: "6v6",
      date: at(1, 7, 0),
      durationMin: 90,
      pricePerSpot: 199,
      capacity: 12,
      hostId: kanha.id,
      venueId: nidhivanTurf.id,
    },
  });
  for (const u of [kanha, karan, ...others]) {
    await confirmBooking(game3.id, u.id, 199);
  }

  // Game 4 — tomorrow morning, open
  const game4 = await prisma.game.create({
    data: {
      title: "Saturday Morning Game | Inbox Woods",
      format: "7v7",
      date: at(1, 8, 0),
      durationMin: 90,
      pricePerSpot: 400,
      capacity: 14,
      hostId: karan.id,
      venueId: inboxWoods.id,
    },
  });
  for (const u of others.slice(0, 4)) {
    await confirmBooking(game4.id, u.id, 400);
  }

  // Game 5 — tomorrow evening, open
  const game5 = await prisma.game.create({
    data: {
      title: "Dadar Turf meet",
      format: "6v6",
      date: at(1, 19, 0),
      durationMin: 90,
      pricePerSpot: 350,
      capacity: 12,
      hostId: kanha.id,
      venueId: daSilvaTurf.id,
    },
  });
  for (const u of others.slice(4, 9)) {
    await confirmBooking(game5.id, u.id, 350);
  }

  // Game 6 — tomorrow evening, open, cheaper
  const game6 = await prisma.game.create({
    data: {
      title: "Saturday Evening Game | Ambivali",
      format: "5v5",
      date: at(1, 18, 0),
      durationMin: 60,
      pricePerSpot: 220,
      capacity: 10,
      hostId: karan.id,
      venueId: nidhivanTurf.id,
    },
  });
  for (const u of others.slice(9, 12)) {
    await confirmBooking(game6.id, u.id, 220);
  }

  // Game 7 — completed (yesterday), so "Completed Games" has something once Sumeet books... seed a confirmed booking for Sumeet directly.
  const game7 = await prisma.game.create({
    data: {
      title: "Thursday Night Game | Inbox Woods",
      format: "6v6",
      date: at(-1, 20, 0),
      durationMin: 90,
      pricePerSpot: 220,
      capacity: 12,
      hostId: kanha.id,
      venueId: inboxWoods.id,
      status: "COMPLETED",
    },
  });
  await confirmBooking(game7.id, sumeet.id, 220);
  await confirmBooking(game7.id, kanha.id, 220);

  console.log("Seed complete.");
  console.log("Demo login: sumeet@kasakai.demo / password123 (host, ₹0 wallet — try topping up!)");
  console.log("Other accounts: kanha@kasakai.demo, karan@kasakai.demo, player1..14@kasakai.demo — all password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
