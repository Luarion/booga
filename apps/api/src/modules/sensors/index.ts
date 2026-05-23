import db from '@booga/db';
import { sensors } from '@booga/db/schema';
import { Elysia, t } from 'elysia';
import Model from './model';
import Service from './service';

export const model = new Model(sensors);
export const service = new Service(db, sensors);

const plugin = new Elysia({
	prefix: '/sensors',
	detail: { tags: ['sensors'] },
})
	.get('/', async ({ status }) => status(200, await service.read()), {
		response: { 200: t.Array(model.read) },
	})
	.group(
		'/:sensor_id',
		{
			params: t.Object({
				sensor_id: t.Numeric({ minimum: 1 }),
			}),
		},
		(pl) =>
			pl
				.get(
					'/',
					async ({ status, params: { sensor_id } }) =>
						status(200, await service.readById(sensor_id)),
					{
						response: { 200: model.read },
					},
				)
				.patch(
					'/',
					async ({ status, params: { sensor_id }, body }) =>
						status(200, await service.update(sensor_id, body)),
					{
						body: model.update,
						response: { 200: model.read },
					},
				)
				.get(
					'/readings',
					async ({ status, params: { sensor_id } }) =>
						status(200, await service.getReadings(sensor_id)),
					{
						response: {
							200: t.Array(
								t.Object({
									sensor_id: t.Numeric(),
									value: t.String(),
									timestamp: t.Date(),
								})
							),
						},
					},
				)
				.delete('/', async ({ status, params: { sensor_id } }) =>
					status(200, await service.delete(sensor_id)),
				),
	);

export default plugin;
