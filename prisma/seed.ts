import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.tournament.upsert({
    where: { slug: 'world-cup-2026' },
    update: {
      name: 'FIFA World Cup 2026',
      startsAt: new Date('2026-06-11'),
      endsAt: new Date('2026-07-19'),
      prizePoolEntryDeadline: new Date('2026-06-11'),
      entryFee: 100,
      currency: 'UAH',
      isPrizePoolEnabled: true,
    },
    create: {
      slug: 'world-cup-2026',
      name: 'FIFA World Cup 2026',
      startsAt: new Date('2026-06-11'),
      endsAt: new Date('2026-07-19'),
      prizePoolEntryDeadline: new Date('2026-06-11'),
      entryFee: 100,
      currency: 'UAH',
      isPrizePoolEnabled: true,
    },
  });

  // Seed teams for the tournament
  const tournament = await prisma.tournament.findUnique({ where: { slug: 'world-cup-2026' } });
  if (!tournament) {
    throw new Error('Tournament not found for seeding teams');
  }

  const teams = [
    { name: 'Argentina', code: 'ARG', externalId: 1 },
    { name: 'Brazil', code: 'BRA', externalId: 2 },
    { name: 'Spain', code: 'ESP', externalId: 3 },
    { name: 'France', code: 'FRA', externalId: 4 },
    { name: 'Germany', code: 'GER', externalId: 5 },
    { name: 'England', code: 'ENG', externalId: 6 },
  ];

  for (const t of teams) {
    await prisma.team.upsert({
      where: { externalId_tournamentId: { externalId: t.externalId, tournamentId: tournament.id } },
      update: {
        name: t.name,
        code: t.code,
      },
      create: {
        name: t.name,
        code: t.code,
        externalId: t.externalId,
        tournamentId: tournament.id,
      },
    });
  }

  // Seed test matches (idempotent)
  const matchDefs = [
    { home: 'ARG', away: 'BRA', startsAt: new Date('2026-06-11T19:00:00.000Z') },
    { home: 'ESP', away: 'FRA', startsAt: new Date('2026-06-12T19:00:00.000Z') },
    { home: 'GER', away: 'ENG', startsAt: new Date('2026-06-13T19:00:00.000Z') },
  ];

  for (const m of matchDefs) {
    const home = await prisma.team.findFirst({ where: { code: m.home, tournamentId: tournament.id } });
    const away = await prisma.team.findFirst({ where: { code: m.away, tournamentId: tournament.id } });

    if (!home || !away) {
      console.warn(`Skipping match ${m.home} vs ${m.away}: teams not found`);
      continue;
    }

    // Check if match exists (safe idempotent check)
    const existing = await prisma.match.findFirst({
      where: {
        tournamentId: tournament.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
        startsAt: m.startsAt,
      },
    });

    if (existing) continue;

    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
        startsAt: m.startsAt,
        stage: 'GROUP',
      },
    });
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
