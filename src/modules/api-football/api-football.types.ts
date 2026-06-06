export interface ApiFootballConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ApiFootballTeam {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    logo: string;
  };
}

export interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiFootballResponse<T> {
  response: T[];
}
