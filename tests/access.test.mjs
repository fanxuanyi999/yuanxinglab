import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { openStore } from '../server/access-store.mjs';
import { createAccessServer } from '../server/access-server.mjs';

test('一单一码持久保存，允许重复兑换，拒绝未知码及伪造会话', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'yuanxing-access-'));
  let store = openStore(join(dir, 'test.sqlite'));
  try {
    const code = store.issue('order-1');
    assert.match(code, /^\d{6}$/);
    const seedDb = new DatabaseSync(join(dir, 'test.sqlite'));
    for (const [order, saved] of [['legacy-eight', '01234567'], ['leading-zero', '012345'], ['legacy-long', 'ABCDEF0123456789ABCD']]) {
      seedDb.prepare('INSERT INTO codes VALUES (?, ?, ?)').run(order, saved, Date.now());

    }
    seedDb.close();
    store.close(); store = openStore(join(dir, 'test.sqlite'));
    assert.ok(store.authorized(store.redeem('01234567')));
    assert.ok(store.authorized(store.redeem('ABCDEF0123456789ABCD')));
    assert.equal(store.issue('legacy-eight'), '01234567');
    assert.equal(store.issue('leading-zero'), '012345');
    assert.equal(store.issue('legacy-long'), 'ABCD-EF01-2345-6789-ABCD');
    assert.equal(code, store.issue(' order-1 '));
    assert.notEqual(code, store.issue('order-2'));
    assert.throws(() => store.issue(''));
    store.close(); store = openStore(join(dir, 'test.sqlite'));
    assert.equal(code, store.issue('order-1'));
    assert.equal(store.redeem('1024'), null);
    assert.equal(store.redeem('0000-0000-0000-0000-0000'), null);
    assert.equal(store.authorized('a'.repeat(64)), false);
    const token = store.redeem(code.toLowerCase().replaceAll('-', ' '));
    assert.ok(store.authorized(token));
    const literatureCode = store.issue('order-1', 'literature');
    assert.notEqual(literatureCode, code);
    assert.equal(store.issue('order-1', 'literature'), literatureCode);
    assert.equal(store.redeem(code, 'literature'), null);
    assert.equal(store.redeem(literatureCode, 'yuanxinglab'), null);
    assert.equal(store.authorized(token, 'literature'), false);
    assert.ok(store.authorized(store.redeem(literatureCode, 'literature'), 'literature'));
    assert.ok(store.authorized(store.redeem(code)));
    const server = createAccessServer(store, { secure: true });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      assert.deepEqual(await (await fetch(`${base}/api/access/yuanxinglab/session`)).json(), { authorized: false });
      const redeem = body => fetch(`${base}/api/access/yuanxinglab/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      assert.equal((await redeem('{')).status, 400);
      assert.equal((await redeem(JSON.stringify({ code: '1024' }))).status, 401);
      const result = await redeem(JSON.stringify({ code }));
      assert.equal(result.status, 200);
      const cookie = result.headers.get('set-cookie');
      assert.match(cookie, /HttpOnly; SameSite=Lax/);
      assert.match(cookie, /; Secure/);
      assert.match(cookie, /Path=\/api\/access\/yuanxinglab\//);
      const forgedCookie = cookie.split(';')[0].replace('yl_access_yuanxinglab', 'yl_access_literature');
      assert.deepEqual(await (await fetch(`${base}/api/access/literature/session`, { headers: { Cookie: forgedCookie } })).json(), { authorized: false });
      assert.equal((await fetch(`${base}/api/access/literature/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })).status, 401);
      assert.deepEqual(await (await fetch(`${base}/api/access/yuanxinglab/session`, { headers: { Cookie: cookie.split(';')[0] } })).json(), { authorized: true });
      assert.equal((await fetch(`${base}/api/access/yuanxinglab/issue`, { method: 'POST' })).status, 404);
      assert.equal((await fetch(`${base}/api/access/yuanxinglab/redeem`, { method: 'POST', body: 'code=anything' })).status, 403);
    } finally { await new Promise(resolve => server.close(resolve)); }
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

