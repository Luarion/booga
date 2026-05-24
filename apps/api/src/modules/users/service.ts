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
	override async read() {
		return await this.db.transaction(async (tx) => {
			const results = await tx.query.users.findMany({
				with: {
					users_to_roles: {
						with: {
							role: true,
						},
					},
				},
			});
			return results.map(user => {
				const { users_to_roles, ...rest } = user;
				return {
					...rest,
					roles: users_to_roles.map(ur => ur.role.name),
				};
			});
		});
	}

	override async readById(id: number) {
		return await this.db.transaction(async (tx) => {
			const record = await tx.query.users.findFirst({
				where: eq(this.columns.id, id),
				with: {
					users_to_roles: {
						with: {
							role: true,
						},
					},
				},
			});
			if (!record) throw new Error('Failed getting the specified resource');
			const { users_to_roles, ...rest } = record;
			return {
				...rest,
				roles: users_to_roles.map(ur => ur.role.name),
			};
		});
	}
}

export default UsersService;
