import { Elysia, t } from "elysia";
import db from "../../db";
import table from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { jwt } from "@elysiajs/jwt";

const module = new Elysia({ prefix: "/login" });

module
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET! as string,
      exp: "1d",
      schema: t.Object({
        id: t.Integer({ minimum: 1 }),
      }),
    }),
  )
  .post(
    "/",
    async ({ jwt, set, cookie, body: { email, password } }) => {
      const [record] = await db
        .select({ id: table.id, password_hash: table.password_hash })
        .from(table)
        .where(eq(table.email, email.trim().toLowerCase()));

      if (!record) throw new Error("User not found");
      if (!(await Bun.password.verify(password, record.password_hash)))
        throw new Error("Password missmatch");

      const token = await jwt.sign({
        id: record.id,
      });

      cookie.auth?.set({
        value: token,
        httpOnly: true,
        secure: false,
        path: "/",
        maxAge: 1 * 86400,
      });

      set.status = 200;
      return { login: true };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    },
  );

export default module;
