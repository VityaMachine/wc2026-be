import { getApiFootballConfig } from "./api-football.config";
import type {
  ApiFootballConfig,
  ApiFootballFixture,
  ApiFootballResponse,
  ApiFootballStandings,
  ApiFootballTeam,
} from "./api-football.types";

export class ApiFootballClient {
  private config?: ApiFootballConfig;

  constructor(config?: ApiFootballConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<ApiFootballResponse<T>> {
    const config = this.getConfig();
    const url = new URL(path, config.baseUrl);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API-Football request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as ApiFootballResponse<T>;
    const errorMessage = this.getApiFootballErrorMessage(data.errors);
    if (errorMessage) {
      throw new Error(`API-Football error: ${errorMessage}`);
    }

    return data;
  }

  private getConfig(): ApiFootballConfig {
    this.config ??= getApiFootballConfig();
    return this.config;
  }

  private getApiFootballErrorMessage(
    errors: ApiFootballResponse<unknown>["errors"],
  ): string | null {
    if (!errors) {
      return null;
    }

    if (Array.isArray(errors)) {
      return errors.length > 0
        ? errors.join("; ") || "Unknown API-Football error"
        : null;
    }

    const messages = Object.values(errors);
    return messages.length > 0
      ? messages.join("; ") || "Unknown API-Football error"
      : null;
  }

  getWorldCupTeams(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballTeam>> {
    const config = this.getConfig();

    return this.request<ApiFootballTeam>("/teams", {
      league: config.worldCupLeagueId,
      season,
    });
  }

  getWorldCupFixtures(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballFixture>> {
    const config = this.getConfig();

    return this.request<ApiFootballFixture>("/fixtures", {
      league: config.worldCupLeagueId,
      season,
    });
  }

  getLiveWorldCupFixtures(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballFixture>> {
    const config = this.getConfig();

    return this.request<ApiFootballFixture>("/fixtures", {
      league: config.worldCupLeagueId,
      season,
      live: "all",
    });
  }

  getWorldCupStandings(
    season: number,
  ): Promise<ApiFootballResponse<ApiFootballStandings>> {
    const config = this.getConfig();

    return this.request<ApiFootballStandings>("/standings", {
      league: config.worldCupLeagueId,
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
