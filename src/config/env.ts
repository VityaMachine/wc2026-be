import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  const normalizedValue = value.toLowerCase();
  if (normalizedValue === "true") {
    return true;
  }
  if (normalizedValue === "false") {
    return false;
  }

  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV || "development";
const corsOrigin =
  process.env.CORS_ORIGIN ||
  (nodeEnv === "production"
    ? requireEnv("CORS_ORIGIN")
    : "http://localhost:3000");

export const env = {
  NODE_ENV: nodeEnv,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "7d") as string,
  CORS_ORIGIN: corsOrigin,
  APP_URL: process.env.APP_URL || "http://localhost:4000",
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || "http://localhost:3000",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseNumber(process.env.SMTP_PORT, 587),
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM:
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "WC2026 Predictor <no-reply@localhost>",
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
