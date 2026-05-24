import db from '@booga/db';
import { trips } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(trips);
export const service = new Service(db, trips);

const plugin = new Elysia({
	prefix: '/trips',
	detail: { tags: ['trips'] },
})
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:trip_id',
		{
			params: t.Object({
				trip_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { trip_id } }) =>
						status(200, await service.readById(trip_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { trip_id }, body }) =>
						status(200, await service.update(trip_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { trip_id } }) =>
					status(200, await service.delete(trip_id)),
				),
	);

export default plugin;
