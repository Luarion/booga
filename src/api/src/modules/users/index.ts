import * as s from "./schema";
import { User, Controller } from "./controller";
import { Elysia, t } from "elysia";

const module = new Elysia({ prefix: "/users" });

module.post(
  "/",
  async ({ set, body: { email, phone, username, password, pfp } }) => {
    const record = await Controller.create(
      new User(email, phone, username, password, pfp),
    );
    set.status = 201;
    return record;
  },
  {
    body: s.register,
    response: { 201: s.select },
  },
);

module.get(
  "/",
  async ({ set }) => {
    const records = Controller.getAll();
    set.status = 200;
    return records;
  },
  { response: { 200: t.Array(s.select) } },
);

module.get(
  "/:id",
  async ({ set, params: { id } }) => {
    const record = Controller.getByID(id);
    set.status = 200;
    return record;
  },
  { params: t.Object({ id: t.Integer() }), response: { 200: s.select } },
);

export default module;
