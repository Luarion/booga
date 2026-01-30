import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

const id = t.integer().primaryKey().generatedAlwaysAsIdentity();
const timestamp = t.timestamp().notNull().defaultNow();

export const users = table("users", {
  id: id,
  email: t.varchar({ length: 254 }).notNull().unique(),
  username: t.varchar({ length: 64 }).notNull().unique(),
  password_hash: t.varchar({ length: 128 }).notNull(),
  pfp: t.varchar({ length: 2048 }),
  timestamp: timestamp,
});

export const roles = table("roles", {
  id: id,
  name: t.varchar({ length: 64 }).notNull().unique(),
  timestamp: timestamp,
});

export const users_to_roles = table(
  "users_to_roles",
  {
    user_id: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: t
      .integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    timestamp: timestamp,
  },
  (table) => [t.primaryKey({ columns: [table.user_id, table.role_id] })],
);

export const controllers = table("controllers", {
  id: id,
  hash: t.varchar().notNull().unique(),
  timestamp: timestamp,
});

export const sensors = table("sensors", {
  id: id,
  controller_id: t
    .integer()
    .notNull()
    .references(() => controllers.id, { onDelete: "cascade" }),
  alias: t.varchar({ length: 64 }),
});

export const sensors_readings = table(
  "sensors_readings",
  {
    sensor_id: t
      .integer()
      .notNull()
      .references(() => sensors.id, { onDelete: "cascade" }),
    value: t.numeric().notNull(),
    timestamp: timestamp,
  },
  (table) => [t.primaryKey({ columns: [table.sensor_id, table.timestamp] })],
);

export const actuators = table("actuators", {
  id: id,
  controller_id: t
    .integer()
    .notNull()
    .references(() => controllers.id, { onDelete: "cascade" }),
  alias: t.varchar({ length: 64 }),
});

export const actuators_actions = table(
  "actuators_actions",
  {
    actuator_id: t
      .integer()
      .notNull()
      .references(() => sensors.id, { onDelete: "cascade" }),
    value: t.numeric().notNull(),
    timestamp: timestamp,
  },
  (table) => [t.primaryKey({ columns: [table.actuator_id, table.timestamp] })],
);
