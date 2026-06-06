import { apiFootballClient } from "./api-football.client";
import { prisma } from "../../lib/prisma";
import { MatchStage, MatchStatus } from "@prisma/client";

interface SyncSummary {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
}

interface FixtureResultSyncSummary {
  fetched: number;
  updated: number;
  skipped: number;
}

interface ApiFootballFixtureTeam {
  id: number;
  name: string;
  logo: string;
}

function mapApiFootballStatus(status: string): MatchStatus {
  switch (status) {
    case "NS":
    case "TBD":
      return MatchStatus.SCHEDULED;
    case "1H":
    case "HT":
    case "2H":
    case "ET":
    case "BT":
    case "P":
    case "SUSP":
    case "INT":
    case "LIVE":
      return MatchStatus.LIVE;
    case "FT":
    case "AET":
    case "PEN":
      return MatchStatus.FINISHED;
    case "PST":
      return MatchStatus.POSTPONED;
    case "CANC":
    case "ABD":
      return MatchStatus.CANCELLED;
    default:
      return MatchStatus.SCHEDULED;
  }
}

function mapApiFootballStage(round: string): MatchStage {
  if (round.includes("Group")) {
    return MatchStage.GROUP;
  }
  if (round.includes("Round of 32")) {
    return MatchStage.ROUND_OF_32;
  }
  if (round.includes("Round of 16")) {
    return MatchStage.ROUND_OF_16;
  }
  if (round.includes("Quarter")) {
    return MatchStage.QUARTER_FINAL;
  }
  if (round.includes("Semi")) {
    return MatchStage.SEMI_FINAL;
  }
  if (round.includes("3rd") || round.includes("Third")) {
    return MatchStage.THIRD_PLACE;
  }
  if (round.includes("Final")) {
    return MatchStage.FINAL;
  }

  return MatchStage.GROUP;
}

export class ApiFootballSyncService {
  async syncWorldCupTeams(season: number): Promise<SyncSummary> {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: "world-cup-2026" },
      select: { id: true },
    });

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const fixtures = await apiFootballClient.getWorldCupFixtures(season);
    const teamsByExternalId = new Map<number, ApiFootballFixtureTeam>();

    for (const fixture of fixtures.response) {
      teamsByExternalId.set(fixture.teams.home.id, fixture.teams.home);
      teamsByExternalId.set(fixture.teams.away.id, fixture.teams.away);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const team of teamsByExternalId.values()) {
      const existingTeam = await prisma.team.findFirst({
        where: { externalId: team.id },
      });

      if (!existingTeam) {
        await prisma.team.create({
          data: {
            externalId: team.id,
            name: team.name,
            logoUrl: team.logo,
            tournamentId: tournament.id,
          },
        });
        created += 1;
        continue;
      }

      if (existingTeam.name === team.name && existingTeam.logoUrl === team.logo) {
        skipped += 1;
        continue;
      }

      await prisma.team.update({
        where: { id: existingTeam.id },
        data: {
          name: team.name,
          logoUrl: team.logo,
        },
      });
      updated += 1;
    }

    return {
      fetched: teamsByExternalId.size,
      created,
      updated,
      skipped,
    };
  }

  async syncWorldCupFixtures(season: number): Promise<SyncSummary> {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: "world-cup-2026" },
      select: { id: true },
    });

    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const response = await apiFootballClient.getWorldCupFixtures(season);
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const fixture of response.response) {
      const externalFixtureId = fixture.fixture.id;
      const startsAt = new Date(fixture.fixture.date);
      const homeExternalId = fixture.teams.home.id;
      const awayExternalId = fixture.teams.away.id;

      if (
        !externalFixtureId ||
        Number.isNaN(startsAt.getTime()) ||
        !homeExternalId ||
        !awayExternalId
      ) {
        skipped += 1;
        continue;
      }

      const [homeTeam, awayTeam] = await Promise.all([
        prisma.team.findFirst({
          where: {
            externalId: homeExternalId,
            tournamentId: tournament.id,
          },
        }),
        prisma.team.findFirst({
          where: {
            externalId: awayExternalId,
            tournamentId: tournament.id,
          },
        }),
      ]);

      if (!homeTeam || !awayTeam) {
        skipped += 1;
        continue;
      }

      const data = {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        startsAt,
        status: mapApiFootballStatus(fixture.fixture.status.short),
        stage: mapApiFootballStage(fixture.league.round),
        groupName: fixture.league.round,
        venueName: fixture.fixture.venue.name,
        city: fixture.fixture.venue.city,
      };

      const existingMatch = await prisma.match.findUnique({
        where: {
          externalFixtureId_tournamentId: {
            externalFixtureId,
            tournamentId: tournament.id,
          },
        },
      });

      if (!existingMatch) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            externalFixtureId,
            ...data,
          },
        });
        created += 1;
        continue;
      }

      await prisma.match.update({
        where: { id: existingMatch.id },
        data,
      });
      updated += 1;
    }

    return {
      fetched: response.response.length,
      created,
      updated,
      skipped,
    };
  }

  async syncFixtureResult(
    fixtureId: number,
  ): Promise<FixtureResultSyncSummary> {
    const response = await apiFootballClient.getFixtureById(fixtureId);

    return {
      fetched: response.response.length,
      updated: 0,
      skipped: response.response.length,
    };
  }
}

export const apiFootballSyncService = new ApiFootballSyncService();
