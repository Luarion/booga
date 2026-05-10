import type { users } from "@booga/db/schema";
import { eq } from "drizzle-orm";
import Service from "@/classes/Service";
import type UsersModel from "./model";

class UsersService<
	TTable extends typeof users,
	TModel extends UsersModel<TTable>,
> extends Service<TTable, TModel> {
	// override async readById(id: number): Promise<TModel["read"]["static"]> {
	// 	const { password_hash, ...columns } = this.columns;
	// 	return (await this.db
	// 		.select(columns)
	// 		.from(this.table)
	// 		.where(eq(this.columns.id, id))
	// 		.limit(1));
	// }
}

export default UsersService;
