import jwt from "@elysiajs/jwt";
import { t } from "elysia";

export default jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET! as string,
  exp: "1d",
  schema: t.Object({
    id: t.Integer({ minimum: 1 }),
  }),
});
