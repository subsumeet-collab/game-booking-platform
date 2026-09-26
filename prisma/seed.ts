import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITY = "Mumbai";
const PASSWORD = "password123";
// Accounts allowed to host games. Add an email here (and to the seed list below,
// so it survives a fresh deploy on the free tier's ephemeral disk) to grant hosting rights.
const HOST_EMAILS = ["sumeet@example.com", "sumeet.tripathy@impactguru.com"];

async function upsertUser(opts: { name: string; email: string; city?: string; isHost?: boolean }) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: opts.email },
    // Re-running the seed against an existing DB should still enforce the hosting rule,
    // even for accounts created before this became a rule.
    update: { isHost: opts.isHost ?? false },
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
    // Still enforce that only HOST_EMAILS are hosts, in case old data predates that rule
    // (or a new email was just added to the list).
    await prisma.user.updateMany({ where: { email: { notIn: HOST_EMAILS } }, data: { isHost: false } });
    await prisma.user.updateMany({ where: { email: { in: HOST_EMAILS } }, data: { isHost: true } });
    console.log(`Database already has ${existingUsers} user(s) — skipped creating demo data, re-checked hosting.`);
    return;
  }

  console.log("Seeding…");

  await upsertUser({ name: "Sumeet Kumar", email: "sumeet@example.com", isHost: true });
  await upsertUser({ name: "Sumeet Tripathy", email: "sumeet.tripathy@impactguru.com", isHost: true });
  await upsertUser({ name: "Kanha Bhave", email: "kanha@example.com" });
  await upsertUser({ name: "Karan Singh", email: "karan@example.com" });

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
  console.log(`Host accounts: ${HOST_EMAILS.join(", ")} — password123`);
  console.log("Other accounts: kanha@example.com, karan@example.com, player1..10@example.com — all password123, all players");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
