async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/');
  const inputs=await page.evaluate(async()=>(await import('/research-own/result-witnesses.json')).default);
  const checks=[];const contrast=[];
  const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);};
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  for(const [id,witness] of Object.entries(inputs)) {
    await page.evaluate(async w=>{const {createSession}=await import('/src/data/sampler.ts');const {STORAGE_KEY}=await import('/src/store/session.ts');const s=createSession(w.seed);s.answers=w.answers;s.currentIndex=29;s.stage='result';localStorage.setItem(STORAGE_KEY,JSON.stringify(s));},witness);
    await page.reload();await page.locator('.result-hero').waitFor();await page.evaluate(()=>document.fonts.ready);
    ensure(await page.locator('.result-name h1').evaluate(el=>getComputedStyle(el).fontWeight==='900'&&document.fonts.check('900 60px "Archetype Display"')),'Heading font not loaded: '+id);
    await page.locator('.result-art img').evaluate(el=>el.decode());
    const info=await page.evaluate(()=>({id:document.querySelector('.result-hero').dataset.primary,width:document.documentElement.scrollWidth,chapters:document.querySelectorAll('.report-chapter').length,text:document.querySelector('main').innerText,paragraphs:[...document.querySelectorAll('.report-chapter > p,.undertones article p,.strength-list p')].map(p=>p.textContent)}));
    ensure(info.id===id && info.width<=390 && info.chapters===13,JSON.stringify(info));
    ensure(!/本轮|阈值|分数|得分|模型|相对靠前|心理测量|百分位|能力评估/.test(info.text),'Technical prose: '+id);
    ensure(info.paragraphs.every(p=>p.includes('你')),'Voice mismatch: '+id);
    await page.locator('.result-hero').screenshot({path:'output/playwright/hero-'+id+'.png',style:'.result-action-bar{visibility:hidden;}'});
    await page.addScriptTag({path:'F:/Codex/Projects/testAI/node_modules/axe-core/axe.min.js'});
    const violations=await page.evaluate(async()=>(await window.axe.run()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
    if(violations.length)contrast.push({character:id,violations});
    const exported=await page.evaluate(async()=>{
      const {characters,characterById}=await import('/src/data/characters.ts');const {renderShareCard}=await import('/src/share/canvasRenderer.ts');
      const id=document.querySelector('.result-hero').dataset.primary;const p=characterById[id];const blob=await renderShareCard({primary:p,secondary:characters.find(c=>c.id!==id),closeness:71});
      const url=URL.createObjectURL(blob);const image=new Image();image.src=url;await image.decode();const view={width:image.width,height:image.height,size:blob.size};URL.revokeObjectURL(url);return view;
    });
    ensure(exported.width===1080&&exported.height===1440&&exported.size>10000,'Bad PNG '+id);
    checks.push({id,width:info.width,exported});
  }
  ensure(contrast.length===0,JSON.stringify(contrast));ensure(errors.length===0,JSON.stringify(errors));
  return {checks,contrast,errors};
}
