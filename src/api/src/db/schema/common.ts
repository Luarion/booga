import * as t from "drizzle-orm/pg-core";

export const id = t.integer().primaryKey().generatedAlwaysAsIdentity();
export const timestamp = t.timestamp().notNull().defaultNow();
