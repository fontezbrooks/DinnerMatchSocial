import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3001'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('dinnermatch'),
  DB_USER: z.string().default('dinnermatch_user'),
  DB_PASSWORD: z.string().default('password'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().default('http://localhost:8081'),

  // Third-party API Keys
  YELP_API_KEY: z.string().min(10),
  SPOONACULAR_API_KEY: z.string().min(10),
});

export const env = envSchema.parse(process.env);

export default env;