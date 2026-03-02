import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";
import { users as table } from "../db/schema";

const _insert = createInsertSchema(table, {
  email: t.String({ format: "email" }),
});

const _select = createSelectSchema(table, {
  email: t.String({ format: "email" }),
});

export const insert = t.Omit(_insert, ["id", "timestamp"]);

export const select = t.Composite([
  t.Omit(_select, ["password_hash"]),
  // t.Object({ id: t.Integer({ minimum: 1 }) }),
]);

const password = t.String({ minLength: 8, maxLength: 64 });
const pfp = t.File({
  type: ["image/jpeg", "image/png", "image/webp"],
  minSize: "1k",
  maxSize: "10m",
});

export const login = t.Composite([
  t.Pick(insert, ["email"]),
  t.Object({ password: password }),
]);

export const register = t.Composite([
  t.Pick(insert, ["email", "phone", "username"]),
  t.Object({
    password: password,
    pfp: t.Optional(pfp),
  }),
]);
