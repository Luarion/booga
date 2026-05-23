import { describe, expect, it } from 'bun:test';
import { faker } from '@faker-js/faker';
import { server } from '@/server';

const BASE = 'http://localhost/api/sign';

// ── Seed data ───────────────────────────────────────────────────────────
const TEST_USER = {
	email: faker.internet.email(),
	phone: faker.phone.number({ style: 'international' }),
	username: faker.internet.username(),
	name: faker.person.firstName(),
	password: faker.internet.password({ length: 12 }),
};

describe('/sign', () => {
	// ── Sign Up ──────────────────────────────────────────────────────────
	it('[POST] /up — should register a new user and return 201', async () => {
		// Arrange
		const req = new Request(`${BASE}/up`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(TEST_USER),
		});

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(201);
		expect(body).toHaveProperty('id');
		expect(body).toHaveProperty('email');
		expect(body).not.toHaveProperty('password_hash');
	});

	// ── Sign In ──────────────────────────────────────────────────────────
	it('[POST] /in — should login with valid credentials and return 200', async () => {
		// Arrange
		const req = new Request(`${BASE}/in`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: TEST_USER.email,
				password: TEST_USER.password,
			}),
		});

		// Act
		const res = await server.handle(req);
		const body = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(body).toHaveProperty('id');
		expect(body).toHaveProperty('email');
	});

	it('[POST] /in — should return 401 with non-existent email', async () => {
		// Arrange
		const req = new Request(`${BASE}/in`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: 'nonexistent@nowhere.dev',
				password: 'doesnotmatter',
			}),
		});

		// Act
		const res = await server.handle(req);

		// Assert
		expect(res.status).toBe(401);
	});

	it('[POST] /in — should return 401 with incorrect password', async () => {
		// Arrange
		const req = new Request(`${BASE}/in`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: TEST_USER.email,
				password: 'wrongPassword!',
			}),
		});

		// Act
		const res = await server.handle(req);

		// Assert
		expect(res.status).toBe(401);
	});
});
