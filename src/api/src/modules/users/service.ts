import Service from "@/classes/Service";
import type { SchemaTables } from "@booga/db";
import type UsersModel from "./model";

class UsersService<
	TTable extends SchemaTables,
	TModel extends UsersModel<TTable>,
> extends Service<TTable, TModel> {}

export default UsersService;
