import { type actuators, actuators_readings } from '@booga/db/schema';
import { desc, eq } from 'drizzle-orm';
import Service from '@/classes/Service';

class ActuatorsService extends Service<typeof actuators> {
	async getReadings(actuatorId: number) {
		return await this.db
			.select()
			.from(actuators_readings)
			.where(eq(actuators_readings.actuator_id, actuatorId))
			.orderBy(desc(actuators_readings.timestamp))
			.limit(100);
	}
}

export default ActuatorsService;
