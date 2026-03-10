import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: "db",
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
  },
});
