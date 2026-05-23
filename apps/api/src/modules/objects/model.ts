import type { objects } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class ObjectsModel extends Model<typeof objects> {
	override create = t.Composite([
		t.Omit(this.base.insert, ['id', 'timestamp']),
		t.Object({
			sensor_ids: t.Optional(t.Array(t.Integer({ minimum: 1 }))),
			actuator_ids: t.Optional(t.Array(t.Integer({ minimum: 1 }))),
		}),
	]);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id', 'timestamp']));
}

export default ObjectsModel;
