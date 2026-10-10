import json, hashlib, re
from pathlib import Path
from PIL import Image, ImageOps

root=Path('.')
def load(name):
    return json.loads((root/'research-own'/name).read_text(encoding='utf-8-sig'))
reach,stability,browser,visual,edge,content=(load(n) for n in ['reachability.json','stability.json','browser-test.json','visual-check.json','edge-case-test.json','content-audit.json'])
assert reach['passed'] and stability['passed'] and browser['passed'] and edge['passed'] and content['passed']
assert all(not check['violations'] for check in visual)
required=['01-landing','02-question','03-generating','04-result-hero','05-personality-map','06-secondary','07-report','08-share-card']
for name in required: assert (root/'screenshots'/f'{name}.png').exists(), name
images=[]
for f in (root/'screenshots').glob('*.png'):
    with Image.open(f) as im: im.verify()
    with Image.open(f) as im: images.append({'file':f.name,'width':im.width,'height':im.height})
for item in images:
    if item['file'].startswith('share-'): assert (item['width'],item['height'])==(1080,1440)
ids=['su-shi','wang-yangming','li-qingzhao','cao-cao','wu-zetian','zhangsun']
sheet=Image.new('RGB',(990,890),'#e4e8df')
for i,id in enumerate(ids):
    with Image.open(root/'screenshots'/f'share-{id}.png') as source:
        tile=source.convert('RGB').resize((315,420),Image.Resampling.LANCZOS)
        sheet.paste(tile,(12+(i%3)*330,12+(i//3)*445))
sheet.save(root/'screenshots'/'share-card-comparison.png')
maxrate=max(x['rate'] for x in reach['rows'])*100
ex=stability['experiments']
report=f'''# MVP 验收报告

日期：2026-10-09。环境：Windows / Node 24 / 本机 Chrome。此报告区分浏览器实测、离线模拟与尚未确认的能力。

## 通过的项目

- 原创数据：24 人物独立向量与文字；72 题，每题四个选项、每选项三个有正负权重的维度；每轮 30 题。
- 抽样：1000 个种子通过唯一题、18 现代 + 12 历史、八维各 3～4 题及相邻规则校验。
- 可达性：{reach['count']:,} 组独立随机作答，24 人全部可达；最高单人物占比 {maxrate:.3f}%。
- 稳定性：每种修改方案 10,000 组。改一题主人物不变 {ex[0]['primaryUnchanged']*100:.2f}%，主/隐藏至少一个延续 {ex[0]['primarySecondaryOverlap']*100:.2f}%，预设极端位移 {ex[0]['extremePortraitJump']*100:.2f}%。改两题的对应指标为 {ex[1]['primaryUnchanged']*100:.2f}%、{ex[1]['primarySecondaryOverlap']*100:.2f}%、{ex[1]['extremePortraitJump']*100:.2f}%。
- 普通入口完整答题：30 题、返回改答、刷新恢复、2.6 秒生成仪式、结果恢复、PNG 下载、新题组重测通过。
- 六种不同结果：苏轼、王阳明、李清照、曹操、武则天、长孙皇后，各点击 30 个真实选项，按模型得到对应结果。只预置合法的无答案抽题种子，没有强制返回某人。
- 六张海报均实际下载，1080×1440。四字姓名、独立主题与长标题已检查。完整报告为 13 章，海报为独立 Canvas 排版。
- 375×812、390×844、430×932 手机宽度与桌面预览。首页无横向溢出，结果也有检查。
- 自动化无障碍：首页浅／深色、题页、分享弹层首次无问题；最终七个结果画面（六人浅色、苏轼深色）未发现指定 WCAG A/AA 规则违规。不能视为完整人工无障碍认证。
- 结果固定分享栏在 390×844 视口顶部阅读时位于 y=768，高约 76，未再被入场动画定位到文档底部。
- localStorage 损坏与写入不可用均可恢复或降级；演示访问码错误与正确路径通过。
- 生产预览正常加载，无捕获到的页面脚本异常。
- 竞品逐字复用检查：题干 0、选项 0、所检人物大段内容 0。不是语义原创性或法律鉴定。

## 修复记录

1. 首页人物卡产生约 1px 横向溢出：收拢卡片并限定溢出区域。
2. 结果页根动画形成 fixed 定位包含块：入场动画移到 Hero，固定分享栏保持视口定位。
3. 章节数字与四个人物的强调色对比度不足：取消透明度并加深相关颜色，同时加入主题对比度单元测试。
4. 四字姓名使用独立字号规则，分享 Canvas 的长标题按宽度测量。
5. 截图使用动画完成状态，避免将淡入中间帧当作最终外观；无障碍复验等待真实动画结束。

## 明确限制

- 24 段历史镜像均 150～250 字，附出处线索，但全部保留 TODO: FACT_CHECK，未完成逐条原始史料校读。
- 24 张图是原创抽象占位资产，不是最终插画或历史肖像复原。
- 当前 Chrome 的触屏／iPhone WebView UA 与不支持文件分享分支通过，未在真实 iOS Safari、Android Chrome、小红书 App 完成相册保存或系统分享。
- 两次 Lighthouse 采集返回 NO_FCP，评分为 null，不能宣称性能达标。正常 Chrome 生产页加载和截图另行通过。性能仍需在可正常采集的环境测量。
- 随机答题模型存在相邻人物换位；合成偏好复抽试验不等于真实用户信度。完整分布见稳定性报告。
- 静态访问码不是订单授权；支付、账户、订单、在线 AI 与真实分享归因未接入。

## 证据

- [可达性报告](reachability-report.md) / [机器数据](reachability.json)
- [稳定性报告](stability-report.md) / [机器数据](stability.json)
- [普通流程](browser-normal-flow.json)
- [六种真实答题与导出](browser-test.json)
- [最终视觉与对比度复验](visual-check.json)
- [访问码、存储和生产加载](edge-case-test.json)
- [内容审计](content-audit.json)
- [Lighthouse 未成功的采集记录](lighthouse.json)
- [六张最终海报对照](../screenshots/share-card-comparison.png)

浏览器首轮报告中的对比度问题以 visual-check.json 的最终复验为准；保留首轮记录便于追溯。
'''
(root/'research-own'/'test-report.md').write_text(report,encoding='utf8')
for f in [root/'README.md',*(root/'docs').glob('*.md'),*(root/'research-own').glob('*.md')]:
    for target in re.findall(r'\]\(([^)]+)\)',f.read_text(encoding='utf8')):
        if '://' in target or target.startswith('#'): continue
        assert (f.parent/target.split('#')[0]).exists(),(str(f),target)
manifest=[]
for folder in ['src','docs','public','scripts','tests','screenshots','research-own']:
    for f in sorted((root/folder).rglob('*')):
        if f.is_file() and f.name!='artifact-manifest.json': manifest.append({'path':f.as_posix(),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(root/'research-own'/'artifact-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'passed':True,'imageCount':len(images),'checkedExports':ids,'maxCharacterRate':maxrate,'historicalReviewPending':24},ensure_ascii=False))
