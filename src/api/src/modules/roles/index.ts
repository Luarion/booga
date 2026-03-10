import { Elysia, t } from "elysia";

// General
import db from "../../db/index";
import * as tables from "../../db/schema";
import * as middleware from "../../middleware";

export default new Elysia({ prefix: "/roles" })
  .use(middleware.auth)
  .get("/", async ({ status }) => {
    try {
      const records = await db.select().from(tables.roles);
      if (!records) return status(500, "Failed creating new roles");

      return status(200, records);
    } catch (error) {
      console.error(error);
      throw error;
    }
  })
  .post(
    "/",
    async ({ status, body }) => {
      try {
        const payload = body.map(({ name }) => ({ name }));

        const records = await db
          .insert(tables.roles)
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
  .group("/:id", (a) =>
    a
      .get("/", (ctx) => ctx)
      .put("/", (ctx) => ctx)
      .patch("/", (ctx) => ctx)
      .delete("/", (ctx) => ctx),
  );
