import type * as schema from "./schema";
import type { PgTable } from "drizzle-orm/pg-core";

type ExtractPgTables<T> = {
	[K in keyof T]: T[K] extends PgTable ? T[K] : never;
}[keyof T];

export type SchemaTables = ExtractPgTables<typeof schema>;
export type SchemaTablesWithId = Extract<
	SchemaTables,
	{ _: { columns: { id: unknown } } }
>;
