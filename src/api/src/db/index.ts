import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL || "postgresql://booga:booga@db/booga");

export default db;
