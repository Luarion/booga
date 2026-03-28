import type { SchemaTablesWithId } from "@booga/db";
import Service from "@/classes/Service";
import type UsersModel from "./model";

class UsersService<
	TTable extends SchemaTablesWithId,
	TModel extends UsersModel<TTable>,
> extends Service<TTable, TModel> {}

export default UsersService;
