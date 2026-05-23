import type { sensors } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class SensorsModel extends Model<typeof sensors> {
	override create = t.Omit(this.base.insert, ['id']);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id']));
}

export default SensorsModel;
