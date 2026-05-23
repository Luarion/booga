import { Elysia } from 'elysia';
import Auth from '@/classes/Auth';

export default new Elysia({ name: 'auth.middleware' })
	.use(Auth.jwt)
	.resolve(
		{ as: 'scoped' },
		async ({ cookie: { auth }, jwt, status, request }) => {
			const token = auth?.value as string | undefined;
			const req = request as unknown as { url?: unknown };
			const rawUrl =
				typeof req.url === 'string' ? req.url : String(req.url ?? '/');
			let path = '/';
			try {
				path = new URL(rawUrl).pathname || '/';
			} catch {
				path = (rawUrl.split('?')[0] as string) || '/';
			}
			const isSignRoute = path === '/api/sign/in' || path === '/api/sign/up';

			if (isSignRoute) {
				return;
			}

			if (!token) return status(401);
			const payload = await jwt.verify(token).catch(() => false);
			if (!payload) return status(401);
		},
	);
