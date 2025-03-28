import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Export all schema objects
export * from './schema';

// Get the connection string from the environment variable
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5434/money_manager_new';

// For Vercel serverless functions, we need to use a different connection approach
const client = postgres(connectionString, {
  // Use a single connection in production to avoid connection limits
  // but use the default pooling in development for better performance
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create a drizzle client with the postgres client and schema
export const db = drizzle(client, { schema });
