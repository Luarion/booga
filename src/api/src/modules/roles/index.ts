import { Elysia, t } from "elysia";
import * as table from "../../db/schema";
import db from "../../db/index";
import Auth from "../../models/Auth";

const module = new Elysia({ prefix: "/roles" });

module
  .use(Auth.jwt)
  .post(
    "/",
    async ({ set, cookie, jwt, body }) => {
      try {
        const auth = new Auth(set, cookie, jwt);
        await auth.verify();

        const payload = body.map(({ name }) => ({ name }));

        const records = await db
          .insert(table.roles)
          .values(payload)
          .returning();
        if (!records.length) {
          set.status = 500;
          throw new Error("Failed creating new roles");
        }

        set.status = 201;
        return records;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    {
      body: t.Array(
        t.Object({ name: t.String({ minLength: 2, maxLength: 64 }) }),
      ),
    },
  )
  .get(
    "/",
    async ({ set, cookie, jwt }) => {
      try {
        const auth = new Auth(set, cookie, jwt);
        await auth.verify();

        const records = await db.select().from(table.roles);
        if (!records) {
          set.status = 500;
          throw new Error("Failed getting all the roles");
        }

        set.status = 200;
        return records;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    {
      response: {
        200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
      },
    },
  );

export default module;
