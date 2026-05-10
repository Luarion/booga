import { t } from 'elysia';
import { model as UsersModel } from '../users/index';
import { model as VehiclesModel } from '../vehicles/index';

class SetupModel {
	readonly create = t.Object({
		user: UsersModel.create,
		vehicle: t.Omit(VehiclesModel.create, ['owner_id']),
	});

	readonly read = t.Object({
		user: UsersModel.read,
		vehicle: VehiclesModel.read,
	});
}

export default SetupModel;
