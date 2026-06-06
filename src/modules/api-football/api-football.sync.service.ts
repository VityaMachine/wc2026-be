import { apiFootballClient } from "./api-football.client";

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

export class ApiFootballSyncService {
  async syncWorldCupTeams(season: number): Promise<SyncSummary> {
    const response = await apiFootballClient.getWorldCupTeams(season);

    return {
      fetched: response.response.length,
      created: 0,
      updated: 0,
      skipped: response.response.length,
    };
  }

  async syncWorldCupFixtures(season: number): Promise<SyncSummary> {
    const response = await apiFootballClient.getWorldCupFixtures(season);

    return {
      fetched: response.response.length,
      created: 0,
      updated: 0,
      skipped: response.response.length,
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
