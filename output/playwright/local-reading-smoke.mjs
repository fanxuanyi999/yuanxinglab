import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('output/reading-review',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {const page=await browser.newPage({viewport:{width:390,height:1000}});await page.goto('http://127.0.0.1:5173/');await page.screenshot({path:'output/reading-review/before.png',fullPage:true});console.log(await page.title());}finally{await browser.close();}
