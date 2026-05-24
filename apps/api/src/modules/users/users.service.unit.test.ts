import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Database } from '@booga/db';
import type UsersModel from './model';

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
		transaction: mock(async (fn: (tx: unknown) => Promise<unknown>) => fn(tx)),
	};
}

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
		const { default: UsersService } = await import('./service');
		const service = new UsersService(db as unknown as Database, users);

		// Act
		const result = await service.create(
			TEST_USER_INPUT as UsersModel['create']['static'],
		);

		// Assert
		expect(tx.insert).toHaveBeenCalledTimes(1);
		const calls = tx.values.mock.calls as unknown as Record<
			string,
			unknown
		>[][];
		const insertedValues = calls[0]?.[0];
		expect(insertedValues).toBeDefined();
		expect(insertedValues?.password_hash).toBeDefined();
		expect(insertedValues?.password_hash).not.toBe(TEST_USER_INPUT.password);
		expect(insertedValues?.password).toBeUndefined();
		expect(result).toBeDefined();
	});

	it('create() should throw when insert returns no record', async () => {
		// Arrange
		const tx = makeMockTx(null);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('./service');
		const service = new UsersService(db as unknown as Database, users);

		// Act & Assert
		expect(
			service.create(TEST_USER_INPUT as UsersModel['create']['static']),
		).rejects.toThrow('Failed creating the specified resource');
	});

	it('update() should hash password only when provided', async () => {
		// Arrange
		const tx = makeMockTx(TEST_USER_RECORD);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('./service');
		const service = new UsersService(db as unknown as Database, users);

		// Act
		await service.update(1, {
			password: 'newPassword',
		} as UsersModel['update']['static']);

		// Assert — set() was called, the payload should contain password_hash
		const setCall = tx.update.mock.calls;
		expect(setCall.length).toBe(1);
	});

	it('update() should NOT hash when password is not provided', async () => {
		// Arrange
		const tx = makeMockTx(TEST_USER_RECORD);
		const db = makeMockDb(tx);

		const { users } = await import('@booga/db/schema');
		const { default: UsersService } = await import('./service');
		const service = new UsersService(db as unknown as Database, users);

		// Act
		await service.update(1, {
			name: 'updated-name',
		} as UsersModel['update']['static']);

		// Assert
		const setCall = tx.update.mock.calls;
		expect(setCall.length).toBe(1);
	});
});
