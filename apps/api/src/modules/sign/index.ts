import db from '@booga/db';
import { Elysia, t } from 'elysia';
import Auth from '@/classes/Auth';
import Model from './model';
import Service from './service';

const isInvalidCredentials = (error: unknown): boolean =>
	error instanceof Error && error.message === 'Invalid credentials';

const isUniqueViolation = (error: unknown): boolean => {
	if (!error || typeof error !== 'object') return false;
	return 'code' in error && (error as { code?: string }).code === '23505';
};

export const model = new Model();
export const service = new Service(db);

const plugin = new Elysia({
	prefix: '/sign',
	detail: { tags: ['sign'] },
})
	.use(Auth.jwt)
	.post(
		'/in',
		async ({ status, body, cookie, jwt }) => {
			try {
				const user = await service.signIn(body);
				const auth = new Auth(cookie, jwt);
				await auth.sign({ id: user.id });
				auth.setCookie();
				return status(200, user);
			} catch (error) {
				console.error('[sign] Sign-in failed with error:', error);
				if (isInvalidCredentials(error))
					return status(401, 'Invalid credentials');
				return status(500, 'Unexpected error');
			}
		},
		{
			body: model.signIn,
			transform({ body }) {
				body.email = body.email.trim().toLowerCase();
			},
			response: { 200: model.read, 401: t.String(), 500: t.String() },
			detail: { summary: 'Sign in with email and password' },
		},
	)
	.post(
		'/up',
		async ({ status, body, cookie, jwt }) => {
			try {
				const user = await service.signUp(body);
				const auth = new Auth(cookie, jwt);
				await auth.sign({ id: user.id });
				auth.setCookie();
				return status(201, user);
			} catch (error) {
				console.error('[sign] Sign-up failed with error:', error);
				if (isUniqueViolation(error)) return status(409, 'User already exists');
				return status(500, 'Unexpected error');
			}
		},
		{
			body: model.signUp,
			transform({ body }) {
				body.email = body.email.trim().toLowerCase();
				body.phone = body.phone.trim();
				body.username = body.username.trim();
				body.name = body.name.trim().toLowerCase();
			},
			response: { 201: model.read, 409: t.String(), 500: t.String() },
			detail: { summary: 'Register a new user' },
		},
	)
	.post(
		'/out',
		({ status, cookie }) => {
			if (cookie.auth) {
				cookie.auth.set({
					value: '',
					httpOnly: true,
					secure: false,
					path: '/',
					maxAge: 0,
				});
			}
			return status(200, 'Signed out');
		},
		{
			response: { 200: t.String() },
			detail: { summary: 'Sign out user by clearing cookie' },
		},
	);

export default plugin;
