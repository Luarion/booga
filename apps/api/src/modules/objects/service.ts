import {
	type objects,
	objects_to_actuators,
	objects_to_sensors,
} from '@booga/db/schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import Service from '@/classes/Service';

type ObjectManifest = Omit<
	InferInsertModel<typeof objects>,
	'id' | 'timestamp'
> & {
	sensor_ids?: number[];
	actuator_ids?: number[];
};

class ObjectsService extends Service<typeof objects> {
	override async create(values: ObjectManifest) {
		const { sensor_ids, actuator_ids, ...object } = values;
		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.insert(this.table)
				.values(object as InferInsertModel<typeof objects>)
				.returning();

			if (!record) throw new Error('Failed creating the specified resource');

			if (sensor_ids?.length) {
				await tx.insert(objects_to_sensors).values(
					sensor_ids.map((sensor_id) => ({
						object_id: record.id,
						sensor_id,
					})),
				);
			}

			if (actuator_ids?.length) {
				await tx.insert(objects_to_actuators).values(
					actuator_ids.map((actuator_id) => ({
						object_id: record.id,
						actuator_id,
					})),
				);
			}

			return record as InferSelectModel<typeof objects>;
		});
	}
}

export default ObjectsService;
