import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

import * as modules from "./modules/index";

const server = new Elysia({ precompile: false, aot: true, prefix: "/api" })
  .use(cors())
  .use(openapi())
  .use(modules.sign)
  .use(modules.roles);

// Load modules dynamically
// Object.values(modules).forEach((m) => {
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
  Number(process.env.API_PORT) || 3000,
  ({ protocol, hostname, port }) => {
    console.info(`Server listening on: ${protocol}://${hostname}:${port}`);
  },
);

export type Server = typeof server;
