import Service from "@/classes/Service";
import type { SchemaTables } from "@booga/db";
import type VehiclesModel from "./model";

class VehiclesService<
	TTable extends SchemaTables,
	TModel extends VehiclesModel<TTable>,
> extends Service<TTable, TModel> {}

export default VehiclesService;
