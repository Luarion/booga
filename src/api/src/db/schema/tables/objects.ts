import { pgTable as table } from "drizzle-orm/pg-core";
import { id, alias, timestamp } from "../common";

export default table("objects", {
  id: id(),
  alias: alias().unique(),
  timestamp: timestamp(),
});
