import { pgTable as table } from "drizzle-orm/pg-core";
// import * as t from "drizzle-orm/pg-core";
import { id, alias, reference } from "../common";
import controllers from "./microcontrollers";

export default table("sensors", {
  id: id(),
  controller_id: reference(() => controllers.id, { onDelete: "cascade" }),
  alias: alias().unique(),
});
