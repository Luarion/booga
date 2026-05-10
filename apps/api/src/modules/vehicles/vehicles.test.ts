import { describe, expect, it } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { faker } from '@faker-js/faker';
import { server } from '@/server';

const path = 'vehicles';
const api = treaty(server);

let id: number;

describe(`/${path}`, () => {
	it('[POST]: /', async () => {
		const { status, data } = await api.api[path].post({
			maker: faker.vehicle.manufacturer(),
			drive: 'awd',
			displacement: '5.2',
			fuel: 'diesel',
			plate: faker.vehicle.vrm(),
			registration_date: '02-02-2022',
			fuel_consumption: '5',
			model: 'lotus',
			owner_id: 15,
		});
		if (data) id = data.id;

		expect(status).toBe(201);
	});
	it('[GET]: /', async () => {
		const api = treaty(server);
		const { status } = await api.api[path].get();

		expect(status).toBe(200);
	});

	it('[GET]: /:vehicle_id', async () => {
		const api = treaty(server);
		const { status } = await api.api[path]({ vehicle_id: id }).get();

		expect(status).toBe(200);
	});
});
