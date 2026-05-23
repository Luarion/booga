import { describe, expect, it, mock, beforeEach } from 'bun:test';

// ── Seed data ───────────────────────────────────────────────────────────
const FAKE_TRIP = {
	id: 1,
	vehicle_id: 5,
	start: new Date('2025-06-01T10:00:00Z'),
	end: null,
};

const FAKE_ENDED_TRIP = {
	...FAKE_TRIP,
	end: new Date('2025-06-01T12:00:00Z'),
};

// ── Mock DB ─────────────────────────────────────────────────────────────
function makeMockDb() {
	const returning = mock(() => [FAKE_TRIP]);
	const values = mock(() => ({ returning }));
	const insert = mock(() => ({ values }));
	const where = mock(() => ({ returning: mock(() => [FAKE_ENDED_TRIP]) }));
	const set = mock(() => ({ where }));
	const update = mock(() => ({ set }));
	return {
		transaction: mock(async (fn: (tx: any) => Promise<any>) => fn({ insert, update })),
	};
}

describe('TripsService', () => {
	beforeEach(() => {
		mock.restore();
	});

	it('startTrip() should create a trip with a valid vehicleId', async () => {
		// Arrange
		const db = makeMockDb();
		const { trips } = await import('@booga/db/schema');
		// Fresh import to reset module-level currentTrip
		const { default: TripsService } = await import('./service');
		const service = new TripsService(db as any, trips);

		// Act
		const result = await service.startTrip(5);

		// Assert
		expect(result).toBeDefined();
		expect(result.id).toBe(FAKE_TRIP.id);
		expect(result.vehicle_id).toBe(FAKE_TRIP.vehicle_id);
	});

	it('startTrip() should throw when vehicleId is invalid (≤ 0)', async () => {
		// Arrange
		const db = makeMockDb();
		const { trips } = await import('@booga/db/schema');
		const { default: TripsService } = await import('./service');
		const service = new TripsService(db as any, trips);

		// Act & Assert
		expect(service.startTrip(0)).rejects.toThrow('Invalid vehicleId provided to startTrip');
		expect(service.startTrip(-1)).rejects.toThrow('Invalid vehicleId provided to startTrip');
	});

	it('startTrip() should return the existing trip when one is already active', async () => {
		// Arrange
		const db = makeMockDb();
		const { trips } = await import('@booga/db/schema');
		const { default: TripsService } = await import('./service');
		const service = new TripsService(db as any, trips);

		// Act — start twice
		const first = await service.startTrip(5);
		const second = await service.startTrip(5);

		// Assert
		expect(first).toBe(second);
	});

	it('endTrip() should update the trip with an end date', async () => {
		// Arrange
		const db = makeMockDb();
		const { trips } = await import('@booga/db/schema');
		const { default: TripsService } = await import('./service');
		const service = new TripsService(db as any, trips);
		await service.startTrip(5);

		// Act
		const result = await service.endTrip();

		// Assert
		expect(result).toBeDefined();
		expect(result!.end).toBeDefined();
	});

	it('endTrip() should return null when no trip is active', async () => {
		// Arrange
		const db = makeMockDb();
		const { trips } = await import('@booga/db/schema');
		const { default: TripsService } = await import('./service');
		const service = new TripsService(db as any, trips);

		// Act
		const result = await service.endTrip();

		// Assert
		expect(result).toBeNull();
	});
});
