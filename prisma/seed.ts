import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITY = "Mumbai";
const PASSWORD = "password123";

async function upsertUser(opts: { name: string; email: string; city?: string; isHost?: boolean }) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: {
      name: opts.name,
      email: opts.email,
      passwordHash,
      city: opts.city ?? CITY,
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
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Database already has ${existingUsers} user(s) — skipping seed.`);
    return;
  }

  console.log("Seeding…");

  await upsertUser({ name: "Sumeet Kumar", email: "sumeet@example.com", isHost: true });
  await upsertUser({ name: "Kanha Bhave", email: "kanha@example.com", isHost: true });
  await upsertUser({ name: "Karan Singh", email: "karan@example.com", isHost: true });

  await Promise.all(
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
    ].map((name, i) => upsertUser({ name, email: `player${i + 1}@example.com` }))
  );

  await upsertVenue("Inbox Woods Sports Arena", CITY, "Andheri East, Mumbai");
  await upsertVenue("Dr. Antonio Da Silva Turf", CITY, "Dadar West, Mumbai");
  await upsertVenue("Nidhivan Turf, Malad", CITY, "Malad West, Mumbai");

  console.log("Seed complete — no games seeded, hosts start from a clean slate.");
  console.log("Demo login: sumeet@example.com / password123 (host)");
  console.log("Other accounts: kanha@example.com, karan@example.com, player1..10@example.com — all password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
