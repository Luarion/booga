import type { actuators } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class ActuatorsModel extends Model<typeof actuators> {
	override create = t.Omit(this.base.insert, ['id']);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id']));
}

export default ActuatorsModel;
