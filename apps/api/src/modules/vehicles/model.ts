import type { SchemaTablesWithId } from "@booga/db";
import { t } from "elysia";
import Model from "@/classes/Model";

class VehiclesModel<TTable extends SchemaTablesWithId> extends Model<TTable> {
	override create = t.Omit(this.base.insert, ["id", "timestamp"]);
	override read = t.Object(this.base.select.properties);
}

export default VehiclesModel;
