import { Elysia } from "elysia";
import db from "../../db";
import table from "../../db/schema/users";
import { eq } from "drizzle-orm";
import jwt from "../../jwt";
import * as s from "../../schemas/users";

const module = new Elysia({ prefix: "/signin" });

module.use(jwt).post(
  "/",
  async ({ jwt, set, cookie, body }) => {
    try {
      const { email, password } = body;

      const [record] = await db
        .select()
        .from(table)
        .where(eq(table.email, email.trim().toLowerCase()));

      if (!record) throw new Error("User not found");
      if (!(await Bun.password.verify(password, record.password_hash)))
        throw new Error("Password missmatch");

      const token: string = await jwt.sign({
        id: record.id,
      });

      cookie.auth?.set({
        value: token,
        httpOnly: true,
        secure: false,
        path: "/",
        maxAge: 1 * 86400,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...refined } = record;

      set.status = 200;
      return refined;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  },
  {
    body: s.login,
  },
);

export default module;
