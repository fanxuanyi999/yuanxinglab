export const products = {
  yuanxinglab: { name: '历史人格原型', path: '/yuanxinglab/' },
  literature: { name: '文学人物原型', path: '/literature/' },
  creator: { name: '创作者测试', path: '/creator/' },
  career: { name: '职业原型', path: '/career/' },
};
export function validateProduct(id) {
  if (!Object.hasOwn(products, id)) throw new Error('未知测试标识');
  return id;
}
