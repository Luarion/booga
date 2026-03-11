import { pgTable as table } from "drizzle-orm/pg-core";
// import * as t from "drizzle-orm/pg-core";
import { alias, id, timestamp } from "../common";

export default table("groups", {
  id: id(),
  alias: alias(),
  timestamp: timestamp()
});
