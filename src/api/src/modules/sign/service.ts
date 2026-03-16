import { mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { getTableColumns } from "drizzle-orm";
import { users as table } from "@/db/schema";

export default abstract class {
	static readonly table = {
		schema: table,
		columns: getTableColumns(table),
	};

	static readonly password = {
		async hash(password: string): Promise<string> {
			return Bun.password.hash(password);
		},
		async verify(password: string, hash: string): Promise<boolean> {
			const bool: boolean = await Bun.password.verify(password, hash);
			if (!bool) throw new Error("Password missmatch");
			return bool;
		},
	};

	static readonly pfp = {
		async hash(pfp: File): Promise<string> {
			return pfp.arrayBuffer().then((buffer) => {
				const hasher = new Bun.CryptoHasher("sha256");
				hasher.update(new Uint8Array(buffer));
				return hasher.digest("hex");
			});
		},
		async save(pfp: File, hash: string): Promise<string> {
			await mkdir("uploads", { recursive: true });

			const extension = extname(pfp.name || "").toLowerCase() || ".bin";
			const filePath = join("uploads", `${hash}${extension}`);

			if (await Bun.file(filePath).exists()) {
				return filePath;
			}

			await Bun.write(filePath, pfp);
			return filePath;
		},
	};
}
