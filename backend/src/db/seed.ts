import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from './pool';
import { config } from '../config';

const CATEGORIES = ['Audio', 'Accessories', 'Cameras', 'Wearables', 'Storage', 'Home', 'Power', 'Bags', 'Reading'];
const ADJ = ['Aurora', 'Nimbus', 'Vertex', 'Pulse', 'Drift', 'Quartz', 'Halo', 'Forge', 'Cobalt', 'Ember', 'Slate', 'Apex', 'Lumen', 'Tidal', 'Onyx'];
const NOUN = ['Earbuds', 'Keyboard', 'Action Cam', 'Smartwatch', 'Headphones', 'SSD', 'Desk Lamp', 'USB-C Hub', 'Mouse', 'Travel Mug', 'E-Reader', 'Speaker', 'Webcam', 'Charger', 'Tracker'];

async function main() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  console.log('Applying schema...');
  await pool.query(schema);

  console.log('Resetting tables...');
  await pool.query('TRUNCATE reviews, orders, products RESTART IDENTITY CASCADE');

  const PRODUCT_COUNT = 80;
  console.log(`Seeding ${PRODUCT_COUNT} products...`);
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const name = `${ADJ[i % ADJ.length]} ${NOUN[i % NOUN.length]} ${i + 1}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    await pool.query('INSERT INTO products(name, category) VALUES ($1,$2)', [name, category]);
  }

  const orders = config.seedOrders;
  console.log(`Seeding ${orders} orders (batched)...`);
  const BATCH = 1000;
  for (let start = 0; start < orders; start += BATCH) {
    const values: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    for (let j = 0; j < BATCH && start + j < orders; j++) {
      const productId = 1 + Math.floor(Math.random() * PRODUCT_COUNT);
      const qty = 1 + Math.floor(Math.random() * 4);
      const amount = (qty * (10 + Math.random() * 140)).toFixed(2);
      values.push(`($${p++}, $${p++}, $${p++})`);
      params.push(productId, qty, amount);
    }
    await pool.query(`INSERT INTO orders(product_id, qty, amount) VALUES ${values.join(',')}`, params);
  }

  console.log('Seeding reviews...');
  const REVIEWS = Math.floor(orders / 5);
  for (let start = 0; start < REVIEWS; start += BATCH) {
    const values: string[] = [];
    const params: unknown[] = [];
    let p = 1;
    for (let j = 0; j < BATCH && start + j < REVIEWS; j++) {
      const productId = 1 + Math.floor(Math.random() * PRODUCT_COUNT);
      const rating = 3 + Math.floor(Math.random() * 3); // 3-5
      values.push(`($${p++}, $${p++})`);
      params.push(productId, rating);
    }
    await pool.query(`INSERT INTO reviews(product_id, rating) VALUES ${values.join(',')}`, params);
  }

  await pool.query('ANALYZE');
  console.log('Seed complete.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
