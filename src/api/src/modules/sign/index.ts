import { Elysia, t } from "elysia";
import db from "../../db/index";
import Auth from "../../models/Auth";

import { body, response } from "./model";
import S from "./service";
import { eq } from "drizzle-orm";

export default new Elysia({ prefix: "/sign", precompile: true, aot: true })
  .get("/out", ({ status, cookie: { auth } }) => {
    if (auth) auth.remove();
    return status(200);
  })
  .resolve(async ({ status, cookie: { auth } }) => {
    if (auth?.value) return status(401);
  })
  .use(Auth.jwt)
  .post(
    "/up",
    async ({ jwt, cookie, status, body }) => {
      try {
        const auth = new Auth(cookie, jwt);
        const { email, phone, username, password, pfp } = body;

        const pfp_hash: string | undefined = pfp
          ? await S.pfp.hash(pfp)
          : undefined;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...columns } = S.table.columns;

        const record = await db.transaction(async (tx) => {
          const [insertion] = await tx
            .insert(S.table.schema)
            .values({
              email,
              phone,
              username,
              password_hash: await S.password.hash(password),
              pfp_hash,
            })
            .returning(columns);

          if (!insertion) throw new Error("Insert failed");
          if (pfp && pfp_hash) await S.pfp.save(pfp, pfp_hash);
          return insertion;
        });

        if (!record) return status(500, "User creation failed");

        (await auth.sign({ id: record.id })).setCookie();

        return status(201, record);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    {
      body: body.sign.up,
      response: { 201: response.select, 500: t.String() },
      transform({ body }) {
        body.email = body.email.trim().toLowerCase();
        body.phone = body.phone.trim();
        body.username = body.username.trim();
      },
    },
  )
  .post(
    "/in",
    async ({ status, jwt, cookie, body }) => {
      const auth = new Auth(cookie, jwt);
      const { email, password } = body;

      const [record] = await db
        .select()
        .from(S.table.schema)
        .where(eq(S.table.schema.email, email));

      if (!record) return status(404, "User not found");

      const { password_hash, ...refined } = record;

      await S.password.verify(password, password_hash);

      (await auth.sign({ id: record.id })).setCookie();

      return status(200, refined);
    },
    {
      body: body.sign.in,
      response: { 200: response.select, 404: t.String() },
      transform({ body }) {
        body.email = body.email.trim().toLowerCase();
      },
    },
  );
