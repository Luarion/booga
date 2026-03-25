import db from "@booga/db";
import { vehicles } from "@booga/db/schema";
import { Elysia, t } from "elysia";
import Model from "./model";
import Service from "./service";

export const model = new Model(vehicles);
export const service = new Service(db, vehicles);

const plugin = new Elysia({ prefix: "/vehicles" })
	.post(
		"/",
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			transform({ body }) {
				const { plate } = body;
				body.plate = plate.trim().toUpperCase();
			},
			response: { 201: t.Array(model.read) },
		},
	)
	.get("/", async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		"/:vehicle_id",
		{
			params: t.Object({
				vehicle_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get("/", async ({ status, params: { vehicle_id } }) =>
					status(200, await service.read(vehicle_id)),
				)
				.delete("/", async ({ status, params: { vehicle_id } }) =>
					status(200, await service.delete(vehicle_id)),
				),
	);

export default plugin;
