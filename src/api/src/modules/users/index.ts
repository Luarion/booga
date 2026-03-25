import db from "@booga/db";
import { users } from "@booga/db/schema";
import { Elysia, t } from "elysia";
import Model from "./model";
import Service from "./service";

export const model = new Model(users);
export const service = new Service(db, users);

const plugin = new Elysia({
	prefix: "/users",
	detail: { tags: ["users"] },
})
	.post(
		"/",
		async ({ status, body }) => {
			return status(201, await service.create(body));
		},
		{
			body: model.create,
			transform({ body }) {
				const { email, username, name } = body;
				body.email = email.trim().toLowerCase();
				body.username = username.trim();
				body.name = name.trim().toLowerCase();
			},
			response: { 201: t.Array(model.read) },
			detail: { summary: "Create one or multiple users" },
		},
	)
	.get(
		"/",
		async ({ status }) => {
			return status(200, await service.read());
		},
		{ response: { 200: t.Array(model.read) } },
	)
	.group(
		"/:user_id",
		{
			params: t.Object({
				user_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get("/", async ({ status, params: { user_id } }) => {
					return status(200, await service.read(user_id));
				})
				.delete("/", async ({ status, params: { user_id } }) => {
					return status(200, await service.delete(user_id));
				}),
	);

export default plugin;
