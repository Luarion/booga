import db from '@booga/db';
import { units } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(units);
export const service = new Service(db, units);

const plugin = new Elysia({
	prefix: '/units',
	detail: { tags: ['units'] },
})
	.post(
		'/',
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			response: { 201: model.read },
			detail: { summary: 'Create one or multiple units' },
		},
	)
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:unit_id',
		{
			params: t.Object({
				unit_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { unit_id } }) =>
						status(200, await service.readById(unit_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { unit_id }, body }) =>
						status(200, await service.update(unit_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { unit_id } }) =>
					status(200, await service.delete(unit_id)),
				),
	);

export default plugin;
