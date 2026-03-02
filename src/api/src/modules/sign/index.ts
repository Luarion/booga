import { Elysia } from "elysia";
import db from "../../db/index";
import Auth from "../../models/Auth";

import { body, response } from "./model";
import S from "./service";
import { eq } from "drizzle-orm";

export default new Elysia({ prefix: "/sign" })
  .use(Auth.jwt)
  .post(
    "/up",
    async ({ jwt, cookie, set, body }) => {
      const auth = new Auth(set, cookie, jwt);
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

      (await auth.sign({ id: record.id })).setCookie();

      set.status = 201;
      return record;
    },
    {
      body: body.sign.up,
      response: { 201: response.select },
      transform({ body }) {
        body.email = body.email.trim().toLowerCase();
        body.phone = body.phone.trim();
        body.username = body.username.trim();
      },
    },
  )
  .post(
    "/in",
    async ({ set, jwt, cookie, body }) => {
      const auth = new Auth(set, cookie, jwt);
      const { email, password } = body;

      const [record] = await db
        .select()
        .from(S.table.schema)
        .where(eq(S.table.schema.email, email));

      if (!record) throw new Error("User not found");

      const { password_hash, ...refined } = record;

      await S.password.verify(password, password_hash);

      (await auth.sign({ id: record.id })).setCookie();

      set.status = 200;
      return refined;
    },
    {
      body: body.sign.in,
      transform({ body }) {
        body.email = body.email.trim().toLowerCase();
      },
    },
  );
