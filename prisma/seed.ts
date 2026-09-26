import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITY = "Mumbai";
const PASSWORD = "password123";
// The only accounts that exist — players never log in, they just type their name when booking.
const HOSTS = [
  { name: "Sumeet Kumar", email: "sumeet@example.com" },
  { name: "Sumeet Tripathy", email: "sumeet.tripathy@impactguru.com" },
];

async function upsertHost(name: string, email: string) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { isHost: true },
    create: { name, email, passwordHash, isHost: true },
  });
}

async function upsertVenue(name: string, city: string, address: string) {
  const existing = await prisma.venue.findFirst({ where: { name, city } });
  if (existing) return existing;
  return prisma.venue.create({ data: { name, city, address } });
}

async function main() {
  console.log("Seeding…");

  for (const h of HOSTS) await upsertHost(h.name, h.email);

  await upsertVenue("Inbox Woods Sports Arena", CITY, "Andheri East, Mumbai");
  await upsertVenue("Dr. Antonio Da Silva Turf", CITY, "Dadar West, Mumbai");
  await upsertVenue("Nidhivan Turf, Malad", CITY, "Malad West, Mumbai");

  console.log("Seed complete — no games seeded, hosts start from a clean slate.");
  console.log(`Host login: ${HOSTS.map((h) => h.email).join(", ")} — password123`);
  console.log("Players don't have accounts — they just enter their name when booking a game.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
