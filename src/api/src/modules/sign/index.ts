import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import Auth from "../../classes/Auth";
// Global
import db from "../../db/index";
import * as models from "../../models";
import * as model from "./model";
// Local
import S from "./service";

export default new Elysia({ prefix: "/sign", name: "plugin.sign" })
	.get("/out", ({ status, cookie: { auth } }) => {
		if (auth) {
			auth.remove();
		} else return status(500);
		return status(200);
	})
	.use(Auth.jwt)
	.use(models.errors)
	.use(model.responses)
	.resolve(async ({ cookie, jwt, status }) => {
		if (cookie.auth?.value) return status(401);
		return { Auth: new Auth(cookie, jwt) };
	})
	.post(
		"/up",
		async ({ status, body, Auth }) => {
			const { email, phone, name, username, password, pfp } = body;

			const pfp_hash: string | undefined = pfp
				? await S.pfp.hash(pfp)
				: undefined;

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password_hash, ...columns } = S.table.columns;

			const record = await db.transaction(async (tx) => {
				const [insertion] = await tx
					.insert(S.table.schema)
					.values({
						email,
						phone,
						name,
						username,
						password_hash: await S.password.hash(password),
						pfp_hash,
					})
					.returning(columns);

				if (!insertion) throw new Error("Insert failed");
				if (pfp && pfp_hash) await S.pfp.save(pfp, pfp_hash);
				return insertion;
			});

			if (!record) return status(500, "User creation failed");
			(await Auth.sign({ id: record.id })).setCookie();
			return status(201, record);
		},
		{ body: model.sign.up, response: { 201: "user", 500: "500" } },
	)
	.post(
		"/in",
		async ({ status, body, Auth }) => {
			const { email, password } = body;

			const [record] = await db
				.select()
				.from(S.table.schema)
				.where(eq(S.table.schema.email, email));

			if (!record) return status(404, "User not found");

			const { password_hash, ...refined } = record;

			await S.password.verify(password, password_hash);
			(await Auth.sign({ id: record.id })).setCookie();
			return status(200, refined);
		},
		{ body: model.sign.in, response: { 200: "user", 404: "500", 500: "500" } },
	);
