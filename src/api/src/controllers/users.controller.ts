import type { Request, Response } from "express";
import db from "../db";
import { users as schema } from "../db/schema/users";
import argon2 from "argon2";

export const create = async (req: Request, res: Response) => {
  const { password, ...clean } = req.body;

  const values: typeof schema.$inferInsert = {
    ...clean,
    password_hash: await argon2.hash(password),
    pfp: req.file?.filename,
  };

  await db.insert(schema).values(values);
  res.status(201).json({ message: "User created" });
};
