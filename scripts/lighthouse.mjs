import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync } from 'node:fs';
const chrome = await launch({
  chromeFlags: [
    '--headless=new',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
  ],
  logLevel: 'silent',
});
try {
  const run = await lighthouse('http://127.0.0.1:5174/', {
    port: chrome.port,
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
    throttlingMethod: 'provided',
  });
  writeFileSync('research-own/lighthouse.html', run.report);
  writeFileSync(
    'research-own/lighthouse.json',
    JSON.stringify(
      {
        runtimeError: run.lhr.runtimeError,
        warnings: run.lhr.runWarnings,
        measurement:
          'Local production preview, no synthetic CPU/network throttling; not field performance.',
        scores: Object.fromEntries(
          Object.entries(run.lhr.categories).map(([k, v]) => [k, v.score]),
        ),
        metrics: Object.fromEntries(
          [
            'first-contentful-paint',
            'largest-contentful-paint',
            'cumulative-layout-shift',
            'total-blocking-time',
            'speed-index',
          ].map((k) => [
            k,
            { value: run.lhr.audits[k].numericValue, display: run.lhr.audits[k].displayValue },
          ]),
        ),
      },
      null,
      2,
    ),
  );
  console.log(readSummary(run.lhr));
} finally {
  await chrome.kill();
}
function readSummary(lhr) {
  return Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, v.score]));
}
