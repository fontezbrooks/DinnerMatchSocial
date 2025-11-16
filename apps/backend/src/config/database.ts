import knex from 'knex';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dinnermatch',
    user: process.env.DB_USER || 'dinnermatch_user',
    password: process.env.DB_PASSWORD || 'password'
  },
  migrations: {
    directory: './migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './seeds',
    extension: 'ts'
  }
};

export const db = knex(dbConfig);

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisConfig);

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Database connection test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    console.log('✅ PostgreSQL connected');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    return false;
  }
}

// Redis session key helpers
export const SessionKeys = {
  session: (sessionId: string) => `session:${sessionId}`,
  userSession: (userId: string) => `user:${userId}:session`,
  groupSessions: (groupId: string) => `group:${groupId}:sessions`,
  sessionVotes: (sessionId: string, round: number) => `session:${sessionId}:votes:${round}`,
  sessionMatches: (sessionId: string, round: number) => `session:${sessionId}:matches:${round}`
};

export default { db, redis, testDatabaseConnection, SessionKeys };