async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);};
  const a11y=[];
  async function axe(label){await page.addScriptTag({path:'F:/Codex/Projects/testAI/node_modules/axe-core/axe.min.js'});const violations=await page.evaluate(async()=>(await window.axe.run()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));a11y.push({label,violations});}
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(async()=>{const {STORAGE_KEY}=await import('/src/store/session.ts');localStorage.removeItem(STORAGE_KEY);});
  await page.reload();await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await axe('landing light');
  await page.getByRole('button',{name:'展开全部 24 位历史人物'}).click();ensure(await page.locator('.character-tile').count()===24,'Gallery incomplete');
  await page.getByRole('button',{name:'收起人物长卷'}).click();ensure(await page.locator('.character-tile').count()===6,'Gallery collapse');
  await page.getByRole('link',{name:'关于这次探索'}).click();ensure(new URL(page.url()).hash==='#about','About anchor');
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await axe('landing dark');
  await page.screenshot({path:'output/playwright/home-dark.png',fullPage:true});
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.getByRole('button',{name:'开始寻找我的历史原型',exact:true}).click();
  await page.locator('.question-content').waitFor();
  await page.screenshot({path:'output/playwright/question-poster-mobile.png'});await axe('question light');
  const firstId=await page.locator('.question-content').getAttribute('data-question-id');
  await page.locator('.answer-option').nth(0).click();
  await page.waitForFunction(id=>document.querySelector('.question-content')?.getAttribute('data-question-id')!==id,firstId);
  await page.getByRole('button',{name:'上一题',exact:true}).click();
  ensure(await page.locator('.answer-option[aria-pressed=true]').count()===1,'Answer not retained');
  await page.locator('.answer-option').nth(1).click();
  await page.waitForFunction(id=>document.querySelector('.question-content')?.getAttribute('data-question-id')!==id,firstId);
  await page.reload();
  ensure(await page.locator('.step-count b').innerText()==='02','Resume failed');
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await axe('question dark');await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  for(let i=1;i<30;i++){
    const id=await page.locator('.question-content').getAttribute('data-question-id');
    await page.locator('.answer-option').nth(i%4).click();
    await page.waitForFunction(id=>document.querySelector('.question-content')?.getAttribute('data-question-id')!==id,id);
  }
  await page.locator('.generating-page').waitFor();await page.screenshot({path:'output/playwright/generating-poster-mobile.png'});
  await page.locator('.result-hero').waitFor();
  const widths=[];
  for(const width of [320,360,390,768,1440]){await page.setViewportSize({width,height:900});const measured=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));ensure(measured.document<=width,'Overflow: '+width);widths.push(measured);}
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await axe('result dark');
  await page.screenshot({path:'output/playwright/result-poster-dark.png'});await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.getByRole('button',{name:'制作我的分享卡'}).click();await page.locator('.share-preview').waitFor();await axe('share dialog');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'下载高清 PNG'}).click();const download=await downloadPromise;await download.saveAs('output/playwright/actual-share-download.png');
  await page.getByRole('button',{name:'关闭分享卡'}).click();ensure(await page.locator('.share-dialog').count()===0,'Share did not close');
  ensure(errors.length===0,errors.join(','));ensure(a11y.every(a=>a.violations.length===0),'Accessibility: '+JSON.stringify(a11y));
  return {completeQuestions:30,backAndResume:true,widths,a11y,download:download.suggestedFilename(),errors};
}
