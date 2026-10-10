async(page)=>{
  await page.goto('http://127.0.0.1:5173/');
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.getByRole('button',{name:'人生原型实验室，返回首页'}).click();
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.hero-stage img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.screenshot({path:'output/playwright/home-poster-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/playwright/home-poster-mobile.png',fullPage:true});
  await page.evaluate(async()=>{const witness=(await import('/output/playwright/xin-zheng-witness.json')).default;const {createSession}=await import('/src/data/sampler.ts');const {STORAGE_KEY}=await import('/src/store/session.ts');const s=createSession(witness.seed);s.answers=witness.answers;s.currentIndex=29;s.stage='result';localStorage.setItem(STORAGE_KEY,JSON.stringify(s));});
  await page.reload();await page.locator('.result-art img').evaluate(el=>el.decode());
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('.result-hero').screenshot({path:'output/playwright/final-report-poster.png'});
  await page.getByRole('button',{name:'制作我的分享卡'}).click();await page.locator('.share-preview').waitFor();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'下载高清 PNG'}).click();const download=await downloadPromise;await download.saveAs('output/playwright/final-xin-share.png');
  await page.getByRole('button',{name:'关闭分享卡'}).click();
  await page.setViewportSize({width:390,height:1100});
  const style=await page.addStyleTag({content:'.result-action-bar{display:none !important}'});
  await page.locator('.result-hero').screenshot({path:'output/playwright/final-report-mobile.png'});await style.evaluate(el=>el.remove());
  return {screenshots:5,share:'output/playwright/final-xin-share.png'};
}
