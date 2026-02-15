import { Elysia } from "elysia";

// Module imports
import * as m from "./modules/index";

const api = new Elysia();

api.use(m.users.default);

api.listen(3000);

console.debug("working");
