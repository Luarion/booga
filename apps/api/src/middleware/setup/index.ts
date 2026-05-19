import { Elysia } from 'elysia';
import serverConfig from '@/lib/serverConfig';

export default new Elysia({ name: 'setup.middleware' }).resolve(
	{ as: 'scoped' },
	async ({ request, status }) => {
		const req = request as unknown as { url?: unknown };
		const url: string =
			typeof req.url === 'string' ? req.url : String(req.url ?? '/');
		const path: string = (url.split('?')[0] as string) || '/';

		const completed = await serverConfig.getSetupCompleted();

		if (!completed) {
			// Only allow setup endpoints before setup is completed
			if (!path.startsWith('/api/setup')) return status(503);
		} else {
			// After setup, block access to /setup
			if (path.startsWith('/api/setup')) return status(404);
		}
	},
);
