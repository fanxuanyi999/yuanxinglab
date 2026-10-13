import { openStore } from '../server/access-store.mjs';
import { products, validateProduct } from '../server/products.mjs';
const order = process.argv[2];
const product = process.argv[3] || 'yuanxinglab';
if (!order || process.argv.length > 4) {
  console.error('用法：npm run code:issue -- "已付款订单号" [yuanxinglab|literature|creator|career]');
  process.exit(1);
}
validateProduct(product);
const store = openStore(process.env.ACCESS_DB_PATH);
try {
  const code = store.issue(order, product);
  const link = new URL(process.env.ACCESS_PUBLIC_URL || 'http://127.0.0.1:5173/');
  if (!['http:', 'https:'].includes(link.protocol)) throw new Error('ACCESS_PUBLIC_URL 必须是网站地址');
  link.hash = '';
  link.search = '';
  if (process.env.ACCESS_PUBLIC_URL) link.pathname = products[product].path;
  console.log(`订单：${order}\n测试：${products[product].name}\n测试网址：${link.href}\n兑换码：${code}\n打开网址后手动输入兑换码，仅限本测试使用。\n同一订单、同一测试补发将返回原码。`);
  if (!process.env.ACCESS_PUBLIC_URL) console.log('当前为本地预览链接；实际发货前需设置 ACCESS_PUBLIC_URL 为已部署兑换服务的网站地址。');
}
finally { store.close(); }
