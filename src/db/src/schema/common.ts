import * as t from "drizzle-orm/pg-core";

export const id = () => t.bigserial({ mode: "bigint" }).primaryKey();
export type id = ReturnType<typeof id>["_"]["data"];

export const alias = () => t.varchar({ length: 32 }).notNull();
export const timestamp = () => t.timestamp().notNull().defaultNow();
// TODO: reference arguments correctly
export const reference = (ref: () => t.AnyPgColumn, config?: object) =>
  t.bigint({ mode: "bigint" }).notNull().references(ref, config);
