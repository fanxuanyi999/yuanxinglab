---
name: quiz-product-workflow
description: Design and build themed self-exploration quiz MVPs with original questions, defensible scoring, immersive reports, distinct result artwork, share cards, and verified local delivery. Use for personality archetype, literary character, career preference, relationship signal, life-stage, or talent-exploration quizzes and adaptations of an existing quiz product.
---

# 主题测试产品工作流

把主题做成可完成、可解释、可分享的体验。先确定用户最终拿到什么，再选择计算方式；不要把所有主题套成八维人物匹配。

## 开始时

1. 阅读项目约定、现有模型、题库、报告和验证记录。区分已有能力与待实现架构。保留用户已有授权范围。
2. 用 [产品简报模板](assets/product-brief.md) 记录主题、受众、承诺、模式、规模和交付边界。已知信息直接填写；只询问会改变产品方向的缺项，其余标注假设继续推进。
3. 阅读 [完整工作流](references/workflow.md)。按任务当前阶段进入，不要求每轮改文案都重新做研究、模拟或生图。
4. 新主题先读 [主题适配方案](references/theme-adapters.md) 中对应部分。原型匹配、偏好画像和互动证据分流有不同的数据与验收要求。

## 实施中的关键约束

- 优先复用答题状态、恢复机制、报告容器、分享与资源加载；题目、维度、权重、阈值和叙事必须按主题重新设计。
- 先完成一条“简报 → 示例结果 → 示例题 → 计算 → 报告 → 分享”的小闭环，再扩完整内容。小样检查不自动意味着新增审批关卡。
- 原创情境围绕可观察的选择和真实取舍。保留 option ID 与权重关联，打乱位置不能改变含义；不让结果看起来只能靠选择“最优秀的答案”获得。
- 对缺答案、不了解、不适用分别处理。没有证据不能默认当成低分、平均值或否定；需要“信息不足”分支时让它成为正常结果。
- 算法负责选内容，默认报告以“你”的感受、行为和具体场景叙述。规则与来源按需展开；重要的不确定性直接体现在结论措辞中，不能靠隐藏弹窗修补误导性标题。
- 原型接近度不是概率；工程模拟不是心理测量效度；用户对他人的观察不能证明他人的内心。不要承诺诊断、读心、就业成功率或真实心理年龄。
- 先实际查看视觉参考，校准一个样本，再生成整套差异化素材。尊重本次指定工具；工具不可用要说明，不悄悄换成另一供应商或代码画图。海报排版可用 Canvas，不能用它冒充用户要求的生成插画。
- 本地修改与验证完成后给出可审阅结果。推送、部署遵循当前用户授权；开发请求本身不代表发布授权。不要继承历史项目的一次性发布许可。

## 按需读取

- [完整工作流](references/workflow.md)：研究、产品旅程、计分、文案、视觉、工程、验收、发布。
- [主题适配](references/theme-adapters.md)：文学、职业、暗恋、心理年龄、天赋五类例子及问题样稿。
- [历史项目复盘](references/history-mvp-case.md)：这套方法的实际来源、模块路径、已验证内容和保留限制；仅在迁移现有历史项目时读。
- [产品简报](assets/product-brief.md)：复制到新项目填写，不当成最终用户文案。
- [验收记录模板](assets/acceptance.md)：记录命令、证据、结果和未验证范围，不能预填“通过”。

## 交付

交付与当前范围相符的简报、数据定义、可运行产品或修改、验证证据及简短交接。说明哪些已实现、哪些只是建议；新主题未实现的通用引擎不得说成现成可用。分享测试不得向他人实际发送内容。发布后验证真实 URL 和资源，不以工作流绿灯代替网页验收。
