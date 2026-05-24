import type { trips } from '@booga/db/schema';
import { t } from 'elysia';
import Model from '@/classes/Model';

class TripsModel extends Model<typeof trips> {
	override create = t.Omit(this.base.insert, ['id']);
	override read = t.Object(this.base.select.properties);
	override update = t.Partial(t.Omit(this.base.insert, ['id']));
}

export default TripsModel;
