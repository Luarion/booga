import { service as usersService } from "../users/index";
import { service as vehiclesService } from "../vehicles/index";
import type SetupModel from "./model";

class SetupService {
	async create(
		setup: SetupModel["create"]["static"],
	): Promise<SetupModel["read"]["static"]> {
		const { password_hash, ...user } = await usersService.create(setup.user);

		const vehicle = await vehiclesService.create({
			...setup.vehicle,
			owner_id: user.id,
		});

		return { user, vehicle };
	}
}

export default SetupService;
