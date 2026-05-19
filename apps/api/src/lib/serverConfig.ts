import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve(process.cwd(), 'apps/api/config/server.json');

export type SetupConfig = {
	completed: boolean;
	completedAt: string | null;
};

export type ServerConfig = {
	setup: SetupConfig;
};

export type ServerConfigPatch = {
	setup?: Partial<SetupConfig>;
};

const DEFAULT_CONFIG: ServerConfig = {
	setup: {
		completed: false,
		completedAt: null,
	},
};

function normalizeConfig(raw: unknown): ServerConfig {
	if (!raw || typeof raw !== 'object') return DEFAULT_CONFIG;

	const record = raw as Record<string, unknown>;
	const setupRaw = record.setup as Record<string, unknown> | undefined;

	if (setupRaw && typeof setupRaw === 'object') {
		return {
			setup: {
				completed: Boolean(setupRaw.completed ?? setupRaw.setupCompleted),
				completedAt:
					typeof setupRaw.completedAt === 'string'
						? setupRaw.completedAt
						: typeof setupRaw.setupCompletedAt === 'string'
							? setupRaw.setupCompletedAt
							: null,
			},
		};
	}

	return {
		setup: {
			completed: Boolean(record.setupCompleted),
			completedAt:
				typeof record.setupCompletedAt === 'string'
					? record.setupCompletedAt
					: null,
		},
	};
}

async function readRaw(): Promise<ServerConfig> {
	try {
		const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
		const config = normalizeConfig(JSON.parse(raw) as unknown);
		await writeRaw(config);
		return config;
	} catch {
		await writeRaw(DEFAULT_CONFIG);
		return DEFAULT_CONFIG;
	}
}

async function writeRaw(cfg: ServerConfig): Promise<void> {
	const content = JSON.stringify(cfg, null, 2);
	await fs.mkdir(resolve(process.cwd(), 'apps/api/config'), {
		recursive: true,
	});
	await fs.writeFile(CONFIG_PATH, content, 'utf-8');
}

export async function getConfig(): Promise<ServerConfig> {
	return readRaw();
}

export async function setConfig(
	partial: ServerConfigPatch,
): Promise<ServerConfig> {
	const current = await readRaw();
	const next: ServerConfig = {
		setup: {
			completed: partial.setup?.completed ?? current.setup.completed,
			completedAt: partial.setup?.completedAt ?? current.setup.completedAt,
		},
	};
	await writeRaw(next);
	return next;
}

export async function getSetupCompleted(): Promise<boolean> {
	const cfg = await readRaw();
	return !!cfg.setup.completed;
}

export async function setSetupCompleted(value: boolean): Promise<void> {
	const now = value ? new Date().toISOString() : null;
	await setConfig({
		setup: {
			completed: value,
			completedAt: now,
		},
	});
}

export default {
	getConfig,
	setConfig,
	getSetupCompleted,
	setSetupCompleted,
};
