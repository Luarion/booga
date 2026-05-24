import db from '@booga/db';
import { actuators } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(actuators);
export const service = new Service(db, actuators);

const plugin = new Elysia({
	prefix: '/actuators',
	detail: { tags: ['actuators'] },
})
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:actuator_id',
		{
			params: t.Object({
				actuator_id: t.Integer({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { actuator_id } }) =>
						status(200, await service.readById(actuator_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { actuator_id }, body }) =>
						status(200, await service.update(actuator_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.get(
					'/readings',
					async ({ status, params: { actuator_id } }) =>
						status(200, await service.getReadings(actuator_id)),
					{
						response: {
							200: t.Array(
								t.Object({
									actuator_id: t.Numeric(),
									value: t.String(),
									timestamp: t.Date(),
								}),
							),
						},
					},
				)
				.delete('/', async ({ status, params: { actuator_id } }) =>
					status(200, await service.delete(actuator_id)),
				),
	);

export default plugin;
