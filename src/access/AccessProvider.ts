async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/access/yuanxinglab/${path}`, {
    ...init, credentials: 'same-origin', signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401) return false;
  if (!response.ok) throw new Error('兑换服务暂不可用');
  const data = await response.json();
  return data.authorized === true;
}
export const accessProvider = {
  session: () => request('session'),
  verify: (code: string) => request('redeem', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  }),
};
export const accessRequired = import.meta.env.VITE_ACCESS_REQUIRED === 'true';
