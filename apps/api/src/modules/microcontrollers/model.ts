import type { microcontrollers } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class MicrocontrollersModel extends Model<typeof microcontrollers> {
	override create = t.Composite([
		t.Omit(this.base.insert, ['id', 'timestamp']),
		t.Object({
			sensors: t.Optional(
				t.Array(
					t.Object({
						alias: t.String(),
						category_id: t.Integer({ minimum: 1 }),
					}),
				),
			),
			actuators: t.Optional(
				t.Array(
					t.Object({
						alias: t.String(),
						category_id: t.Integer({ minimum: 1 }),
					}),
				),
			),
		}),
	]);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id', 'timestamp']));
}

export default MicrocontrollersModel;
