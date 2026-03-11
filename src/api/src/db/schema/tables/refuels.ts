import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp, reference } from "../common";
import vehicles from "./vehicles";
import sensors_readings from "./sensors_readings";

export default table("refuels", {
  id: id(),
  vehicle_id: reference(() => vehicles.id, { onDelete: "cascade" }),
  initial_fuel_volume: reference(() => sensors_readings.id),
  final_fuel_volume: reference(() => sensors_readings.id),
  cost: t.numeric({ precision: 6, scale: 2, mode: "string" }),
  timestamp: timestamp(),
});
