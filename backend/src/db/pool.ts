import { Pool } from 'pg';
import { config } from '../config';

// Single shared pool (singleton). Per-request clients would add connect
// overhead and distort the demo's DB latency number.
export const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });
