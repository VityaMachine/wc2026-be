import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as string,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
};
