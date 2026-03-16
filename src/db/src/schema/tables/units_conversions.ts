import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference } from "../common";
import units from "./units";

export default table(
	"units_conversions",
	{
		from: reference(() => units.id, { onDelete: "cascade" }),
		to: reference(() => units.id, { onDelete: "cascade" }),
		factor: t.numeric().notNull(),
	},
	(table) => [t.primaryKey({ columns: [table.from, table.to] })],
);
