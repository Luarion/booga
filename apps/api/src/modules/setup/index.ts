import { Elysia } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model();
export const service = new Service();

const plugin = new Elysia({
	prefix: '/setup',
	detail: { tags: ['setup'] },
}).post(
	'/',
	async ({ status, body }) => {
		return status(201, await service.create(body));
	},
	{
		body: model.create,
		transform({ body }) {
			body.user.email = body.user.email.trim().toLowerCase();
			body.user.phone = body.user.phone.trim();
			body.user.username = body.user.username.trim();
			body.user.name = body.user.name.trim().toLowerCase();
			body.vehicle.plate = body.vehicle.plate.trim().toUpperCase();
		},
		response: { 201: model.read },
		detail: { summary: 'Initial setup: create user and vehicle' },
	},
);

export default plugin;
