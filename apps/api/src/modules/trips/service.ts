import { trips } from '@booga/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import Service from '@/classes/Service';

let currentTrip: InferSelectModel<typeof trips> | null = null;

class TripsService extends Service<typeof trips> {
	async startTrip(
		vehicleId?: number | null,
	): Promise<InferSelectModel<typeof trips>> {
		if (currentTrip) {
			console.warn('Trip already started');
			return currentTrip;
		}

		if (!vehicleId || vehicleId <= 0) {
			throw new Error('Invalid vehicleId provided to startTrip');
		}

		currentTrip = await this.create({
			vehicle_id: vehicleId,
			start: new Date(),
		});

		console.info(`Trip started: ${currentTrip.id}`);
		return currentTrip;
	}

	async endTrip(): Promise<InferSelectModel<typeof trips> | null> {
		if (!currentTrip) {
			console.warn('No active trip to end');
			return null;
		}

		const tripId = currentTrip.id;
		currentTrip = await this.update(tripId, {
			end: new Date(),
		});

		console.info(`Trip ended: ${tripId}`);
		return currentTrip;
	}

	getCurrentTrip(): InferSelectModel<typeof trips> | null {
		return currentTrip;
	}
}

export default TripsService;
