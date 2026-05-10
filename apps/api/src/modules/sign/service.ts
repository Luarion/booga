import type { Database } from "@booga/db";
import { users } from "@booga/db/schema";
import { eq } from "drizzle-orm";
import type SignModel from "./model";
import { service as usersService } from "../users/index";

class SignService {
	private readonly db: Database;

	constructor(database: Database) {
		this.db = database;
	}

	async signIn(
		body: SignModel["signIn"]["static"],
	): Promise<SignModel["read"]["static"]> {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, body.email))
			.limit(1);

		if (!user) throw new Error("Invalid credentials");

		if (!(await Bun.password.verify(body.password, user.password_hash)))
			throw new Error("Invalid credentials");

		const { password_hash, ...refined } = user;
		return refined;
	}

	async signUp(
		body: SignModel["signUp"]["static"],
	): Promise<SignModel["read"]["static"]> {
		const { password_hash, ...refined } = await usersService.create(body);
		return refined;
	}
}

export default SignService;
