import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { openStore } from './access-store.mjs';
import { products } from './products.mjs';
export function createAccessServer(store, { secure = false } = {}) {
  return createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, data) => { res.writeHead(status); res.end(JSON.stringify(data)); };
    const route = /^\/api\/access\/([a-z]+)\/(session|redeem)$/.exec(req.url || '');
    if (!route || !Object.hasOwn(products, route[1])) return send(404, { error: 'not_found' });
    const product = route[1], action = route[2], cookieName = `yl_access_${product}`;
    if (action === 'session' && req.method === 'GET') {
      const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
      return send(200, { authorized: store.authorized(token, product) });
    }
    if (action !== 'redeem' || req.method !== 'POST') return send(404, { error: 'not_found' });
    if (req.headers['sec-fetch-site'] === 'cross-site' || !req.headers['content-type']?.startsWith('application/json')) return send(403, { error: 'forbidden' });
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 1024) return send(413, { error: 'too_large' });
      }
      let code;
      try { code = JSON.parse(body).code; } catch { return send(400, { error: 'invalid_request' }); }
      const token = store.redeem(code, product);
      if (!token) return send(401, { error: 'invalid_code' });
      res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/api/access/${product}/; Max-Age=2592000${secure ? '; Secure' : ''}`);
      send(200, { authorized: true });
    } catch { send(500, { error: 'unavailable' }); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const store = openStore(process.env.ACCESS_DB_PATH);
  const server = createAccessServer(store, { secure: process.env.NODE_ENV === 'production' });
  const port = Number(process.env.ACCESS_PORT || 8787);
  server.listen(port, '127.0.0.1', () => console.log(`兑换服务已启动：http://127.0.0.1:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
}
