import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp, reference } from "../common";
import sensors_readings from "./sensors_readings";

export default table("locations", {
  id: id(),
  latitude: t.doublePrecision().notNull(),
  longitude: t.doublePrecision().notNull(),
  speed: reference(() => sensors_readings.id, { onDelete: "cascade" }),
  temperature: reference(() => sensors_readings.id, { onDelete: "cascade" }),
  fuel: reference(() => sensors_readings.id, { onDelete: "cascade" }),
  timestamp: timestamp(),
});
