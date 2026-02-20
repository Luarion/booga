import { Elysia } from "elysia";
import db from "../../db";
import table from "../../db/schema/users";
import * as s from "../../schemas/users";
import jwt from "../../jwt";
import { User } from "../../models/User";
import { getTableColumns } from "drizzle-orm";
import { join } from "path";
import mime from "mime";

const module = new Elysia({ prefix: "/signup" });

module.use(jwt).post(
  "/",
  async ({ set, cookie, jwt, body }) => {
    try {
      const { email, phone, username, password, pfp } = body;

      const user = new User(email, phone, username, password, pfp);

      // Hash the pfp
      let pfpHash: string | undefined = undefined;
      if (user.pfp) {
        const buffer: Uint8Array = new Uint8Array(await user.pfp.arrayBuffer());
        pfpHash = new Bun.CryptoHasher("sha256").update(buffer).digest("hex");
        const extension: string = mime.getExtension(user.pfp.type) ?? "bin";
        await Bun.write(join("uploads", `${pfpHash}.${extension}`), buffer);
        if (!pfpHash) throw new Error("Failed hashing the user's pfp");
      }

      const passwordHash: string = await Bun.password.hash(user.password);

      const payload: typeof s.insert.static = {
        email: user.email,
        phone: user.phone,
        username: user.username,
        password_hash: passwordHash,
        pfp_hash: pfpHash,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...columns } = getTableColumns(table);

      const [record] = await db
        .insert(table)
        .values(payload)
        .returning(columns); // Only retrieve needed columns

      if (!record) throw new Error("Failed saving the user into the DB");

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

      set.status = 201;
      return record;
    } catch (error) {
      console.debug(error);
      set.status = 500;
      throw error;
    }
  },
  { body: s.register },
);

export default module;
