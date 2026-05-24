import db from '@booga/db';
import { objects } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(objects);
export const service = new Service(db, objects);

const plugin = new Elysia({
	prefix: '/objects',
	detail: { tags: ['objects'] },
})
	.post(
		'/',
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			response: { 201: model.read },
			detail: { summary: 'Create an object and associate sensors/actuators' },
		},
	)
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:object_id',
		{
			params: t.Object({
				object_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { object_id } }) =>
						status(200, await service.readById(object_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { object_id }, body }) =>
						status(200, await service.update(object_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { object_id } }) =>
					status(200, await service.delete(object_id)),
				),
	);

export default plugin;
