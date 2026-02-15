import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL || "postgresql://booga:booga@db/booga";

const client = postgres(connectionString);

const db = drizzle(client);

export default db;
