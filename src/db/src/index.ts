import { resolve } from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: resolve(__dirname, "../../../.env") });

export const db = drizzle(
	postgres({
		host: "db",
		database: process.env.POSTGRES_DB,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
	}),
	{ schema },
);

export default db;
