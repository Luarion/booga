import type { users } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class UsersModel extends Model<typeof users> {
	override create = t.Composite([
		t.Omit(this.base.insert, ['id', 'password_hash', 'pfp_hash', 'timestamp']),
		t.Object({
			password: t.String(),
			pfp: t.Optional(
				t.File({
					type: ['image/jpeg', 'image/png', 'image/webp'],
					maxSize: '100m',
				}),
			),
		}),
	]);
	override read = t.Omit(this.base.select, ['password_hash']);
}

export default UsersModel;
