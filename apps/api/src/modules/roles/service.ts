import { users_to_roles, roles } from '@booga/db/schema';
import { eq, and } from 'drizzle-orm';
import Service from '@/classes/Service';

class RolesService extends Service<typeof roles> {
	async getUsersForRole(roleId: number) {
		return await this.db.transaction(async (tx) => {
			const results = await tx.query.users_to_roles.findMany({
				where: eq(users_to_roles.role_id, roleId),
				with: {
					user: true,
				},
			});
			return results.map(ur => {
				const { password_hash, ...safeUser } = ur.user;
				return safeUser;
			});
		});
	}

	async assignUserToRole(roleId: number, userId: number) {
		return await this.db.transaction(async (tx) => {
			await tx
				.insert(users_to_roles)
				.values({ role_id: roleId, user_id: userId })
				.onConflictDoNothing();
			return { success: true };
		});
	}

	async unassignUserFromRole(roleId: number, userId: number) {
		return await this.db.transaction(async (tx) => {
			await tx
				.delete(users_to_roles)
				.where(
					and(
						eq(users_to_roles.role_id, roleId),
						eq(users_to_roles.user_id, userId)
					)
				);
			return { success: true };
		});
	}
}

export default RolesService;
