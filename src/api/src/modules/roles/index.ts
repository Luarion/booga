import { Elysia, t } from "elysia";
import * as table from "../../db/schema";
import db from "../../db/index";
import * as middleware from "../../middleware";

export default new Elysia({ prefix: "/roles" })
  .use(middleware.auth)
  .post(
    "/",
    async ({ status, body }) => {
      try {
        const payload = body.map(({ name }) => ({ name }));

        const records = await db
          .insert(table.roles)
          .values(payload)
          .returning();
        if (!records) return status(500, "Failed creating new roles");

        return status(201, records);
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
    async ({ status }) => {
      try {
        const records = await db.select().from(table.roles);
        if (!records) return status(500, "Failed creating new roles");

        return status(200, records);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    {
      response: {
        200: t.Array(t.Object({ id: t.Number(), name: t.String() })),
        500: t.String(),
      },
    },
  );
