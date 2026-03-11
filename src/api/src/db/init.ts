import db from ".";
import { sql } from "drizzle-orm";
import * as s from "./schema";

const categories = [
  { id: 1n, name: "volume" },
  { id: 2n, name: "weight" },
  { id: 3n, name: "temperature" },
  { id: 4n, name: "speed" },
  { id: 5n, name: "distance" },
  { id: 6n, name: "time" },
  { id: 7n, name: "pressure" },
];

const units = [
  { id: 1n, category_id: 1n, ucum: "m3" },
  { id: 2n, category_id: 2n, ucum: "N" },
  { id: 3n, category_id: 3n, ucum: "K" },
  { id: 4n, category_id: 4n, ucum: "m/s" },
  { id: 5n, category_id: 5n, ucum: "m" },
  { id: 6n, category_id: 6n, ucum: "s" },
  { id: 7n, category_id: 7n, ucum: "Pa" },
];

await db.transaction(async (tx) => {
  await tx
    .insert(s.units_categories)
    .values(categories)
    .onConflictDoUpdate({
      target: s.units_categories.id,
      set: { name: sql`excluded.name` },
    });
  await tx
    .insert(s.units)
    .values(units)
    .onConflictDoUpdate({
      target: s.units.id,
      set: { category_id: sql`excluded.category_id`, ucum: sql`excluded.ucum` },
    });
});
