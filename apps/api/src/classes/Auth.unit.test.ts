import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Context } from 'elysia';

// ── Seed data ───────────────────────────────────────────────────────────
const VALID_PAYLOAD = { id: 1 };
const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.fake-token';

// ── Mock factories ──────────────────────────────────────────────────────
function makeMockJwt(
	overrides: {
		signReturn?: string | false;
		verifyReturn?: object | false;
	} = {},
) {
	return {
		sign: mock(async () => overrides.signReturn ?? FAKE_TOKEN),
		verify: mock(async () => overrides.verifyReturn ?? VALID_PAYLOAD),
	};
}

function makeMockCookie() {
	return {
		auth: {
			value: undefined as string | undefined,
			set: mock(() => {}),
		},
	};
}

// ── We need to import Auth dynamically to avoid the JWT_SECRET check at module level ──
// Auth reads JWT_SECRET on import; we set it before importing.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-unit-tests';

// Auth is imported after env is set
const { default: Auth } = await import('./Auth');

describe('Auth class', () => {
	let cookie: ReturnType<typeof makeMockCookie>;
	let jwt: ReturnType<typeof makeMockJwt>;
	let auth: InstanceType<typeof Auth>;

	beforeEach(() => {
		mock.restore();
		cookie = makeMockCookie();
		jwt = makeMockJwt();
		auth = new Auth(
			cookie as unknown as Context['cookie'],
			jwt as unknown as (typeof Auth.jwt)['decorator']['jwt'],
		);
	});

	// ─── sign() ──────────────────────────────────────────────────────────
	describe('sign()', () => {
		it('should generate a token and assign it to this.token', async () => {
			// Arrange — defaults already set

			// Act
			const result = await auth.sign(VALID_PAYLOAD);

			// Assert
			expect(jwt.sign).toHaveBeenCalledTimes(1);
			expect(auth.token).toBe(FAKE_TOKEN);
			expect(result).toBe(auth); // fluent API
		});

		it('should throw when jwt.sign returns a falsy value', async () => {
			// Arrange
			jwt = makeMockJwt({ signReturn: false as unknown as string });
			auth = new Auth(
				cookie as unknown as Context['cookie'],
				jwt as unknown as (typeof Auth.jwt)['decorator']['jwt'],
			);

			// Act & Assert
			expect(auth.sign(VALID_PAYLOAD)).rejects.toThrow(
				'Failed signing the JWT',
			);
		});
	});

	// ─── setCookie() ─────────────────────────────────────────────────────
	describe('setCookie()', () => {
		it('should throw when there is no token', () => {
			// Arrange — token is undefined by default

			// Act & Assert
			expect(() => auth.setCookie()).toThrow('Expected token');
		});

		it('should call cookie.auth.set with correct options when token is present', async () => {
			// Arrange
			await auth.sign(VALID_PAYLOAD);

			// Act
			const result = auth.setCookie();

			// Assert
			expect(cookie.auth.set).toHaveBeenCalledTimes(1);
			expect(cookie.auth.set).toHaveBeenCalledWith(
				expect.objectContaining({
					value: FAKE_TOKEN,
					httpOnly: true,
					path: '/',
				}),
			);
			expect(result).toBe(auth); // fluent API
		});
	});

	// ─── verify() ────────────────────────────────────────────────────────
	describe('verify()', () => {
		it('should throw when there is no token', async () => {
			// Arrange — token is undefined

			// Act & Assert
			expect(auth.verify()).rejects.toThrow('Missing token');
		});

		it('should throw when jwt.verify returns false', async () => {
			// Arrange
			jwt = makeMockJwt({ verifyReturn: false });
			auth = new Auth(
				cookie as unknown as Context['cookie'],
				jwt as unknown as (typeof Auth.jwt)['decorator']['jwt'],
			);
			auth.token = FAKE_TOKEN;

			// Act & Assert
			expect(auth.verify()).rejects.toThrow('Invalid token');
		});

		it('should resolve successfully when token is valid', async () => {
			// Arrange
			await auth.sign(VALID_PAYLOAD);

			// Act
			const result = await auth.verify();

			// Assert
			expect(jwt.verify).toHaveBeenCalledWith(FAKE_TOKEN);
			expect(result).toBe(auth);
		});
	});
});
