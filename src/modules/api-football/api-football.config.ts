import type { ApiFootballConfig } from "./api-football.types";

export function getApiFootballConfig(): ApiFootballConfig {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL;
  const apiKey = process.env.API_FOOTBALL_API_KEY;

  if (!baseUrl) {
    throw new Error("API_FOOTBALL_BASE_URL is required");
  }

  if (!apiKey) {
    throw new Error("API_FOOTBALL_API_KEY is required");
  }

  return {
    baseUrl,
    apiKey,
  };
}
