import type { SchemaTables } from "@booga/db";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

export class BaseSchemas<TTable extends SchemaTables> {
	readonly insert;
	readonly select;

	constructor(table: TTable) {
		this.insert = createInsertSchema(table);
		this.select = createSelectSchema(table);
	}
}

class Model<TTable extends SchemaTables> {
	readonly base: BaseSchemas<TTable>;
	readonly create: ReturnType<typeof t.Object>;
	readonly read: ReturnType<typeof t.Object>;

	constructor(table: TTable) {
		this.base = new BaseSchemas<TTable>(table);
		this.create = t.Omit(this.base.insert, ["id"]);
		this.read = t.Omit(this.base.select, []);
	}
}

export default Model;
