import { seed } from "drizzle-seed";
import db from "@/index";
import * as schema from "@/schema/index";
import { faker as f } from "@faker-js/faker";

const count: number = 20;

const sequentialIds = Array.from({ length: count }, (_, i) => i + 1);

await seed(db, schema, { count }).refine((r) => ({
  vehicles: {
    columns: {
      plate: r.valuesFromArray({
        values: f.helpers.uniqueArray(f.vehicle.vrm, 20),
        isUnique: true,
      }),
      maker: r.valuesFromArray({
        values: Array.from({ length: count }, () => f.vehicle.manufacturer()),
      }),
      model: r.valuesFromArray({
        values: Array.from({ length: count }, () => f.vehicle.model()),
      }),
    },
  },
  users: {
    columns: {
      email: r.email(),
      name: r.fullName(),
      phone: r.phoneNumber(),
    },
  },
  microcontrollers: {
    columns: {
      mac: r.valuesFromArray({
        values: f.helpers.uniqueArray(f.internet.mac, count),
        isUnique: true,
      }),
    },
  },
  groups_to_objects: {
    columns: {
      object_id: r.valuesFromArray({
        values: sequentialIds,
        isUnique: true,
      }),
    },
  },
  units_conversions: {
    columns: {
      from: r.valuesFromArray({
        values: sequentialIds,
        isUnique: true,
      }),
    },
  },
}));
