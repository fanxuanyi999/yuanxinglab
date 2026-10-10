async (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  const inputs = await page.evaluate(async () => ({
    all: (await import('/research-own/result-witnesses.json')).default,
    example: (await import('/output/playwright/xin-zheng-witness.json')).default,
  }));
  const ensure = (condition, message) => { if (!condition) throw new Error(message); };
  async function restore(witness) {
    await page.evaluate(async (witness) => {
      const { createSession } = await import('/src/data/sampler.ts');
      const { STORAGE_KEY } = await import('/src/store/session.ts');
      const session = createSession(witness.seed);
      session.answers = witness.answers;
      session.currentIndex = 29;
      session.stage = 'result';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }, witness);
    await page.reload();
    await page.locator('.result-hero').waitFor();
    await page.locator('.result-hero').evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
  }
  const results = [];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [id, witness] of Object.entries(inputs.all)) {
    await restore(witness);
    const view = await page.evaluate(() => ({
      id: document.querySelector('.result-hero').dataset.primary,
      text: document.querySelector('main').innerText,
      width: document.documentElement.scrollWidth,
      chapters: document.querySelectorAll('.report-chapter').length,
      buttons: document.querySelectorAll('.report-info-trigger').length,
      dialogCount: document.querySelectorAll('dialog').length,
      paragraphs: [...document.querySelectorAll('.report-chapter > p, .undertones article p, .strength-list p')].map(p => p.textContent.trim()),
    }));
    ensure(view.id === id, 'Wrong restored result: ' + id);
    ensure(view.chapters === 13 && view.buttons === 7, 'Missing sections or information: ' + id);
    ensure(view.dialogCount === 0, 'Explanations must be closed by default');
    ensure(view.width <= 390, 'Mobile overflow: ' + id);
    ensure(!/本轮|阈值|分数|得分|模型|相对靠前|心理测量|百分位|史料解读仍|能力评估/.test(view.text), 'Technical copy visible: ' + id);
    ensure(view.paragraphs.every(text => text.includes('你')), 'Not addressed to reader: ' + id);
    await page.screenshot({ path: 'output/playwright/report-' + id + '.png', fullPage: true, animations: 'disabled' });
    results.push({ id, chapters: view.chapters, infoButtons: view.buttons, width: view.width });
  }
  await restore(inputs.example);
  for (const id of ['why', 'undertones', 'secondary', 'combination']) {
    await page.locator('#' + id).screenshot({ path: 'output/playwright/xin-zheng-' + id + '.png', animations: 'disabled' });
  }
  const labels = [
    '关于你的这份报告', '如何阅读你的性格轮廓', '关于光背后的你',
    '关于做事方式的解读', '关于你的隐藏历史原型', '这段历史的出处与解读', '关于这段日常侧写',
  ];
  for (const label of labels) {
    const trigger = page.getByRole('button', { name: label, exact: true });
    await trigger.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: label });
    await dialog.waitFor();
    ensure(await trigger.getAttribute('aria-expanded') === 'true', 'Not expanded: ' + label);
    const bounds = await dialog.boundingBox();
    ensure(bounds.x >= 0 && bounds.x + bounds.width <= 390 && bounds.height <= 844, 'Dialog does not fit');
    if (label === '如何阅读你的性格轮廓') {
      ensure(await dialog.locator('.dimension-list > div').count() === 8, 'Missing scores');
      await page.screenshot({ path: 'output/playwright/report-info-mobile.png', animations: 'disabled' });
    }
    await page.keyboard.press('Tab');
    ensure(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus escaped modal');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    ensure(await trigger.evaluate(el => el === document.activeElement), 'Focus did not return');
    ensure(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore) < 3, 'Closing changed scroll');
  }
  const general = page.getByRole('button', { name: labels[0], exact: true });
  await general.click();
  await page.getByRole('button', { name: '关闭说明', exact: true }).click();
  ensure(await page.locator('dialog').count() === 0, 'Close button failed');
  await general.click();
  await page.mouse.click(3, 3);
  ensure(await page.locator('dialog').count() === 0, 'Backdrop close failed');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'output/playwright/report-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 360, height: 800 });
  ensure(await page.evaluate(() => document.documentElement.scrollWidth) <= 360, 'Small-screen overflow');
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.locator('#combination').screenshot({ path: 'output/playwright/report-dark.png', animations: 'disabled' });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addScriptTag({ path: 'F:/Codex/Projects/testAI/node_modules/axe-core/axe.min.js' });
  const axe = await page.evaluate(async () => (await window.axe.run()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
  await general.click();
  const dialogAxe = await page.evaluate(async () => (await window.axe.run()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
  await page.keyboard.press('Escape');
  await page.locator('#why').scrollIntoViewIfNeeded();
  ensure(errors.length === 0, 'Runtime errors: ' + errors.join(', '));
  ensure(axe.length === 0 && dialogAxe.length === 0, 'Accessibility issues: ' + JSON.stringify({ axe, dialogAxe }));
  return { results, dialogs: labels.length, errors, axe, dialogAxe, example: { primary: inputs.example.primary, secondary: inputs.example.secondary } };
}
