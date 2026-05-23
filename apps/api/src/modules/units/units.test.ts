import { describe, expect, it } from 'bun:test';
import { server } from '@/server';

const BASE = 'http://localhost/api/units';

let createdId: number;

describe('/units', () => {
	it('[POST] / — should create a unit and return 201', async () => {
		// Arrange — need a valid category_id; use 1 (seeded by init.ts)
		const req = new Request(BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ucum: `test-${Date.now()}`, category_id: 1 }),
		});

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(201);
		expect(body).toHaveProperty('id');
		expect(body).toHaveProperty('ucum');
		createdId = body.id;
	});

	it('[GET] / — should list units and return 200', async () => {
		// Arrange
		const req = new Request(BASE);

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
	});

	it('[GET] /:id — should get a unit by id and return 200', async () => {
		// Arrange
		const req = new Request(`${BASE}/${createdId}`);

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(body.id).toBe(createdId);
	});
});
