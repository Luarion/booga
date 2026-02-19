import { Elysia } from "elysia";

import * as modules from "./modules/index";

const api = new Elysia();

// Load all defined modules
Object.values(modules).forEach((m) => {
  const def = m.default;
  if (def instanceof Elysia) {
    const prefix = def.config.prefix;
    console.info("Loading: " + prefix);
    api.use(def);
  } else {
    throw new Error("Failed to load Elisya module: " + def);
  }
});

// Start API server
api.listen(
  Number(process.env.API_PORT) || 3000,
  ({ protocol, hostname, port }) => {
    console.info(`Server listening on: ${protocol}://${hostname}:${port}`);
  },
);
