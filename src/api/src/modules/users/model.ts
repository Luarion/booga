import Model from "@/classes/Model";
import type { SchemaTables } from "@booga/db";
import { t } from "elysia";

class UsersModel<TTable extends SchemaTables> extends Model<TTable> {
	override create = t.Composite([
		t.Omit(this.base.insert, ["id", "password_hash", "pfp_hash", "timestamp"]),
		t.Object({ pfp: t.Optional(t.File()) }),
	]);
	override read = t.Omit(this.base.select, ["password_hash"]);
}

export default UsersModel;
