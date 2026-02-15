import db from "../../db";
import table from "../../db/schema/users";
import { eq, getTableColumns } from "drizzle-orm";
import { join } from "path";
import mime from "mime";
import type { BunFile } from "bun";

export class User {
  constructor(
    public readonly email: string,
    public readonly phone: string,
    public readonly username: string,
    public readonly password: string,
    public readonly pfp?: File | BunFile,
    public readonly id?: number,
  ) {}
}

export class Controller {
  static async create(user: User) {
    try {
      let UUID: string | undefined = undefined;
      if (user.pfp) {
        // TODO: benchmark the use of await
        UUID = await crypto.randomUUID();
        await Bun.write(
          join("uploads", UUID + "." + mime.getExtension(user.pfp.type)),
          user.pfp,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...columns } = getTableColumns(table);
      const [record] = await db
        .insert(table)
        .values({
          email: user.email.toLowerCase(),
          phone: user.phone.trim(),
          username: user.username.trim(),
          password_hash: await Bun.password.hash(user.password),
          pfp_hash: UUID,
        })
        .returning(columns);

      if (!record) throw new Error("Failed to create user");
      return record;
    } catch (error) {
      console.debug(error);
    }
  }

  static async getAll() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...columns } = getTableColumns(table);

    const records = await db.select(columns).from(table);
    if (!records) throw new Error("Failed to fetch users");
    return records;
  }

  static async getByID(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...columns } = getTableColumns(table);

    const [record] = await db
      .select(columns)
      .from(table)
      .where(eq(table.id, id));

    if (!record) throw new Error("User not found");
    return record;
  }
}
