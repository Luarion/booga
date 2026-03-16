import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";

import * as tables from "../../db/schema";

const email = t.String({ format: "email" });
const password = t.String({
	minLength: 8,
	// pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$",
});
const pfp = t.File({
	type: ["image/png", "image/jpeg", "image/webp", "image"],
});

const _insert = createInsertSchema(tables.users, {
	email,
});

const _select = createSelectSchema(tables.users, {
	email,
});

const insert = t.Omit(_insert, ["id", "timestamp"]);
const response = t.Omit(_select, ["password_hash"]);

export const responses = new Elysia().model({
	user: response,
});

export const sign = {
	up: t.Composite([
		t.Omit(insert, ["password_hash", "pfp_hash"]),
		t.Object({ password, pfp: t.Optional(pfp) }),
	]),
	in: t.Composite([t.Pick(response.select, ["email"]), t.Object(password)]),
};
