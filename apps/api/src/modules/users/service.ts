import type { users } from '@booga/db/schema';
import { eq } from 'drizzle-orm';
import Service from '@/classes/Service';
import type UsersModel from './model';

class UsersService extends Service<
	typeof users,
	UsersModel['create']['static']
> {
	override async create(values: UsersModel['create']['static']) {
		const { password, pfp, ...rest } = values;
		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.insert(this.table)
				.values({
					...rest,
					password_hash: await Bun.password.hash(password),
				})
				.returning();
			if (!record) throw new Error('Failed creating the specified resource');
			return record;
		});
	}

	override async update(
		id: number,
		values: Partial<UsersModel['create']['static']>,
	) {
		const { password, pfp, ...rest } = values;
		const payload = {
			...rest,
			...(password ? { password_hash: await Bun.password.hash(password) } : {}),
		};

		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.update(this.table)
				.set(payload)
				.where(eq(this.columns.id, id))
				.returning();
			if (!record) throw new Error('Failed updating the specified resource');
			return record;
		});
	}
	// override async readById(id: number): Promise<TModel["read"]["static"]> {
	// 	const { password_hash, ...columns } = this.columns;
	// 	return (await this.db
	// 		.select(columns)
	// 		.from(this.table)
	// 		.where(eq(this.columns.id, id))
	// 		.limit(1));
	// }
}

export default UsersService;
