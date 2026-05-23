import { describe, expect, it, mock, beforeEach } from 'bun:test';

// ── Seed data ───────────────────────────────────────────────────────────
const TEST_USER_RECORD = {
	id: 1,
	email: 'test@example.com',
	phone: '+34600000000',
	username: 'testuser',
	name: 'test',
	password_hash: '$argon2id$hashed',
	pfp_reference: null,
	timestamp: new Date().toISOString(),
};

const SIGN_IN_INPUT = {
	email: 'test@example.com',
	password: 'correctPassword',
};

const SIGN_UP_INPUT = {
	email: 'new@example.com',
	phone: '+34600000001',
	username: 'newuser',
	name: 'new',
	password: 'securePassword123',
};

// ── Mock DB ─────────────────────────────────────────────────────────────
function makeMockDb(returnedRows: object[] = [TEST_USER_RECORD]) {
	const limit = mock(() => returnedRows);
	const where = mock(() => ({ limit }));
	const from = mock(() => ({ where }));
	const select = mock(() => ({ from }));
	return { select };
}

describe('SignService', () => {
	beforeEach(() => {
		mock.restore();
	});

	it('signIn() should return user without password_hash when credentials are valid', async () => {
		// Arrange
		const db = makeMockDb([TEST_USER_RECORD]);

		// Mock Bun.password.verify to return true
		const originalVerify = Bun.password.verify;
		Bun.password.verify = mock(async () => true) as any;

		const { default: SignService } = await import('./service');
		const service = new SignService(db as any);

		// Act
		const result = await service.signIn(SIGN_IN_INPUT as any);

		// Assert
		expect(result).toBeDefined();
		expect(result).not.toHaveProperty('password_hash');
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty('email');

		// Cleanup
		Bun.password.verify = originalVerify;
	});

	it('signIn() should throw "Invalid credentials" when user does not exist', async () => {
		// Arrange
		const db = makeMockDb([]);

		const { default: SignService } = await import('./service');
		const service = new SignService(db as any);

		// Act & Assert
		expect(service.signIn(SIGN_IN_INPUT as any)).rejects.toThrow('Invalid credentials');
	});

	it('signIn() should throw "Invalid credentials" when password is incorrect', async () => {
		// Arrange
		const db = makeMockDb([TEST_USER_RECORD]);

		const originalVerify = Bun.password.verify;
		Bun.password.verify = mock(async () => false) as any;

		const { default: SignService } = await import('./service');
		const service = new SignService(db as any);

		// Act & Assert
		expect(service.signIn(SIGN_IN_INPUT as any)).rejects.toThrow('Invalid credentials');

		// Cleanup
		Bun.password.verify = originalVerify;
	});

	it('signUp() should delegate to usersService.create and return without password_hash', async () => {
		// Arrange — mock the users module
		const mockCreate = mock(async () => TEST_USER_RECORD);
		mock.module('../users/index', () => ({
			service: { create: mockCreate },
		}));

		const { default: SignService } = await import('./service');
		const service = new SignService({} as any);

		// Act
		const result = await service.signUp(SIGN_UP_INPUT as any);

		// Assert
		expect(result).toBeDefined();
		expect(result).not.toHaveProperty('password_hash');
		expect(result).toHaveProperty('id');
	});
});
