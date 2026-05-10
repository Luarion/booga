import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';

import * as modules from './modules/index';

export const server = new Elysia({
	precompile: false,
	aot: true,
	prefix: '/api',
})
	.use(cors())
	.use(
		openapi({ documentation: { info: { title: 'Booga', version: '0.0.0' } } }),
	)
	.get('/ping', 'pong')
	.use(modules.users)
	.use(modules.roles)
	.use(modules.vehicles)
	.use(modules.setup)
	.use(modules.sign);

// Load modules dynamically
// Object.values(modules).forEach((m) => {w
//   const def = m.default;
//   if (def instanceof Elysia) {
//     const prefix = def.config.prefix;
//     console.info("Loading: " + prefix);
//     server.use(def);
//   } else {
//     throw new Error("Failed to load Elisya module: " + def);
//   }
// });

server.listen(
	Number(process.env.API_PORT) || 8080,
	({ protocol, hostname, port }) => {
		console.info(`Server listening on: ${protocol}://${hostname}:${port}`);
	},
);

export type Server = typeof server;
