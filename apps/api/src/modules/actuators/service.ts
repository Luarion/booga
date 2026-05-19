import type { actuators } from '@booga/db/schema';
import Service from '@/classes/Service';

class ActuatorsService extends Service<typeof actuators> {}

export default ActuatorsService;
