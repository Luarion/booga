import db from "@booga/db";
import { Elysia } from "elysia";
import Model from "./model";
import Service from "./service";

export const model = new Model();
export const service = new Service(db);

const plugin = new Elysia({
	prefix: "/sign",
	detail: { tags: ["sign"] },
})
	.post(
		"/in",
		async ({ status, body }) => {
			return status(200, await service.signIn(body));
		},
		{
			body: model.signIn,
			transform({ body }) {
				body.email = body.email.trim().toLowerCase();
			},
			response: { 200: model.read },
			detail: { summary: "Sign in with email and password" },
		},
	)
	.post(
		"/up",
		async ({ status, body }) => {
			return status(201, await service.signUp(body));
		},
		{
			body: model.signUp,
			transform({ body }) {
				body.email = body.email.trim().toLowerCase();
				body.phone = body.phone.trim();
				body.username = body.username.trim();
				body.name = body.name.trim().toLowerCase();
			},
			response: { 201: model.read },
			detail: { summary: "Register a new user" },
		},
	);

export default plugin;
