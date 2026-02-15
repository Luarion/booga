import { createInsertSchema } from "drizzle-typebox";
import { t } from "elysia";
import table from "../../db/schema/users";

const _base = createInsertSchema(table, {
  email: t.String({ format: "email" }),
});

export const insert = t.Omit(_base, ["id"]);

export const select = t.Omit(_base, ["password_hash"]);

export const register = t.Composite([
  t.Omit(_base, ["id", "password_hash", "pfp_hash", "timestamp"]),
  t.Object({
    password: t.String({ minLength: 8, maxLength: 64 }),
    pfp: t.Optional(
      t.File({
        type: ["image/jpeg", "image/png", "image/webp"],
        minSize: "1k",
        maxSize: "10m",
      }),
    ),
  }),
]);
