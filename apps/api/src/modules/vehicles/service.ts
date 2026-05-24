import type { vehicles } from '@booga/db/schema';
import Service from '@/classes/Service';

class VehiclesService<TTable extends typeof vehicles> extends Service<TTable> {}

export default VehiclesService;
