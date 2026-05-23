import { sensors, sensors_readings } from '@booga/db/schema';
import { eq, desc } from 'drizzle-orm';
import Service from '@/classes/Service';

class SensorsService extends Service<typeof sensors> {
	async getReadings(sensorId: number) {
		return await this.db
			.select()
			.from(sensors_readings)
			.where(eq(sensors_readings.sensor_id, sensorId))
			.orderBy(desc(sensors_readings.timestamp))
			.limit(100);
	}
}

export default SensorsService;
