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
    venue: {
      name: string | null;
      city: string | null;
    };
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
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiFootballResponse<T> {
  get?: string;
  parameters?: Record<string, string | number>;
  errors?: Record<string, string> | string[];
  results?: number;
  paging?: {
    current: number;
    total: number;
  };
  response: T[];
}
