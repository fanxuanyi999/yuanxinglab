# 主题测试产品工作流与 Skill

这套资料总结了历史人格 MVP 从竞品分析、原创题库与计算、沉浸式报告、人物插画到分享和 Pages 上线的过程，并提供文学、职业、暗恋、心理年龄和天赋主题的改造方案。

## 从这里开始

- [完整工作流](../skills/quiz-product-workflow/references/workflow.md)：按阶段阅读的主文档。
- [五类主题适配与题目样稿](../skills/quiz-product-workflow/references/theme-adapters.md)：确定新主题采用什么结果模式。
- [当前 MVP 复盘与代码迁移地图](../skills/quiz-product-workflow/references/history-mvp-case.md)：知道哪些可复用、哪些必须重做。
- [新项目简报模板](../skills/quiz-product-workflow/assets/product-brief.md)：复制填写。
- [验收记录模板](../skills/quiz-product-workflow/assets/acceptance.md)：记录证据与未验证项。
- [Skill 入口](../skills/quiz-product-workflow/SKILL.md)：给后续 Codex 会话使用。

## 下次可以直接这样说

```text
使用 $quiz-product-workflow，做一个“你的文学人物原型”测试 MVP。
源项目参考 F:\Codex\Projects\testAI，先读取其 docs/QUIZ_PRODUCT_WORKFLOW.md。
在我指定的新项目目录开发，保留历史项目作为参照。
先给出产品简报、结果模式、结果差异和一份完整报告样稿，再落实题库与页面。
目标是手机优先、约 5 分钟、沉浸式“对你说”的报告和可下载分享卡。
结果数、题数和维度请按主题提出合理方案，不照搬 24 人/72 题/8 维。
本地开发和验证；我确认后再推送或部署。
```

换成暗恋主题时加一句：“采用观察证据与信息不足分支，不输出对方喜欢我的概率。”换成职业或天赋主题时加一句：“输出偏好与可验证的探索建议，不把自评当成能力认证。”

Skill 源文件完整保存在 `skills/quiz-product-workflow/`，可整体复制到其他环境的技能目录。若新会话未识别技能名，直接让它读取该目录下的 `SKILL.md` 也可使用相同流程。安装并不把当前网站变成多主题引擎；这是指导后续开发的可复用方法与模板。
