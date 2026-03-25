import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { server } from "@/server";

describe("/users", () => {
	it("[GET]: /", async () => {
		const api = treaty(server);
		const { status } = await api.api.users.get();

		expect(status).toBe(200);
	});
});
