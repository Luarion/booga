import { reset } from 'drizzle-seed';
import db from '../src/index';
import * as schema from '../src/schema';

console.log('Resetting DB...');
await reset(db, schema);
console.log('DB reset done');
process.exit(0);
