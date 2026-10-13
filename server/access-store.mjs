import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomInt, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { validateProduct } from './products.mjs';
export const defaultDatabase = join(homedir(), '.yuanxinglab', 'access.sqlite');
const hash = value => createHash('sha256').update(value).digest('hex');
export function openStore(path = defaultDatabase) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS codes (order_id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at INTEGER NOT NULL);`);
  // Legacy codes belong only to the original historical quiz. Old global cookies are not migrated.
  db.exec(`CREATE TABLE IF NOT EXISTS product_codes (product TEXT NOT NULL, order_id TEXT NOT NULL, code TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(product, order_id));
    CREATE TABLE IF NOT EXISTS product_sessions (token_hash TEXT PRIMARY KEY, product TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL);
    INSERT OR IGNORE INTO product_codes SELECT 'yuanxinglab', order_id, code, created_at FROM codes;`);
  return {
    issue(orderId, product = 'yuanxinglab') {
      validateProduct(product);
      if (typeof orderId !== 'string' || !orderId.trim() || orderId.trim().length > 128) throw new Error('请提供 1–128 字的订单号');
      orderId = orderId.trim();
      for (let attempt = 0; attempt < 100; attempt++) {
        const existing = db.prepare('SELECT code FROM product_codes WHERE order_id = ? AND product = ?').get(orderId, product);
        if (existing) return existing.code.length <= 8 ? existing.code : existing.code.match(/.{1,4}/g).join('-');
        db.prepare('INSERT OR IGNORE INTO product_codes VALUES (?, ?, ?, ?)').run(product, orderId, String(randomInt(1000000)).padStart(6, '0'), Date.now());
      }
      throw new Error('暂时无法生成兑换码，请重试');
    },
    redeem(rawCode, product = 'yuanxinglab') {
      validateProduct(product);
      const code = typeof rawCode === 'string' ? rawCode.replace(/[\s-]/g, '').toUpperCase() : '';
      if (!/^(?:[0-9]{6}|[0-9]{8}|[A-F0-9]{20})$/.test(code) || !db.prepare('SELECT 1 FROM product_codes WHERE code = ? AND product = ?').get(code, product)) return null;
      const token = randomBytes(32).toString('hex');
      db.prepare('DELETE FROM product_sessions WHERE expires_at <= ?').run(Date.now());
      db.prepare('INSERT INTO product_sessions VALUES (?, ?, ?, ?)').run(hash(token), product, code, Date.now() + 30 * 86400000);
      return token;
    },
    authorized(token, product = 'yuanxinglab') {
      validateProduct(product);
      return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token) && !!db.prepare('SELECT 1 FROM product_sessions WHERE token_hash = ? AND product = ? AND expires_at > ?').get(hash(token), product, Date.now());
    },
    close() { db.close(); },
  };
}
