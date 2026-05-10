import type { SchemaTablesWithId } from '@booga/db';
import Service from '@/classes/Service';

class UsersService<TTable extends SchemaTablesWithId> extends Service<TTable> {}

export default UsersService;
