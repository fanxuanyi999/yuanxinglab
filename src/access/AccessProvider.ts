async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/access/yuanxinglab/${path}`, {
    ...init, credentials: 'same-origin', signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401) return false;
  if (!response.ok) throw new Error('兑换服务暂不可用');
  const data = await response.json();
  return data.authorized === true;
}
const serverAccessProvider = {
  session: () => request('session'),
  verify: (code: string) => request('redeem', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  }),
};
// A convenience gate for the initial static release, not secure paid authorization.
// VITE_* values ship to the browser. Never describe this code as unique to an order.
const sharedCode = (import.meta.env.VITE_SHARED_ACCESS_CODE || '').trim();
const sharedAccessKey = 'archetype-lab:access:yuanxinglab:shared:v1';
const sharedAccessProvider = {
  async session() {
    if (!/^\d{6}$/.test(sharedCode)) return false;
    try { return localStorage.getItem(sharedAccessKey) === sharedCode; }
    catch { return false; }
  },
  async verify(code: string) {
    if (!/^\d{6}$/.test(sharedCode)) throw new Error('兑换码尚未配置');
    if (code.trim() !== sharedCode) return false;
    try { localStorage.setItem(sharedAccessKey, sharedCode); }
    catch { /* Access remains available in memory for this visit. */ }
    return true;
  },
};
export const accessProvider = import.meta.env.VITE_ACCESS_MODE === 'shared'
  ? sharedAccessProvider : serverAccessProvider;
export const accessRequired = import.meta.env.VITE_ACCESS_REQUIRED === 'true';
