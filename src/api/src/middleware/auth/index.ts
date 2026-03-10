import { Elysia } from "elysia";
import Auth from "../../classes/Auth";

export default new Elysia({ name: "auth.middleware" })
  .use(Auth.jwt)
  .resolve({ as: "scoped" }, async ({ cookie: { auth }, jwt, status }) => {
    const token: string = auth?.value as string;
    if (!token || !jwt.verify(token)) return status(401);
  });
