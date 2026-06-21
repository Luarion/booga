import { Elysia } from 'elysia';
import Auth from '@/classes/Auth';

export default new Elysia({ name: 'auth.middleware' })
	.use(Auth.jwt)
	.resolve({ as: 'scoped' }, async () => {
		return; 
		
	});
