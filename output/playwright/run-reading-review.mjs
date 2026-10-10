import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const context=await browser.newContext({viewport:{width:390,height:900},acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('http://127.0.0.1:5173/');
  const run=(0,eval)('('+fs.readFileSync(process.argv[2],'utf8')+')');
  const result=await run(page);fs.writeFileSync('output/reading-review/'+path.basename(process.argv[2],'.js')+'-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
} finally {await browser.close();}
