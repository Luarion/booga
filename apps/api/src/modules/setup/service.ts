import db from '@booga/db';
import { users, vehicles } from '@booga/db/schema';
import serverConfig from '@/lib/serverConfig';
import type SetupModel from './model';

class SetupService {
	async create(
		setup: SetupModel['create']['static'],
	): Promise<SetupModel['read']['static']> {
		const { password, pfp, ...restUser } = setup.user;
		
		const result = await db.transaction(async (tx) => {
			const [user] = await tx
				.insert(users)
				.values({
					...restUser,
					password_hash: await Bun.password.hash(password),
				})
				.returning();

			if (!user) throw new Error('Failed creating user');

			const [vehicle] = await tx
				.insert(vehicles)
				.values({
					...setup.vehicle,
					owner_id: user.id,
				})
				.returning();

			if (!vehicle) throw new Error('Failed creating vehicle');

			return { user, vehicle };
		});

		await serverConfig.setSetupCompleted(true);

		const { password_hash, ...userResponse } = result.user;
		return { user: userResponse, vehicle: result.vehicle };
	}
}

export default SetupService;
