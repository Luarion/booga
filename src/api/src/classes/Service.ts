import type { Database, SchemaTablesWithId } from "@booga/db";
import {
	eq,
	getTableColumns,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import type Model from "./Model";

// interface CRUD<TTable extends SchemaTablesWithId> {
// 	create(values: InferInsertModel<TTable>): Promise<InferSelectModel<TTable>>;
// 	read(): Promise<InferSelectModel<TTable>[]>;
// 	// update(): Promise<object[]>;
// 	delete(id: number): unknown;
// }

abstract class Service<
	TTable extends SchemaTablesWithId,
	TModel extends Model<TTable>,
> {
	readonly db: Database;
	readonly table: TTable;
	readonly columns: TTable["_"]["columns"];

	constructor(database: Database, table: TTable) {
		this.db = database;
		this.table = table;
		this.columns = getTableColumns<TTable>(table);
	}

	async create(
		values: InferInsertModel<TTable>,
	): Promise<InferSelectModel<TTable>> {
		try {
			const [record] = await this.db
				.insert(this.table)
				.values(values)
				.returning();
			if (!record) throw new Error("Failed creating the specified resource");
			return record as InferSelectModel<TTable>;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async read(): Promise<InferSelectModel<TTable>[]> {
		try {
			return (await this.db
				.select()
				.from(this.table)) as InferSelectModel<TTable>[];
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async readById(id: number) {
		try {
			const [record] = await this.db
				.select()
				.from(this.table)
				.where(eq(this.columns.id, id))
				.limit(1);
			if (!record) throw new Error("Failed getting the specified resource");
			return record;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async delete(id: number) {
		try {
			return await this.db.delete(this.table).where(eq(this.columns.id, id));
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
}

export default Service;
