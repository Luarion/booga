import { Elysia, t } from "elysia";

export default new Elysia({ name: "models.errors" }).model({
	"500": t.String(),
});
