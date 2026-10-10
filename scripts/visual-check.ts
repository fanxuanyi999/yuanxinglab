import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { createSession } from '../src/data/sampler';
import { STORAGE_KEY } from '../src/store/session';
const witnesses = JSON.parse(readFileSync('research-own/result-witnesses.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const checks: unknown[] = [];
try {
  await page.goto('http://127.0.0.1:5173/');
  for (const [id, mode] of [
    ['su-shi', 'light'],
    ['wang-yangming', 'light'],
    ['li-qingzhao', 'light'],
    ['cao-cao', 'light'],
    ['wu-zetian', 'light'],
    ['zhangsun', 'light'],
    ['su-shi', 'dark'],
  ] as const) {
    const s = createSession(witnesses[id].seed);
    s.answers = witnesses[id].answers;
    s.currentIndex = 29;
    s.stage = 'result';
    await page.evaluate(({ key, s }) => localStorage.setItem(key, JSON.stringify(s)), {
      key: STORAGE_KEY,
      s,
    });
    await page.emulateMedia({ colorScheme: mode });
    await page.reload();
    await expect(page.locator('.result-hero')).toHaveAttribute('data-primary', id);
    await page
      .locator('.result-hero')
      .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    // A fixed action must remain inside the viewport, even at the report's top.
    const bar = await page.locator('.result-action-bar').boundingBox();
    expect(bar!.y).toBeGreaterThan(650);
    expect(bar!.y + bar!.height).toBeLessThanOrEqual(845);
    const violations = (
      await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    ).violations;
    if (violations.length) process.exitCode = 1;
    await page.screenshot({
      path: `screenshots/verified-${id}-${mode}.png`,
      animations: 'disabled',
    });
    if (id === 'su-shi' && mode === 'light') {
      await page.screenshot({ path: 'screenshots/04-result-hero.png', animations: 'disabled' });
      for (const [section, file] of [
        ['map', '05-personality-map'],
        ['secondary', '06-secondary'],
        ['mirror', '07-report'],
      ]) {
        await page
          .locator(`#${section}`)
          .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.screenshot({ path: `screenshots/${file}.png`, animations: 'disabled' });
      }
    }
    if (mode === 'light') {
      await page.getByRole('button', { name: '制作我的分享卡' }).click();
      await expect(page.locator('.share-preview')).toBeVisible();
      if (id === 'su-shi')
        await page.screenshot({ path: 'screenshots/08-share-card.png', animations: 'disabled' });
      const downloaded = page.waitForEvent('download');
      await page.getByRole('link', { name: '下载高清 PNG' }).click();
      const file = await downloaded;
      await file.saveAs(`screenshots/share-${id}.png`);
      await page.getByRole('button', { name: '关闭分享卡' }).click();
    }
    checks.push({ id, mode, bar, violations });
  }
  writeFileSync('research-own/visual-check.json', JSON.stringify(checks, null, 2));
  console.log(
    JSON.stringify(
      checks.map((entry: any) => ({
        id: entry.id,
        mode: entry.mode,
        bar: entry.bar,
        violations: entry.violations.map((v: any) => ({
          id: v.id,
          nodes: v.nodes.map((n: any) => ({ target: n.target, summary: n.failureSummary })),
        })),
      })),
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
