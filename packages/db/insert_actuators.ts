import { config } from 'dotenv';
config({ path: '../../.devcontainer/.env' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
const sql = postgres({
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});
const db = drizzle(sql);
async function main() {
  await db.execute("INSERT INTO microcontrollers.actuators (category_id, controller_id, alias) VALUES (1, 1, 'Válvula 1'), (1, 1, 'Motor Auxiliar'), (1, 1, 'Bomba Agua') ON CONFLICT DO NOTHING;");
  console.log('Actuators inserted!');
  process.exit(0);
}
main();
