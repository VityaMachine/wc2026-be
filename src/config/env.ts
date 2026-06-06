import dotenv from 'dotenv';

dotenv.config();

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = value.toLowerCase();
  if (normalizedValue === 'true') {
    return true;
  }
  if (normalizedValue === 'false') {
    return false;
  }

  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as string,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_FOOTBALL_SCHEDULER_ENABLED: parseBoolean(
    process.env.API_FOOTBALL_SCHEDULER_ENABLED,
    true,
  ),
  API_FOOTBALL_SEASON: parseNumber(process.env.API_FOOTBALL_SEASON, 2026),
  API_FOOTBALL_REGULAR_SYNC_INTERVAL_MS: parseNumber(
    process.env.API_FOOTBALL_REGULAR_SYNC_INTERVAL_MS,
    3 * 60 * 60 * 1000,
  ),
  API_FOOTBALL_LIVE_SYNC_INTERVAL_MS: parseNumber(
    process.env.API_FOOTBALL_LIVE_SYNC_INTERVAL_MS,
    60 * 1000,
  ),
};
