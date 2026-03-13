import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: resolve(__dirname, "../../../../.env") });

const client = postgres({
  host: "db",
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const db = drizzle(client);

export default db;
