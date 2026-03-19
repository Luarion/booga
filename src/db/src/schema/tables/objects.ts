import { pgTable as table } from "drizzle-orm/pg-core";
import { alias, id, timestamp, createSchemas } from "../common";

const objects = table("objects", {
	id: id(),
	alias: alias().unique(),
	timestamp: timestamp(),
});

export default objects;

export const schemas = createSchemas(objects);
