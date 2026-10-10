import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createSession } from '../src/data/sampler';
import { STORAGE_KEY } from '../src/store/session';

const url = process.env.DEMO_URL || 'http://127.0.0.1:5173';
mkdirSync('screenshots', { recursive: true });
const witnesses = JSON.parse(readFileSync('research-own/result-witnesses.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results: Record<string, unknown> = {};
const pageErrors: string[] = [];
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  acceptDownloads: true,
  colorScheme: 'light',
});
const page = await context.newPage();
page.on('pageerror', (e) => pageErrors.push(e.message));
try {
  for (const [width, height] of [
    [375, 812],
    [390, 844],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.evaluate(() => localStorage.removeItem('archetype-lab:session:v1'));
    await page.reload();
    await expect(page.getByRole('button', { name: '开始寻找我的历史原型' })).toBeVisible();
    await page.screenshot({
      path: `screenshots/landing-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    if (width === 390) {
      await page.screenshot({
        path: 'screenshots/01-landing.png',
        fullPage: true,
        animations: 'disabled',
      });
      results.landingA11y = (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      ).violations;
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'screenshots/landing-desktop.png', animations: 'disabled' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'screenshots/landing-dark.png', animations: 'disabled' });
  results.darkLandingA11y = (
    await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  ).violations;
  await page.emulateMedia({ colorScheme: 'light' });
  const cases = ['su-shi', 'wang-yangming', 'li-qingzhao', 'cao-cao', 'wu-zetian', 'zhangsun'];
  const flows = [];
  for (let c = 0; c < cases.length; c++) {
    const id = cases[c],
      w = witnesses[id],
      session = createSession(w.seed);
    await page.setViewportSize({ width: [375, 390, 430][c % 3], height: [812, 844, 932][c % 3] });
    // Seed only a fresh, unanswered draw. Every answer is clicked in the UI.
    await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
      key: STORAGE_KEY,
      session,
    });
    await page.reload();
    for (let i = 0; i < 30; i++) {
      const qid = session.questionIds[i];
      await expect(page.locator('.question-content')).toHaveAttribute('data-question-id', qid);
      if (i === 0 && c === 0) {
        await page.screenshot({
          path: 'screenshots/02-question.png',
          fullPage: true,
          animations: 'disabled',
        });
        results.questionA11y = (
          await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        ).violations;
      }
      const label = await page
        .locator(`.answer-option[data-option-id="${w.answers[qid]}"]`)
        .innerText();
      expect(label.length).toBeGreaterThan(3);
      await page.locator(`.answer-option[data-option-id="${w.answers[qid]}"]`).click();
    }
    await expect(page.locator('.generating-page')).toBeVisible();
    if (c === 0)
      await page.screenshot({ path: 'screenshots/03-generating.png', animations: 'disabled' });
    await expect(page.locator('.result-hero')).toHaveAttribute('data-primary', id);
    expect(await page.locator('.report-chapter').count()).toBe(13);
    await expect(page.locator('#secondary h3')).not.toHaveText(
      await page.locator('.result-name h1').innerText(),
    );
    await page.screenshot({
      path: `screenshots/result-${id}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    if (c === 0) {
      await page.screenshot({ path: 'screenshots/04-result-hero.png', animations: 'disabled' });
      results.resultA11y = (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      ).violations;
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
    await page.getByRole('button', { name: '制作我的分享卡' }).click();
    await expect(page.locator('.share-preview')).toBeVisible();
    if (c === 0) {
      await page.screenshot({ path: 'screenshots/08-share-card.png', animations: 'disabled' });
      results.shareA11y = (
        await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      ).violations;
    }
    const imageSize = await page.locator('.share-preview').evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
    expect(imageSize).toEqual({ width: 1080, height: 1440 });
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载高清 PNG' }).click();
    const download = await downloadEvent;
    await download.saveAs(`screenshots/share-${id}.png`);
    await page.getByRole('button', { name: '关闭分享卡' }).click();
    await expect(page.locator('dialog')).toHaveCount(0);
    flows.push({ primary: id, seed: w.seed, answersClicked: 30, export: imageSize });
    console.log(`PASS ${id}: 30 UI answers and PNG export`);
  }
  results.flows = flows;
  // Touch/WebView fallback: simulate unavailable native share, never send externally.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 xhsapp/8.0',
  });
  const m = await mobile.newPage();
  await m.goto(url);
  const s = createSession(witnesses['li-qingzhao'].seed);
  s.answers = witnesses['li-qingzhao'].answers;
  s.currentIndex = 29;
  s.stage = 'result';
  await m.evaluate(
    ({ key, s }) => {
      localStorage.setItem(key, JSON.stringify(s));
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
    },
    { key: STORAGE_KEY, s },
  );
  await m.reload();
  await m.evaluate(() =>
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true }),
  );
  await m.getByRole('button', { name: '制作我的分享卡' }).click();
  await expect(m.locator('.share-preview')).toBeVisible();
  await m.getByRole('button', { name: '分享或保存图片' }).click();
  await expect(m.getByRole('status')).toContainText('长按图片保存');
  await m.screenshot({ path: 'screenshots/mobile-share-fallback.png', animations: 'disabled' });
  results.mobileShareFallback = true;
  await mobile.close();
  // Corrupt records must return an actionable landing state, not crash.
  await page.evaluate((key) => localStorage.setItem(key, '{broken'), STORAGE_KEY);
  await page.reload();
  await expect(page.getByRole('button', { name: '开始寻找我的历史原型' })).toBeVisible();
  results.corruptStorageRecovered = true;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('main').evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'none',
  );
  results.reducedMotion = true;
  results.pageErrors = pageErrors;
  expect(pageErrors).toEqual([]);
  results.passed = true;
} catch (error) {
  results.passed = false;
  results.error = String(error);
  await page.screenshot({
    path: 'screenshots/qa-failure.png',
    fullPage: true,
    animations: 'disabled',
  });
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync('research-own/browser-test.json', JSON.stringify(results, null, 2));
  await browser.close();
}
