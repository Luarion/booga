import type { units } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class UnitsModel extends Model<typeof units> {
	override create = t.Omit(this.base.insert, ['id', 'timestamp']);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id', 'timestamp']));
}

export default UnitsModel;
