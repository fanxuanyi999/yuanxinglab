async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'screenshots/01-landing.png', fullPage: true });
  return {
    width: await page.evaluate(() => document.documentElement.scrollWidth),
    title: await page.title(),
  };
};
