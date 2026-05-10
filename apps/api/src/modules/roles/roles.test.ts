import { describe, expect, it } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { faker } from '@faker-js/faker';
import { server } from '@/server';

const path = 'roles';
const api = treaty(server);

let id: number;

describe('/users', () => {
	it('[POST]: /', async () => {
		const { status, data } = await api.api[path].post({
			name: faker.person.jobTitle(),
		});
		if (data) id = data.id;

		expect(status).toBe(201);
	});

	it('[GET]: /', async () => {
		const api = treaty(server);
		const { status } = await api.api[path].get();

		expect(status).toBe(200);
	});

	it('[GET]: /:role_id', async () => {
		const api = treaty(server);
		const { status } = await api.api[path]({ role_id: id }).get();

		expect(status).toBe(200);
	});
});
