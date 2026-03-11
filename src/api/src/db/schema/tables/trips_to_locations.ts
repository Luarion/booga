import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { reference } from "../common";
import locations from "./locations";
import trips from "./trips";

export default table(
  "trips_to_locations",
  {
    location_id: reference(() => locations.id, { onDelete: "cascade" }),
    trip_id: reference(() => trips.id, { onDelete: "cascade" }),
  },
  (table) => [t.primaryKey({ columns: [table.location_id, table.trip_id] })],
);
