import { Router } from "express";

import z from "zod";
import { createInsertSchema } from "drizzle-zod";

import validate from "../middleware/validate";
import { users as schema } from "../db/schema/schema";
import * as c from "../controllers/users";

// import multer from "multer";
// const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/",
  // upload.single("avatar"),
  validate(
    createInsertSchema(schema, {
      username: (s) => s.trim(),
      email: (s) => s.trim(),
    })
      .extend({ password: z.string().min(8).max(32) })
      .omit({ password_hash: true, timestamp: true }),
  ),
  c.create,
);

export default router;
