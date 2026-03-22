import { Pool } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export const createPostgresConnection = (config: DatabaseConfig): Pool => {
  return new Pool(config);
};

export const closePostgresConnection = async (pool: Pool): Promise<void> => {
  await pool.end();
};