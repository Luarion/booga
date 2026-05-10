import type { SchemaTablesWithId } from "@booga/db";
import type Model from "./Model";

export default abstract class DTO<
	TTable extends SchemaTablesWithId,
	TModel extends Model<TTable>,
> {
	private readonly values: TModel["create"]["static"];

	constructor(values: TModel["create"]["static"]) {
		this.values = values;
	}

	normalization() {
		return this.values;
	}

	payload() {
		return this.values;
	}
}
