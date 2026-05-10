import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: resolve(__dirname, "../../.env") });

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		host: "db",
		user: process.env.POSTGRES_USER as string,
		password: process.env.POSTGRES_PASSWORD as string,
		database: process.env.POSTGRES_DB as string,
		ssl: "prefer",
	},
	introspect: { casing: "preserve" },
});
