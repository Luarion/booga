import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { server } from "@/server";

const path = "setup";
const api = treaty(server);

describe(`/${path}`, () => {
	it("[POST]: /", async () => {
		const { status, data } = await api.api[path].post({
			user: {
				email: faker.internet.email(),
				phone: faker.phone.number({ style: "international" }),
				username: faker.internet.username(),
				name: faker.person.firstName(),
				password: faker.internet.password(),
			},
			vehicle: {
				maker: faker.vehicle.manufacturer(),
				drive: "awd",
				displacement: "5.2",
				fuel: "diesel",
				plate: faker.vehicle.vrm(),
				registration_date: "02-02-2022",
				fuel_consumption: "5",
				model: "lotus",
			},
		});

		expect(status).toBe(201);
		expect(data).toHaveProperty("user");
		expect(data).toHaveProperty("vehicle");
	});
});
