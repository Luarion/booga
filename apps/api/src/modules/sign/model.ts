import { t } from 'elysia';
import { model as UsersModel } from '../users/index';

class SignModel {
	readonly signIn = t.Object({
		email: t.String({ format: 'email' }),
		password: t.String(),
	});

	readonly signUp = UsersModel.create;

	readonly read = UsersModel.read;
}

export default SignModel;
