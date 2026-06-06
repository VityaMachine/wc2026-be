import { getApiFootballConfig } from "./api-football.config";
import type {
  ApiFootballConfig,
  ApiFootballFixture,
  ApiFootballResponse,
  ApiFootballTeam,
} from "./api-football.types";

export class ApiFootballClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ApiFootballConfig = getApiFootballConfig()) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<ApiFootballResponse<T>> {
    const url = new URL(path, this.baseUrl);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API-Football request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  getWorldCupTeams(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballTeam>> {
    return this.request<ApiFootballTeam>("/teams", {
      league: 1,
      season,
    });
  }

  getWorldCupFixtures(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballFixture>> {
    return this.request<ApiFootballFixture>("/fixtures", {
      league: 1,
      season,
    });
  }

  getFixtureById(
    fixtureId: number,
  ): Promise<ApiFootballResponse<ApiFootballFixture>> {
    return this.request<ApiFootballFixture>("/fixtures", {
      id: fixtureId,
    });
  }
}

export const apiFootballClient = new ApiFootballClient();
