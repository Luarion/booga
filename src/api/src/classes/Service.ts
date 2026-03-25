import type { Database, SchemaTables } from "@booga/db";
import { eq, getTableColumns } from "drizzle-orm";
import type Model from "./Model";

class Service<TTable extends SchemaTables, TModel extends Model<TTable>>
	implements CRUD
{
	readonly db: Database;
	readonly table: TTable;
	readonly columns: TTable["_"]["columns"];

	constructor(database: Database, table: TTable) {
		this.db = database;
		this.table = table;
		this.columns = getTableColumns(table);
	}

	async create(
		values: TModel["create"]["static"] | TModel["create"]["static"][],
	) {
		const records = await this.db
			.insert(this.table)
			.values(values)
			.returning(this.columns);
		return records;
	}

	async read(id?: number) {
		const query = this.db.select(this.columns).from(this.table);
		return !id ? query : query.where(eq(this.columns.id, id));
	}

	async delete(id: number) {
		const records = await this.db
			.delete(this.table)
			.where(eq(this.columns.id, id))
			.returning();
		return records;
	}
}

export default Service;
