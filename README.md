# 人生原型实验室 · 历史人格原型

原创 H5 MVP。React 19、TypeScript、Vite，纯前端规则计算。24 人物、72 情境、每轮 30 题，主原型与隐藏原型，完整报告及 1080×1440 分享卡。

## 本地运行

```powershell
npm install
npm run dev
```

打开 http://127.0.0.1:5173/ 。构建用 `npm run build`，生产预览用 `npm run preview`。Node.js 建议 22.12+ 或 24 LTS。

默认直接体验。若要测试访问码页，在 `.env.local` 设置：

```dotenv
VITE_ACCESS_REQUIRED=true
VITE_DEMO_ACCESS_CODE=1024
```

然后重启开发服务器。此码是公开前端中的演示逻辑，不是安全授权。生产的一单一码需替换 AccessProvider 并在服务端验证权益。

## 验证

```powershell
npm test
npm run simulate
npm run stability
npm run audit:content
npm run build
```

浏览器验收（先启动本地服务；本机需安装 Chrome）：

```powershell
node node_modules/tsx/dist/cli.mjs scripts/browser-test.ts
```

它通过真实选项按钮完成六组 30 题，验证五个指定人物及四字姓名的导出；测试页与生产页共用全部计分逻辑。浏览器测试只预置无答案的抽题种子，未强制设置结果。分享降级的专项测试使用合法的已完成回答记录。

## 文档与交付

- [产品说明](docs/PRODUCT.md)
- [计分模型](docs/SCORING_MODEL.md)
- [人物系统](docs/CHARACTER_SYSTEM.md)
- [题库系统](docs/QUESTION_SYSTEM.md)
- [报告系统](docs/RESULT_SYSTEM.md)
- [分享卡实现](docs/SHARE_CARD.md)
- [可达性报告](research-own/reachability-report.md)
- [稳定性报告](research-own/stability-report.md)
- [验收报告](research-own/test-report.md)
- [截图目录](screenshots/)

竞品研究仅在本地保留，不被应用导入或提交到公开仓库。本项目没有接入支付、账户、订单服务或在线 AI。24 段历史文本附出处线索，仍保留 `TODO: FACT_CHECK`，正式售卖前需完成史料审校。桌面及模拟移动浏览器验证不能代替真实 iOS、Android 和小红书 App 的最终验收。

## 人物插画

24 位人物均已使用内置 image_gen 生成真实透明位图，接入首页、人物列表、结果报告与分享海报。

- 网页素材：`public/characters/generated/`（800 × 1120 WebP）
- 原图与透明 PNG：`output/imagegen/originals/`、`output/imagegen/final/`
- [人物与提示词清单](output/imagegen/character-manifest.json)
- [整套插画总览](output/imagegen/character-contact-sheet.jpg)
- [美术规范与验收记录](output/imagegen/ART-DIRECTION.md)

## 迭代与发布

仓库：https://github.com/fanxuanyi999/yuanxinglab

网站地址：https://fanxuanyi999.github.io/yuanxinglab/

默认在本地编辑和验证，提供预览供用户检查。只有用户确认该次迭代后，才推送 GitHub 或更新线上部署。完整约定见 [AGENTS.md](AGENTS.md)。

GitHub Pages 使用手动发布：仓库 Settings → Pages 将 Source 设为 GitHub Actions；在 Actions → Deploy GitHub Pages → Run workflow 选择 main 并运行。工作流会执行测试、按 `/yuanxinglab/` 路径构建并发布 `dist`。普通提交不会触发部署。

本地验证线上路径：`npm run build -- --base=/yuanxinglab/`，然后 `npm run preview -- --base=/yuanxinglab/`，打开 http://127.0.0.1:4173/yuanxinglab/ 。
