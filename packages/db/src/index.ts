import { resolve } from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

config({ path: resolve(__dirname, '../../../.env') });

const db = drizzle(
	postgres({
		host: 'db',
		database: process.env.POSTGRES_DB,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
	}),
	{ schema },
);

export type Database = typeof db;
export type { SchemaTables, SchemaTablesWithId } from './globals';

export default db;
