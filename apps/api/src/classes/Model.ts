import type { SchemaTablesWithId } from "@booga/db";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-typebox";
import type { TSchema } from "elysia";

export class BaseSchemas<TTable extends SchemaTablesWithId> {
	readonly insert;
	readonly select;
	readonly update;

	constructor(table: TTable) {
		this.insert = createInsertSchema<TTable>(table);
		this.select = createSelectSchema<TTable>(table);
		this.update = createUpdateSchema<TTable>(table);
	}
}

abstract class Model<TTable extends SchemaTablesWithId> {
	readonly base: BaseSchemas<TTable>;
	abstract readonly create: TSchema;
	abstract readonly read: TSchema;

	constructor(table: TTable) {
		this.base = new BaseSchemas<TTable>(table);
	}
}

export default Model;
