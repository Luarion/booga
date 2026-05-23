import { describe, expect, it } from 'bun:test';
import { server } from '@/server';

const BASE = 'http://localhost/api/trips';

describe('/trips', () => {
	it('[GET] / — should list trips and return 200', async () => {
		// Arrange
		const req = new Request(BASE);

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
	});
});
