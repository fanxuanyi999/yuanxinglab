async (page) => {
  await page.evaluate(() => localStorage.removeItem('archetype-lab:session:v1'));
  await page.reload();
  const checks = [];
  for (const [label, width, height] of [['desktop', 1440, 960], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(img => img.decode()));
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.screenshot({ path: `output/playwright/portraits/home-${label}.png`, animations: 'disabled' });
    const expand = page.getByRole('button', { name: '展开全部 24 位历史人物' });
    if (await expand.count()) await expand.click();
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
    const images = await page.locator('.portrait').evaluateAll(imgs => imgs.map(img => ({ src: img.getAttribute('src'), width: img.naturalWidth, height: img.naturalHeight, visible: getComputedStyle(img).visibility })));
    if (images.length !== 27 || images.some(i => i.width !== 800 || i.height !== 1120 || i.visible === 'hidden')) throw new Error('Incomplete portrait set: ' + JSON.stringify(images));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error('Horizontal page overflow');
    await page.locator('#characters').screenshot({ path: `output/playwright/portraits/characters-${label}.png`, animations: 'disabled' });
    checks.push({ label, imageCount: images.length, uniqueAssets: new Set(images.map(i => i.src)).size, overflow });
  }
  return checks;
}
