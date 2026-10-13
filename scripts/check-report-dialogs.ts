import { chromium, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { createSession } from '../src/data/sampler';

const base = process.env.CHECK_URL || 'http://127.0.0.1:4173/yuanxinglab/';
const witnesses = JSON.parse(readFileSync('research-own/result-witnesses.json', 'utf8'));
const witness = witnesses['li-bai'];
const session = { ...createSession(witness.seed), answers: witness.answers, stage: 'result', currentIndex: 29 };
mkdirSync('output/playwright', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [390, 424, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 }, hasTouch: width < 500 });
    await context.addInitScript(({ session }) => {
      localStorage.setItem('archetype-lab:session:v1', JSON.stringify(session));
      localStorage.setItem('archetype-lab:access:yuanxinglab:shared:v1', '925729');
    }, { session });
    const page = await context.newPage();
    await page.goto(base);
    await page.locator('.result-page').waitFor();
    const cardButton = page.getByRole('button', { name: '生成我的人物卡' });
    await expect(page.locator('.result-action-bar')).toHaveCSS('position', 'static');
    expect(await cardButton.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(844);
    expect(await page.locator('.result-action-bar').evaluate(el => el.previousElementSibling?.id === 'advice' && el.nextElementSibling?.classList.contains('report-ending'))).toBe(true);
    const trigger = page.getByRole('button', { name: '关于你的这份报告', exact: true });
    if (width < 500) await trigger.tap(); else await trigger.click();
    const dialog = page.locator('.report-info-dialog');
    await expect(dialog.locator('h2')).toBeFocused();
    await expect(dialog.getByRole('button', { name: '关闭说明' })).toHaveCSS('outline-style', 'none');
    await expect(dialog.getByRole('button', { name: '关闭说明' })).toHaveCSS('border-top-width', '0px');
    await page.screenshot({ path: `output/playwright/dialog-touch-${width}.png` });
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: '关闭说明' })).toBeFocused();
    await expect(dialog.getByRole('button', { name: '关闭说明' })).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await cardButton.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `output/playwright/report-footer-${width}.png` });
    await cardButton.click();
    await expect(page.locator('.share-dialog h2')).toBeFocused();
    await expect(page.getByRole('button', { name: '关闭分享卡' })).toHaveCSS('outline-style', 'none');
    await page.locator('.share-preview').waitFor({ timeout: 30000 });
    await page.getByRole('button', { name: '关闭分享卡' }).click();
    await expect(cardButton).toBeFocused();
    await context.close();
  }
  console.log('PASS: 390/424/1440px, static footer action, touch dialog focus, keyboard outline/Escape, share generation and focus restoration');
} finally { await browser.close(); }
