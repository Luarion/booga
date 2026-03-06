import * as t from "drizzle-orm/pg-core";

export const id = () => t.integer().primaryKey().generatedByDefaultAsIdentity();
export const alias = () => t.varchar({ length: 64 }).notNull();
export const timestamp = () => t.timestamp().notNull().defaultNow();
