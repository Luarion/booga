import Model from "@/classes/Model";
import type { SchemaTables } from "@booga/db";
import { t } from "elysia";

class VehiclesModel<TTable extends SchemaTables> extends Model<TTable> {
    override create = t.Omit(this.base.insert, ["id", "timestamp"])
}

export default VehiclesModel;
