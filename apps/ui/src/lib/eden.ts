import type { Server } from '@booga/api/src/server';
import { edenTreaty } from '@elysiajs/eden';

export default edenTreaty<Server>('http://localhost:3000');
