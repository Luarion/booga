import db from "@booga/db";
import { roles } from "@booga/db/schema";
import { Elysia, t } from "elysia";
import Model from "./model";
import Service from "./service";

export const model = new Model(roles);
export const service = new Service(db, roles);

const plugin = new Elysia({
	prefix: "/roles",
	detail: { tags: ["roles"] },
})
	.post(
		"/",
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			transform({ body }) {
				const { name } = body;
				body.name = name.trim().toLowerCase();
			},
			response: { 201: model.read },
			detail: { summary: "Create one or multiple roles" },
		},
	)
	.get("/", async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		"/:role_id",
		{
			params: t.Object({
				role_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					"/",
					async ({ status, params: { role_id } }) =>
						status(200, await service.readById(role_id)),
					{ response: { 200: model.read } },
				)
				.delete("/", async ({ status, params: { role_id } }) => {
					status(200, await service.delete(role_id));
				}),
	);

export default plugin;
