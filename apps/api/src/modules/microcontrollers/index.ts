import db from '@booga/db';
import { microcontrollers } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(microcontrollers);
export const service = new Service(db, microcontrollers);

const plugin = new Elysia({
	prefix: '/microcontrollers',
	detail: { tags: ['microcontrollers'] },
})
	.post(
		'/',
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			response: { 201: model.read },
			detail: { summary: 'Register a microcontroller from manifest JSON' },
		},
	)
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:microcontroller_id',
		{
			params: t.Object({
				microcontroller_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { microcontroller_id } }) =>
						status(200, await service.readById(microcontroller_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { microcontroller_id }, body }) =>
						status(200, await service.update(microcontroller_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { microcontroller_id } }) =>
					status(200, await service.delete(microcontroller_id)),
				),
	);

export default plugin;
