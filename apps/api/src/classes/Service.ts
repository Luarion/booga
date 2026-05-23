import type { Database, SchemaTablesWithId } from '@booga/db';
import {
	eq,
	getTableColumns,
	type InferInsertModel,
	type InferSelectModel,
} from 'drizzle-orm';

// interface CRUD<TTable extends SchemaTablesWithId> {
// 	create(values: TReadInput): Promise<InferSelectModel<TTable>>;
// 	read(): Promise<InferSelectModel<TTable>[]>;
// 	// update(): Promise<object[]>;
// 	delete(id: number): unknown;
// }
// TODO: fix type errors
abstract class Service<
	TTable extends SchemaTablesWithId,
	TCreateInput = InferInsertModel<TTable>,
	TReadInput = InferSelectModel<TTable>,
	TUpdateInput = Partial<InferInsertModel<TTable>>,
> {
	protected readonly db: Database;
	protected readonly table: TTable;
	protected readonly columns: TTable['_']['columns'];

	constructor(database: Database, table: TTable) {
		this.db = database;
		this.table = table;
		this.columns = getTableColumns<TTable>(table);
	}

	async create(values: TCreateInput): Promise<TReadInput> {
		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.insert(this.table as any)
				.values(values as InferInsertModel<TTable>)
				.returning();
			if (!record) throw new Error('Failed creating the specified resource');
			return record as TReadInput;
		});
	}

	async read(): Promise<InferSelectModel<TTable>[]> {
		return await this.db.transaction(async (tx) => {
			return (await tx
				.select()
				.from(this.table as any)) as InferSelectModel<TTable>[];
		});
	}

	async readById(id: number): Promise<TReadInput> {
		return await this.db.transaction(async (tx) => {
			const [record] = await tx
				.select()
				.from(this.table as any)
				.where(eq(this.columns.id, id))
				.limit(1);
			if (!record) throw new Error('Failed getting the specified resource');
			return record as TReadInput;
		});
	}

	async update(id: number, values: TUpdateInput): Promise<TReadInput> {
		return await this.db.transaction(async (tx) => {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle generic type requirement
			const [record] = await tx
				.update(this.table as any)
				.set(values as Partial<InferInsertModel<TTable>>)
				.where(eq(this.columns.id, id))
				.returning();
			if (!record) throw new Error('Failed updating the specified resource');
			return record as TReadInput;
		});
	}

	async delete(id: number) {
		return await this.db.transaction(async (tx) => {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle generic type requirement
			return await tx.delete(this.table as any).where(eq(this.columns.id, id));
		});
	}
}

export default Service;
