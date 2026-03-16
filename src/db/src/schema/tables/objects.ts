import { pgTable as table } from "drizzle-orm/pg-core";
import { alias, id, timestamp } from "../common";

export default table("objects", {
	id: id(),
	alias: alias().unique(),
	timestamp: timestamp(),
});
