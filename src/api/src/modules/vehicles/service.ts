import type { vehicles } from "@booga/db/schema";
import Service from "@/classes/Service";
import type VehiclesModel from "./model";

class VehiclesService<
	TTable extends typeof vehicles,
	TModel extends VehiclesModel<TTable>,
> extends Service<TTable, TModel> {}

export default VehiclesService;
