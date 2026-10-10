# 历史人格原型 · 视觉与阅读规范

本轮参考用户新提供的三张图：图 1 的长袍、宽袖、极简面部与鲜明动作；图 2 的浅玉色底与黑色重字标题；图 3 的深色人物场景、白色重点信息与清晰的阅读层级。

这是一轮现有产品的视觉优化。保留 24 人物、题库与匹配逻辑、30 道题的答题过程、记录恢复、报告内容与所有章节锚点。报告保持面向“你”的表达，解释性规则仍通过小感叹号按需打开。

## 已落地的视觉

- 首页以浅玉色和纸色呈现，黑色大字与开始按钮构成主层级；三个人物按容器高度完整展示。手机人物画廊为两列，为姓名和人物短句留出阅读空间。
- 人物名与主标题使用实际 900 字重的本地字体；章节标题为加粗黑体，正文常规字重，15–16px、1.95–2 倍行高。长文不统一加粗。
- 结果首屏使用人物专属暗色场景与柔和光晕，接近度退为辅助信息。正文进入浅色阅读区；跟随系统深色模式时使用深墨绿色阅读底。
- 四字姓名保留完整排布，移除会与姓名重叠的装饰印章；两字、三字姓名保留印章。
- 24 位人物使用统一的修长深色轮廓、简化面部、曲线衣摆；通过衣冠、道具与动作区分。李白举杯佩剑、辛弃疾引弓、诸葛亮持羽扇、蔡文姬持琵琶等。插画为 SVG 人物意象，不是历史肖像复原。
- 分享图为 1080 × 1440 PNG，沿用重字标题与深色氛围。人物按 600:840 原始比例绘制，海报下部采用有意的半身裁切。只有传入真实二维码时才绘制二维码。

## 源码与素材维护

- 界面：src/theme/tokens.css、src/theme/styles.css。
- 人物绘图源：scripts/generate-portraits.ts；执行 npx tsx scripts/generate-portraits.ts 重新生成 public/characters 下的 24 个 SVG。
- 人物配色、识别特征与相遇短句：src/data/characterVisuals.ts。
- 分享绘制：src/share/canvasRenderer.ts。
- 展示字体：public/fonts/archetype-display-heavy.woff2，约 234 KB。来源为 SIL OFL 1.1 授权的 Source Han Serif SC Heavy，子集已重命名为 Archetype Display；版权与完整授权随字体保存在 FONT-NOTICE.txt、OFL.txt。
- 字体子集脚本：scripts/subset-display-font.py，从 src 的 TS/TSX 收集字符。新增中文标题后需更新子集；脚本使用本机已安装的原始字体，依赖 Python fonttools 与 brotli。此字体只用于标题，正文保留系统黑体。

## 本轮验证（2026-10-09）

- npm test：12 项通过，包括全部人物见证、552 种定向人物组合与沉浸文案约束。
- npm run build：TypeScript 与 Vite 生产构建通过。
- 24 种真实答案报告逐一渲染：各 13 章、无横向溢出、重字标题字体加载成功；全部通过 Axe，默认可见内容无算法成绩单式措辞。
- 24 张分享 PNG 成功生成并解码为 1080 × 1440；李白、辛弃疾、长孙皇后的导出图经视觉检查，完成一次真实浏览器下载。
- 走完 30 题，验证返回修改、刷新恢复；320 / 360 / 390 / 768 / 1440 宽度无横向溢出。
- 首页、答题页明暗模式，结果深色模式与分享浮层通过 Axe。发现并修复首页按钮被全局深色文字覆盖的问题。
- 7 个说明弹窗的键盘操作、Escape、焦点返回与阅读位置恢复正常。
- 额外检查首页人物完整边界与两位四字姓名的上述五档宽度；无裁切或印章重叠。
- 通过浏览器 CDP 确认标题实际使用 ArchetypeDisplay-Heavy，正文与按钮实际使用 Microsoft YaHei，而非仅检查声明的 CSS 字体。

## 复现与预览

正常预览：http://127.0.0.1:5173/ 。本轮截图与检查 JSON 位于 output/reading-review；24 人物总览为该目录下的 characters.html 与 characters.png。

浏览器校验使用隔离的无头 Chrome 上下文，不改动用户浏览器中的答题记录。运行方式：node output/playwright/run-reading-review.mjs <检查脚本路径>。

检查脚本：output/playwright/poster-all-audit.js、poster-flow-audit.js、review-dialogs.js，以及 output/reading-review/edge-layout.js。截图脚本为 layout.js、share-capture.js。
