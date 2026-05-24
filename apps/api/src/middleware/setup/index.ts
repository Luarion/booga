import { Elysia } from 'elysia';
import serverConfig from '@/lib/serverConfig';

export default new Elysia({ name: 'setup.middleware' }).resolve(
	{ as: 'scoped' },
	async ({ request, status }) => {
		if (process.env.NODE_ENV === 'test') return;
		const req = request as unknown as { url?: unknown };
		const method = request.method;
		const url: string =
			typeof req.url === 'string' ? req.url : String(req.url ?? '/');
		const pathname = new URL(url, 'http://localhost').pathname;

		const completed = await serverConfig.getSetupCompleted();
		const isSetupRoute = pathname.startsWith('/api/setup');

		if (!completed) {
			// Only allow setup endpoints before setup is completed.
			if (!isSetupRoute) return status(503);
			return;
		} else {
			// After setup, keep GET /api/setup available for the UI, but block mutations.
			if (isSetupRoute && method !== 'GET') return status(404);
		}
	},
);
