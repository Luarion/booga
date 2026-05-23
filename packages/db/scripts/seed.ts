import { sql } from 'drizzle-orm';
import db from '../src/index';
import { categories, units, users, vehicles } from '../src/schema';

async function main() {
	console.log('Seeding database with deterministic test data...');

	// 1. Seed categories
	const categoryValues = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		name: `Category ${i + 1}`,
	}));
	await db.insert(categories).values(categoryValues).onConflictDoNothing();

	// 2. Seed users
	const userValues = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		email: `user${i + 1}@example.com`,
		phone: `+346000000${String(i + 1).padStart(2, '0')}`,
		username: `user${i + 1}`,
		name: `User ${i + 1}`,
		password_hash:
			'$2a$10$Det.h.ZlXhH0f8cE8UaVxeXm8H7dZ8D/cI0xR6/U6e6y8b8e8y8e8', // dummy bcrypt hash
	}));
	await db.insert(users).values(userValues).onConflictDoNothing();

	// 3. Seed vehicles
	const vehicleValues = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		plate: `ABC${String(i + 1).padStart(4, '0')}`,
		make: 'Toyota',
		model: 'Yaris',
		fuel: 'diesel' as const,
		fuel_consumption: '5.20',
		drive: 'fwd' as const,
		displacement: '1.40',
		registration_date: '2022-02-02',
		owner_id: i + 1,
	}));
	await db.insert(vehicles).values(vehicleValues).onConflictDoNothing();

	// 4. Seed units
	const unitValues = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		category_id: i + 1,
		ucum: `u${i + 1}`,
	}));
	await db.insert(units).values(unitValues).onConflictDoNothing();

	// 5. Reset primary key sequence values to align with seeded data
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('units.categories', 'id'), COALESCE(max(id), 1)) FROM units.categories;`,
	);
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('users.users', 'id'), COALESCE(max(id), 1)) FROM users.users;`,
	);
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('public.vehicles', 'id'), COALESCE(max(id), 1)) FROM public.vehicles;`,
	);
	await db.execute(
		sql`SELECT setval(pg_get_serial_sequence('units.units', 'id'), COALESCE(max(id), 1)) FROM units.units;`,
	);

	console.log('Database seeded and sequences synchronized successfully!');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
