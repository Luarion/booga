import { pgTable as table } from "drizzle-orm/pg-core";
import { id, alias } from "./common";

const schema = table("objects", {
  id: id(),
  alias: alias().unique(),
});

export default schema;
