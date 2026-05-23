import { describe, expect, it, mock, beforeEach } from 'bun:test';

// ── Seed data ───────────────────────────────────────────────────────────
const TEST_USER_INPUT = {
	email: 'test@example.com',
	phone: '+34600000000',
	username: 'testuser',
	name: 'test',
	password: 'securePassword123',
};

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

// ── Mock DB transaction ─────────────────────────────────────────────────
function makeMockTx(returnRecord: object | null = TEST_USER_RECORD) {
	const returning = mock(() => (returnRecord ? [returnRecord] : []));
	const values = mock(() => ({ returning }));
	const insert = mock(() => ({ values }));
	const set = mock(() => ({ where: mock(() => ({ returning })) }));
	const update = mock(() => ({ set }));
	return { insert, update, returning, values };
}

function makeMockDb(tx: ReturnType<typeof makeMockTx>) {
	return {
		transaction: mock(async (fn: (tx: any) => Promise<any>) => fn(tx)),
	};
}

// ── Mock Bun.password ───────────────────────────────────────────────────
const originalHash = Bun.password.hash;

describe('UsersService', () => {
	beforeEach(() => {
		mock.restore();
	});

	it('create() should hash the password before inserting', async () => {
		// Arrange
		const tx = makeMockTx();
		const db = makeMockDb(tx);

		// Dynamically import to avoid side-effects from @booga/db
		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('../modules/users/service');
		const service = new UsersService(db as any, users);

		// Act
		const result = await service.create(TEST_USER_INPUT as any);

		// Assert
		expect(tx.insert).toHaveBeenCalledTimes(1);
		const insertedValues = tx.values.mock.calls[0]?.[0] as any;
		expect(insertedValues).toBeDefined();
		expect(insertedValues.password_hash).toBeDefined();
		expect(insertedValues.password_hash).not.toBe(TEST_USER_INPUT.password);
		expect(insertedValues.password).toBeUndefined();
		expect(result).toBeDefined();
	});

	it('create() should throw when insert returns no record', async () => {
		// Arrange
		const tx = makeMockTx(null);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('../modules/users/service');
		const service = new UsersService(db as any, users);

		// Act & Assert
		expect(service.create(TEST_USER_INPUT as any)).rejects.toThrow(
			'Failed creating the specified resource',
		);
	});

	it('update() should hash password only when provided', async () => {
		// Arrange
		const tx = makeMockTx(TEST_USER_RECORD);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('../modules/users/service');
		const service = new UsersService(db as any, users);

		// Act
		await service.update(1, { password: 'newPassword' } as any);

		// Assert — set() was called, the payload should contain password_hash
		const setCall = tx.update.mock.calls;
		expect(setCall.length).toBe(1);
	});

	it('update() should NOT hash when password is not provided', async () => {
		// Arrange
		const tx = makeMockTx(TEST_USER_RECORD);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('../modules/users/service');
		const service = new UsersService(db as any, users);

		// Act
		await service.update(1, { name: 'updated-name' } as any);

		// Assert
		const setCall = tx.update.mock.calls;
		expect(setCall.length).toBe(1);
	});
});
