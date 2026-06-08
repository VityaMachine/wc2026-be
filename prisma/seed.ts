import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tournament = await prisma.tournament.upsert({
    where: { slug: "world-cup-2026" },
    update: {
      name: "FIFA World Cup 2026",
      startsAt: new Date("2026-06-11T00:00:00.000Z"),
      endsAt: new Date("2026-07-19T00:00:00.000Z"),
      prizePoolEntryDeadline: new Date("2026-06-11T00:00:00.000Z"),
      entryFee: 100,
      currency: "UAH",
      isPrizePoolEnabled: true,
    },
    create: {
      slug: "world-cup-2026",
      name: "FIFA World Cup 2026",
      startsAt: new Date("2026-06-11T00:00:00.000Z"),
      endsAt: new Date("2026-07-19T00:00:00.000Z"),
      prizePoolEntryDeadline: new Date("2026-06-11T00:00:00.000Z"),
      entryFee: 100,
      currency: "UAH",
      isPrizePoolEnabled: true,
    },
  });

  console.log(
    `Seed completed. Tournament: ${tournament.name} (${tournament.slug})`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
