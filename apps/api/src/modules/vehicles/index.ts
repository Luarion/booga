import db from '@booga/db';
import { vehicles } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(vehicles);
export const service = new Service(db, vehicles);

const plugin = new Elysia({
	prefix: '/vehicles',
	detail: { tags: ['vehicles'] },
})
	// .model("create", model.create)
	.post(
		'/',
		async ({ status, body }) => {
			return status(201, await service.create(body));
		},
		{
			body: model.create,
			transform({ body }) {
				const { plate } = body;
				body.plate = plate.trim().toUpperCase();
			},
			response: { 201: model.read },
			detail: { summary: 'Create one or multiple vehicles' },
		},
	)
	.get(
		'/',
		async ({ status }) => {
			const records = await service.read();
			return status(200, records);
		},
		{
			response: { 200: t.Array(model.read) },
		},
	)
	.group(
		'/:vehicle_id',
		{
			params: t.Object({
				vehicle_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { vehicle_id } }) => {
						const record = await service.readById(vehicle_id);
						return status(200, record);
					},
					{
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { vehicle_id } }) =>
					status(200, await service.delete(vehicle_id)),
				),
	);

export default plugin;
