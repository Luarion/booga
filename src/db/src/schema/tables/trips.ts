import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, reference, timestamp, createSchemas } from "../common";
import vehicles from "./vehicles";

const trips = table("trips", {
	id: id(),
	vehicle_id: reference(() => vehicles.id, { onDelete: "cascade" }),
	starting_date: timestamp(),
	ending_date: t.timestamp(),
});

export default trips;

export const schemas = createSchemas(trips);
