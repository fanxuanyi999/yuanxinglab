async (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.screenshot({ path: 'screenshots/02-question.png', fullPage: true });
  const initial = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('archetype-lab:session:v1')),
  );
  let restored = false,
    edited = false;
  for (let i = initial.currentIndex; i < 30; i++) {
    const question = page.locator('.question-content');
    await question.waitFor();
    const questionId = await question.getAttribute('data-question-id');
    if (i === 5) {
      await page.reload();
      await page.locator('.question-content').waitFor();
      restored =
        (await page.locator('.question-content').getAttribute('data-question-id')) === questionId;
      await page.getByRole('button', { name: '上一题', exact: true }).click();
      const previousId = await page.locator('.question-content').getAttribute('data-question-id');
      const previous = await page.evaluate(
        (id) => JSON.parse(localStorage.getItem('archetype-lab:session:v1')).answers[id],
        previousId,
      );
      await page.locator('.answer-option:not([aria-pressed="true"])').first().click();
      await page.locator(`.question-content[data-question-id="${questionId}"]`).waitFor();
      const updated = await page.evaluate(
        (id) => JSON.parse(localStorage.getItem('archetype-lab:session:v1')).answers[id],
        previousId,
      );
      edited = previous !== updated;
    }
    await page
      .locator('.answer-option')
      .nth((i * 7 + 2) % 4)
      .click();
    if (i < 29)
      await page.waitForFunction(
        (id) =>
          document.querySelector('.question-content')?.getAttribute('data-question-id') !== id,
        questionId,
      );
  }
  await page.locator('.generating-page').waitFor();
  await page.screenshot({ path: 'screenshots/03-generating.png' });
  await page.locator('.result-hero').waitFor();
  await page.screenshot({ path: 'screenshots/04-result-hero.png' });
  const primary = await page.locator('.result-hero').getAttribute('data-primary');
  await page.reload();
  await page.locator('.result-hero').waitFor();
  const resultRestored =
    primary === (await page.locator('.result-hero').getAttribute('data-primary'));
  for (const [id, path] of [
    ['map', '05-personality-map'],
    ['secondary', '06-secondary'],
    ['mirror', '07-report'],
  ]) {
    await page
      .locator(`#${id}`)
      .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `screenshots/${path}.png` });
  }
  await page.locator('.report-ending').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: '制作我的分享卡' }).click();
  await page.locator('.share-preview').waitFor();
  await page.screenshot({ path: 'screenshots/08-share-card.png' });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: '下载高清 PNG' }).click();
  const download = await downloadPromise;
  await download.saveAs('screenshots/normal-flow-share.png');
  await page.getByRole('button', { name: '关闭分享卡' }).click();
  await page.getByRole('button', { name: '重新测试', exact: true }).click();
  await page.locator('.question-content').waitFor();
  const next = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('archetype-lab:session:v1')),
  );
  const passed =
    restored &&
    edited &&
    resultRestored &&
    next.id !== initial.id &&
    Object.keys(next.answers).length === 0 &&
    JSON.stringify(next.questionIds) !== JSON.stringify(initial.questionIds) &&
    errors.length === 0;
  if (!passed) throw new Error(JSON.stringify({ restored, edited, resultRestored, errors }));
  return {
    passed,
    primary,
    restored,
    edited,
    resultRestored,
    newDraw: true,
    downloaded: true,
    errors,
    completedAnswers: 30,
  };
};
