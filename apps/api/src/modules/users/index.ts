import db from '@booga/db';
import { users } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(users);
export const service = new Service(db, users);

const plugin = new Elysia({
	prefix: '/users',
	detail: { tags: ['users'] },
})
	.post(
		'/',
		async ({ status, body }) => {
			// TODO: Make the method create(), read(), etc, just return the needed columns, instead of using the spread operator
			const { password_hash, ...record } = await service.create(body);
			return status(201, record);
		},
		{
			body: model.create,
			transform({ body }) {
				const { email, phone, username, name } = body;
				body.email = email.trim().toLowerCase();
				body.phone = phone.trim();
				body.username = username.trim();
				body.name = name.trim().toLowerCase();
			},
			response: { 201: model.read },
			detail: { summary: 'Create one or multiple users' },
		},
	)
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:user_id',
		{
			params: t.Object({
				user_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { user_id } }) => {
						const { password_hash, ...record } =
							await service.readById(user_id);
						return status(200, record);
					},
					{ response: { 200: model.read } },
				)
				.put(
					'/',
					async ({ status, params: { user_id }, body }) => {
						const { password_hash, ...record } = await service.update(
							user_id,
							body,
						);
						return status(200, record);
					},
					{ body: model.update, response: { 200: model.read } },
				)
				.delete('/', async ({ status, params: { user_id } }) =>
					status(200, await service.delete(user_id)),
				),
	);

export default plugin;
