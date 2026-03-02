import jwt from "@elysiajs/jwt";
import { t, type Context } from "elysia";

const schema = t.Object({
  id: t.Integer({ minimum: 1 }),
});

type payload = typeof schema.static;

export default class Auth {
  static readonly jwt = jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET! as string,
    exp: "1d",
    schema: schema,
  });

  token: string | undefined;

  constructor(
    private readonly set: Context["set"],
    private readonly cookie: Context["cookie"],
    private readonly jwt: (typeof Auth.jwt)["decorator"]["jwt"],
  ) {
    this.token = this.cookie.auth?.value as string | undefined;
  }

  async sign(payload: payload) {
    this.token = await this.jwt.sign(payload);
    if (!this.token) throw new Error("Failed signing the JWT");
    return this;
  }

  setCookie() {
    if (!this.token) throw new Error("Expected token");

    this.cookie.auth?.set({
      value: this.token,
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 1 * 86400,
    });
    return this;
  }

  async verify(): Promise<payload> {
    if (!this.token) {
      this.set.status = 401;
      throw new Error("Missing auth token");
    }

    const payload: payload | false = await this.jwt.verify(this.token);

    if (!payload) {
      this.set.status = 401;
      throw new Error("Invalid auth token");
    }

    return payload;
  }
}
