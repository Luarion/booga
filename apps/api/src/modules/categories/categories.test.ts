import { describe, expect, it } from 'bun:test';
import { server } from '@/server';

const BASE = 'http://localhost/api/categories';

let createdId: number;

describe('/categories', () => {
	it('[POST] / — should create a category and return 201', async () => {
		// Arrange
		const req = new Request(BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: `test-cat-${Date.now()}` }),
		});

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(201);
		expect(body).toHaveProperty('id');
		expect(body).toHaveProperty('name');
		createdId = body.id;
	});

	it('[GET] / — should list categories and return 200', async () => {
		// Arrange
		const req = new Request(BASE);

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
	});

	it('[GET] /:id — should get a category by id and return 200', async () => {
		// Arrange
		const req = new Request(`${BASE}/${createdId}`);

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(body.id).toBe(createdId);
	});

	it('[DELETE] /:id — should delete the category and return 200', async () => {
		// Arrange
		const req = new Request(`${BASE}/${createdId}`, { method: 'DELETE' });

		// Act
		const res = await server.handle(req);

		// Assert
		expect(res.status).toBe(200);
	});
});
