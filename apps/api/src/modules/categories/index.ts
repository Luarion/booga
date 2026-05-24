import db from '@booga/db';
import { categories } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(categories);
export const service = new Service(db, categories);

const plugin = new Elysia({
	prefix: '/categories',
	detail: { tags: ['categories'] },
})
	.post(
		'/',
		async ({ status, body }) => status(201, await service.create(body)),
		{
			body: model.create,
			response: { 201: model.read },
			detail: { summary: 'Create one or multiple categories' },
		},
	)
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:category_id',
		{
			params: t.Object({
				category_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { category_id } }) =>
						status(200, await service.readById(category_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { category_id }, body }) =>
						status(200, await service.update(category_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.delete('/', async ({ status, params: { category_id } }) =>
					status(200, await service.delete(category_id)),
				),
	);

export default plugin;
