import { Elysia, t } from "elysia";
import { Microcontroller } from "@/classes/test";

const microcontrollers: Microcontroller[] = [];

const plugin = new Elysia({
	prefix: "/microcontrollers",
	detail: { tags: ["microcontrollers"] },
}).post(
	"/manifest",
	async ({ request, server, body }) => {
		const IP = server?.requestIP(request)?.address;
		if (!IP) throw new Error("Failed obtaining client IP");

		microcontrollers.push(new Microcontroller(IP, body.mac));
	},
	{
		body: t.Object({
			mac: t.String(),
			sensors: t.Array(
				t.Object({
					id: t.Integer({ minimum: 1 }),
					type: t.String(),
					name: t.String(),
				}),
			),
			actuators: t.Array(
				t.Object({
					id: t.Integer({ minimum: 1 }),
					type: t.String(),
					name: t.String(),
				}),
			),
		}),
	},
);

export default plugin;
