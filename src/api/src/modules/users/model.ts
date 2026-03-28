import type { SchemaTablesWithId } from "@booga/db";
import { t } from "elysia";
import Model from "@/classes/Model";

class UsersModel<TTable extends SchemaTablesWithId> extends Model<TTable> {
	override create = t.Composite([
		t.Omit(this.base.insert, ["id", "password_hash", "pfp_hash", "timestamp"]),
		t.Object({
			password: t.String(),
			pfp: t.Optional(
				t.File({
					type: ["image/jpeg", "image/png", "image/webp"],
					maxSize: "100m",
				}),
			),
		}),
	]);
	override read = t.Omit(this.base.select, ["password_hash"]);
}

export default UsersModel;
