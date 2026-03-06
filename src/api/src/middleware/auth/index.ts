import { Elysia } from "elysia";
import Auth from "../../models/Auth";

export default new Elysia({
  name: "auth.middleware",
  aot: true,
  precompile: true,
})
  .use(Auth.jwt)
  .resolve({ as: "scoped" }, async ({ cookie: { auth }, jwt, status }) => {
    const token: string = auth?.value as string;
    if (!token || !jwt.verify(token)) return status(401);
  });
