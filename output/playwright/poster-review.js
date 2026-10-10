async (page) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/');
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.evaluate(async()=>{const {STORAGE_KEY}=await import('/src/store/session.ts');localStorage.removeItem(STORAGE_KEY);});
  await page.reload();
  await page.setViewportSize({width:1440,height:1100});
  await page.locator('.hero-stage img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.screenshot({path:'output/playwright/home-poster-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/playwright/home-poster-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'展开全部 24 位历史人物'}).click();
  const galleryCount=await page.locator('.character-tile').count();
  await page.locator('#characters').screenshot({path:'output/playwright/gallery-mobile.png'});
  await page.evaluate(async()=>{
    const witness=(await import('/output/playwright/xin-zheng-witness.json')).default;
    const {createSession}=await import('/src/data/sampler.ts');
    const {STORAGE_KEY}=await import('/src/store/session.ts');
    const s=createSession(witness.seed);s.answers=witness.answers;s.currentIndex=29;s.stage='result';localStorage.setItem(STORAGE_KEY,JSON.stringify(s));
  });
  await page.reload();await page.locator('.result-hero').waitFor();
  await page.locator('.result-art img').evaluate(el=>el.decode());
  await page.screenshot({path:'output/playwright/result-poster-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1050});
  await page.screenshot({path:'output/playwright/result-poster-desktop.png'});
  await page.getByRole('button',{name:'制作我的分享卡'}).click();
  await page.locator('.share-preview').waitFor();
  await page.locator('.share-preview').screenshot({path:'output/playwright/share-poster.png'});
  await page.getByRole('button',{name:'关闭分享卡'}).click();
  return {galleryCount,errors};
}
