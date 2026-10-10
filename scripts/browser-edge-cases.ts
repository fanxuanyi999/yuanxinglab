import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const results: Record<string, unknown> = {};
try {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.getByRole('button', { name: '开始寻找我的历史原型' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/production-home.png', animations: 'disabled' });
  results.productionLoads = true;
  results.productionErrors = [...errors];
  await page.goto('http://127.0.0.1:5175/');
  await page.getByRole('button', { name: '开始寻找我的历史原型' }).click();
  await expect(page.getByRole('heading', { name: '输入访问码' })).toBeVisible();
  await page.getByLabel('访问码', { exact: true }).fill('0000');
  await page.getByRole('button', { name: '开始探索' }).click();
  await expect(page.getByRole('alert')).toContainText('访问码不正确');
  await page.getByLabel('访问码', { exact: true }).fill('1024');
  await page.getByRole('button', { name: '开始探索' }).click();
  await expect(page.locator('.question-content')).toBeVisible();
  results.accessCodeRejectedAndAccepted = true;
  const c = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await c.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Storage unavailable', 'QuotaExceededError');
    };
  });
  const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/');
  await p.getByRole('button', { name: '开始寻找我的历史原型' }).click();
  await expect(p.getByRole('status')).toContainText('无法保存记录');
  const before = await p.locator('.question-content').getAttribute('data-question-id');
  await p.locator('.answer-option').first().click();
  await expect(p.locator('.question-content')).not.toHaveAttribute('data-question-id', before!);
  results.storageUnavailableStillUsable = true;
  await c.close();
  results.passed = true;
} catch (error) {
  results.passed = false;
  results.error = String(error);
  process.exitCode = 1;
} finally {
  writeFileSync('research-own/edge-case-test.json', JSON.stringify(results, null, 2));
  console.log(results);
  await browser.close();
}
