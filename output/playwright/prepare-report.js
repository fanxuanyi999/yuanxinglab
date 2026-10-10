async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => {
    const { createSession } = await import('/src/data/sampler.ts');
    const { STORAGE_KEY } = await import('/src/store/session.ts');
    const witness = (await import('/output/playwright/xin-zheng-witness.json')).default;
    const session = createSession(witness.seed);
    session.answers = witness.answers;
    session.currentIndex = 29;
    session.stage = 'result';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  });
  await page.reload();
  await page.locator('.result-hero').waitFor();
}
