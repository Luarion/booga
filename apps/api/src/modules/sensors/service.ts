import type { sensors } from '@booga/db/schema';
import Service from '@/classes/Service';

class SensorsService extends Service<typeof sensors> {}

export default SensorsService;
