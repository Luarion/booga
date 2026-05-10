import jwt from '@elysiajs/jwt';
import { type Context, t } from 'elysia';

const JWT_SECRET: string = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

const schema = t.Object({
	id: t.Integer({ minimum: 1 }),
});

type payload = typeof schema.static;

export default class Auth {
	static readonly jwt = jwt({
		name: 'jwt',
		secret: JWT_SECRET,
		exp: '1d',
		schema: schema,
	});

	token: string | undefined;

	constructor(
		private readonly cookie: Context['cookie'],
		private readonly jwt: (typeof Auth.jwt)['decorator']['jwt'],
	) {
		this.token = this.cookie.auth?.value as string | undefined;
	}

	async sign(payload: payload): Promise<this> {
		this.token = await this.jwt.sign(payload);
		if (!this.token) throw new Error('Failed signing the JWT');
		return this;
	}

	setCookie(): this {
		if (!this.token) throw new Error('Expected token');

		this.cookie.auth?.set({
			value: this.token,
			httpOnly: true,
			secure: false,
			path: '/',
			maxAge: 1 * 86400,
		});
		return this;
	}

	async verify(): Promise<this> {
		if (!this.token) throw new Error('Missing token');
		const payload: payload | false = await this.jwt.verify(this.token);
		if (!payload) throw new Error('Invalid token');
		return this;
	}
}
