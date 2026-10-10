async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const witnesses = await (await page.request.get('http://127.0.0.1:5173/research-own/result-witnesses.json')).json();
  const checks = [];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [id, witness] of Object.entries(witnesses)) {
    await page.evaluate(async witness => {
      const { createSession } = await import('/src/data/sampler.ts');
      const session = createSession(witness.seed);
      Object.assign(session, { answers: witness.answers, currentIndex: 29, stage: 'result' });
      localStorage.setItem('archetype-lab:session:v1', JSON.stringify(session));
    }, witness);
    await page.reload();
    await page.locator(`.result-hero[data-primary="${id}"]`).waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode())); });
    const portraits = await page.locator('.portrait').evaluateAll(imgs => imgs.map(img => ({ src: img.getAttribute('src'), width: img.naturalWidth, visible: getComputedStyle(img).visibility })));
    if (portraits.some(i => i.width !== 800 || i.visible === 'hidden')) throw new Error('Broken report portrait: ' + id);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Report overflow: ' + id);
    await page.locator('.result-art').screenshot({ path: `output/playwright/portraits/result-${id}.png`, animations: 'disabled' });
    await page.getByRole('button', { name: '制作我的分享卡' }).click();
    await page.locator('.share-preview').waitFor();
    await page.locator('.share-preview').evaluate(img => img.decode());
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载高清 PNG' }).click();
    const download = await downloadPromise;
    await download.saveAs(`output/playwright/portraits/share-${id}.png`);
    await page.getByRole('button', { name: '关闭分享卡' }).click();
    checks.push({ id, report: true, downloadedShare: true, portraits: portraits.length });
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'output/playwright/portraits/result-desktop.png', animations: 'disabled' });
  if (errors.length) throw new Error(JSON.stringify(errors));
  return { checks, errors };
}
