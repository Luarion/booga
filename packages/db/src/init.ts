import { sql } from 'drizzle-orm';
import db from '.';
import * as s from './schema';

const categories = [
	{ id: 1, name: 'volume' },
	{ id: 2, name: 'weight' },
	{ id: 3, name: 'temperature' },
	{ id: 4, name: 'speed' },
	{ id: 5, name: 'distance' },
	{ id: 6, name: 'time' },
	{ id: 7, name: 'pressure' },
];

const units = [
	{ id: 1, category_id: 1, ucum: 'm3' },
	{ id: 2, category_id: 2, ucum: 'N' },
	{ id: 3, category_id: 3, ucum: 'K' },
	{ id: 4, category_id: 4, ucum: 'm/s' },
	{ id: 5, category_id: 5, ucum: 'm' },
	{ id: 6, category_id: 6, ucum: 's' },
	{ id: 7, category_id: 7, ucum: 'Pa' },
];

await db.transaction(async (tx) => {
	await tx
		.insert(s.categories)
		.values(categories)
		.onConflictDoUpdate({
			target: s.categories.id,
			set: { name: sql`excluded.name` },
		});
	await tx
		.insert(s.units)
		.values(units)
		.onConflictDoUpdate({
			target: s.units.id,
			set: { category_id: sql`excluded.category_id`, ucum: sql`excluded.ucum` },
		});
});
