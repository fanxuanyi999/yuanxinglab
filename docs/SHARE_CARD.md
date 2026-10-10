# 独立分享卡

输出 1080×1440 PNG。`renderShareCard` 使用 Canvas 自定义排版，不截图 DOM。内容包括品牌、主原型、主题插画、时代、原型名、接近度、三个标签、原创意象句、隐藏原型和品牌回流位置。

名字竖排，可容纳四字“长孙皇后”；标题测量字体宽度并缩放；意象句按实际字体宽度换行。绘制前等待 document.fonts.ready，图片来自 character.image。人物主题值从数据传入，网页与海报保持对应。

## 保存与分享

1. 先异步生成 Blob 和 object URL，在 dialog 展示原生 img。
2. 桌面使用带 download 属性的链接请求下载。
3. 触屏设备在新的用户点击事件内调用 Web Share API，确保保留用户手势。
4. canShare 不支持文件时显示长按保存说明；失败和用户取消分别提示。
5. 即使系统分享失败，也保留图片预览和下载入口。关闭时回收 object URL。

系统分享 promise 完成不证明文件已存入相册；下载事件也只能记录下载请求。埋点通过 method 区分。测试不向联系人或其他应用发送内容。

## 扩展

ShareCardData 预留 shareUrl、qrCode、campaignId。当前 qrCode 为空时绘制品牌入口占位框，不生成假二维码。未来由外层传入正式二维码图及归因 URL；目前不会生成可扫描的回流入口。

自定义图片需同源或满足 CORS，否则 Canvas 会受污染并不能导出。渲染错误显示可重试状态，不默默交付一张缺图海报。

## 兼容验证边界

实测 Chrome 文件下载及 PNG 尺寸；移动 viewport、触屏、iPhone/WebView UA 与 API 不支持分支有专项测试。它们不等于真实 iOS Safari、Android Chrome 或小红书 App 的端到端验证。上线前需在这些真实设备内检查系统分享菜单、长按保存、字体和相册结果。

五个任务书指定人物另加四字姓名各有完整答题与导出证据。截图存放 screenshots/share-*.png。
