import { actuators, type microcontrollers, sensors } from '@booga/db/schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import Service from '@/classes/Service';

type MicrocontrollerManifest = Omit<
	InferInsertModel<typeof microcontrollers>,
	'id' | 'timestamp'
> & {
	sensors?: Array<
		Omit<InferInsertModel<typeof sensors>, 'id' | 'controller_id'>
	>;
	actuators?: Array<
		Omit<InferInsertModel<typeof actuators>, 'id' | 'controller_id'>
	>;
};

class MicrocontrollersService extends Service<typeof microcontrollers> {
	override async create(values: MicrocontrollerManifest) {
		const {
			sensors: sensorsManifest,
			actuators: actuatorsManifest,
			...microcontroller
		} = values;
		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.insert(this.table)
				.values(microcontroller as InferInsertModel<typeof microcontrollers>)
				.returning();

			if (!record) throw new Error('Failed creating the specified resource');

			if (sensorsManifest?.length) {
				await tx.insert(sensors).values(
					sensorsManifest.map((sensor) => ({
						...sensor,
						controller_id: record.id,
					})),
				);
			}

			if (actuatorsManifest?.length) {
				await tx.insert(actuators).values(
					actuatorsManifest.map((actuator) => ({
						...actuator,
						controller_id: record.id,
					})),
				);
			}

			return record as InferSelectModel<typeof microcontrollers>;
		});
	}
}

export default MicrocontrollersService;
