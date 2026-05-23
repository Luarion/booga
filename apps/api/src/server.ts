import db from '@booga/db';
import { vehicles } from '@booga/db/schema';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import serverConfig from './lib/serverConfig';
import * as middleware from './middleware/index';
import * as modules from './modules/index';
import { service as tripsService } from './modules/trips';

const uiOrigin = process.env.UI_ORIGIN?.trim() || 'http://localhost:3000';
const corsOrigins = uiOrigin
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);
const corsOrigin = corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;

export const server = new Elysia({
	precompile: false,
	aot: true,
	prefix: '/api',
})
	.onError(({ error }) => {
		console.error('SERVER ERROR STACK:', error);
	})
	.use(
		cors({
			origin: corsOrigin,
			credentials: true,
		}),
	)
	.use(
		openapi({ documentation: { info: { title: 'Booga', version: '0.0.0' } } }),
	)
	.use(middleware.setup)
	.use(middleware.auth)
	.get('/ping', 'pong')
	.use(modules.users)
	.use(modules.roles)
	.use(modules.vehicles)
	.use(modules.microcontrollers)
	.use(modules.categories)
	.use(modules.objects)
	.use(modules.actuators)
	.use(modules.sensors)
	.use(modules.trips)
	.use(modules.units)
	.use(modules.setup)
	.use(modules.sign);

server.listen(
	Number(process.env.API_PORT) || 8080,
	async ({ protocol, hostname, port }) => {
		console.info(`Server listening on: ${protocol}://${hostname}:${port}`);
		const setupCompleted = await serverConfig.getSetupCompleted();
		if (!setupCompleted) {
			console.info(
				'Initial setup not completed; skipping automatic trip start',
			);
			return;
		}

		let vid: number | undefined;
		if (process.env.VEHICLE_ID) {
			const v = Number(process.env.VEHICLE_ID);
			if (Number.isInteger(v) && v > 0) vid = v;
		}

		// If not provided by env, use the first vehicle in the database
		if (!vid) {
			console.info('Vehicle id not set; querying first vehicle in DB');
			const [first] = await db.select().from(vehicles).limit(1);
			if (first?.id) vid = first.id as number;
		}

		if (vid) {
			await tripsService.startTrip(vid);
		} else {
			console.warn('No valid vehicle id found; skipping automatic trip start');
		}
	},
);

process.on('SIGTERM', async () => {
	console.info('SIGTERM received, closing trip and shutting down...');
	await tripsService.endTrip();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.info('SIGINT received, closing trip and shutting down...');
	await tripsService.endTrip();
	process.exit(0);
});

export type Server = typeof server;
