import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp } from "../common";
import roles from "./roles";
import users from "./users";

export default table(
	"users_to_roles",
	{
		user_id: reference(() => users.id, { onDelete: "cascade" }),
		role_id: reference(() => roles.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.user_id, table.role_id] })],
);
