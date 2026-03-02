import { t } from "elysia";
import * as tables from "../../db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

const email = t.String({ format: "email" });
const password = t.String({
  minLength: 8,
  // pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$",
});
const pfp = t.File();

const _insert = createInsertSchema(tables.users, {
  email,
});

const _select = createSelectSchema(tables.users, {
  email,
});

const insert = t.Omit(_insert, ["id", "timestamp"]);

export const response = { select: t.Omit(_select, ["password_hash"]) };

export const body = {
  sign: {
    up: t.Composite([
      t.Omit(insert, ["password_hash", "pfp_hash"]),
      t.Object({ password, pfp: t.Optional(pfp) }),
    ]),
    in: t.Composite([
      t.Pick(response.select, ["email"]),
      t.Object({ password }),
    ]),
  },
};
