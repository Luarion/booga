import * as p from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const bigid = () => p.bigserial({ mode: "bigint" }).primaryKey();
export const id = () => p.serial().primaryKey();
// export type id = ReturnType<typeof id>["_"]["data"];

export const alias = () => p.varchar({ length: 32 }).notNull();
export const timestamp = () => p.timestamp().notNull().defaultNow();
// TODO: type reference arguments correctly
export const bigreference = (ref: () => p.AnyPgColumn, config?: object) =>
	p.bigint({ mode: "bigint" }).notNull().references(ref, config);
export const reference = (ref: () => p.AnyPgColumn, config?: object) =>
	p.integer().notNull().references(ref, config);

export function createSchemas(table: p.AnyPgTable) {
	return {
		insert: createInsertSchema(table),
		select: createSelectSchema(table),
	};
}
