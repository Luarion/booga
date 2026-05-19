import { service as usersService } from '../users/index';
import { service as vehiclesService } from '../vehicles/index';
import db from '@booga/db';
import { app_setup } from '@booga/db/schema';
import serverConfig from '@/lib/serverConfig';
import type SetupModel from './model';

class SetupService {
	async create(
		setup: SetupModel['create']['static'],
	): Promise<SetupModel['read']['static']> {
		const { password_hash, ...user } = await usersService.create(setup.user);

		const vehicle = await vehiclesService.create({
			...setup.vehicle,
			owner_id: user.id,
		});

		// mark setup as completed in DB and config JSON
		await db.transaction(async (tx) => {
			// remove previous rows and insert a single completed marker
			await tx.delete(app_setup).execute();
			await tx
				.insert(app_setup)
				.values({ completed: true, completed_at: new Date() });
		});

		await serverConfig.setSetupCompleted(true);

		return { user, vehicle };
	}
}

export default SetupService;
