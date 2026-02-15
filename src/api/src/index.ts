import { Elysia } from "elysia";

// Module imports
import * as modules from "./modules/index";

const api = new Elysia();

// Load all defined modules
Object.values(modules).forEach((m) => {
  if (m.default instanceof Elysia) {
    const prefix = m.default.config.prefix;
    console.debug("Loading: " + prefix);
    api.use(m.default);
  }
});

api.listen(3000);

console.debug("working");
