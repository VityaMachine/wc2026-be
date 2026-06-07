import { MatchStage, MatchStatus } from "@prisma/client";

export interface MatchListQuery {
  tournamentId?: unknown;
  status?: unknown;
  stage?: unknown;
  groupName?: unknown;
  page?: unknown;
  limit?: unknown;
}

export interface MatchListFilters {
  tournamentId?: string;
  status?: MatchStatus;
  stage?: MatchStage;
  groupName?: string;
}

export interface MatchListOptions {
  filters: MatchListFilters;
  page: number;
  limit: number;
}
