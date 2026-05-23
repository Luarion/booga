import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import * as originalFs from 'node:fs';

// ── Mock fs before importing serverConfig ───────────────────────────────
const mockWriteFile = mock(async () => {});
const mockMkdir = mock(async () => undefined as unknown as string | undefined);

describe('serverConfig', () => {
	beforeEach(() => {
		mock.restore();
	});

	afterAll(() => {
		// Restore node:fs module to prevent test contamination
		mock.module('node:fs', () => originalFs);
	});

	it('normalizeConfig() should return default config when input is null', async () => {
		// Arrange — mock fs to return invalid JSON so it falls back to defaults
		mock.module('node:fs', () => ({
			...originalFs,
			default: (originalFs as Record<string, unknown>).default || originalFs,
			promises: {
				...originalFs.promises,
				readFile: mock(async () => {
					throw new Error('ENOENT');
				}),
				writeFile: mockWriteFile,
				mkdir: mockMkdir,
			},
		}));

		const serverConfig = await import('./serverConfig');

		// Act
		const result = await serverConfig.getConfig();

		// Assert
		expect(result).toBeDefined();
		expect(result.setup).toBeDefined();
		expect(result.setup.completed).toBe(false);
		expect(result.setup.completedAt).toBeNull();
	});

	it('getSetupCompleted() should return true when config has completed: true', async () => {
		// Arrange
		const configJson = JSON.stringify({
			setup: { completed: true, completedAt: '2025-01-01T00:00:00.000Z' },
		});

		mock.module('node:fs', () => ({
			...originalFs,
			default: (originalFs as Record<string, unknown>).default || originalFs,
			promises: {
				...originalFs.promises,
				readFile: mock(async () => configJson),
				writeFile: mockWriteFile,
				mkdir: mockMkdir,
			},
		}));

		const serverConfig = await import('./serverConfig');

		// Act
		const result = await serverConfig.getSetupCompleted();

		// Assert
		expect(result).toBe(true);
	});

	it('setSetupCompleted(true) should write JSON with completed: true and a completedAt ISO date', async () => {
		// Arrange
		const writtenData: string[] = [];
		mock.module('node:fs', () => ({
			...originalFs,
			default: (originalFs as Record<string, unknown>).default || originalFs,
			promises: {
				...originalFs.promises,
				readFile: mock(async () =>
					JSON.stringify({ setup: { completed: false, completedAt: null } }),
				),
				writeFile: mock(async (_path: string, content: string) => {
					writtenData.push(content);
				}),
				mkdir: mockMkdir,
			},
		}));

		const serverConfig = await import('./serverConfig');

		// Act
		await serverConfig.setSetupCompleted(true);

		// Assert
		expect(writtenData.length).toBeGreaterThan(0);
		const lastContent = writtenData[writtenData.length - 1];
		if (!lastContent) {
			throw new Error('No data written');
		}
		const lastWrite = JSON.parse(lastContent);
		expect(lastWrite.setup.completed).toBe(true);
		expect(lastWrite.setup.completedAt).toBeDefined();
		expect(typeof lastWrite.setup.completedAt).toBe('string');
	});
});
