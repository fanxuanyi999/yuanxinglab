import fs from 'node:fs';
const file='scripts/generate-portraits.ts';let source=fs.readFileSync(file,'utf8');
const hems={
 'su-shi':'M247 276L349 290Q402 390 374 506Q396 617 466 657Q350 670 287 653Q204 672 103 655Q167 557 165 435L194 328Z',
 'wang-yangming':'M231 267L350 267Q384 394 371 481Q388 589 449 656Q354 646 290 662Q211 645 127 658Q181 543 180 379Z',
 'cao-cao':'M267 284Q380 232 512 383Q467 461 503 633Q369 592 304 636L224 418Z',
 'zhuge-liang':'M212 281L354 273Q432 399 402 501Q409 615 470 646Q371 675 294 655Q212 672 124 651Q167 555 149 425Z',
 'li-bai':'M206 310L302 270Q360 390 353 500Q374 625 450 653Q349 676 266 652Q197 673 112 650Q161 568 151 435Z',
 'tao-yuanming':'M218 298L336 286Q382 397 362 496Q386 595 427 650Q326 673 260 653Q194 665 133 648Q160 559 170 436Z',
 'liu-bang':'M218 269L336 281Q376 390 350 489Q369 593 437 655Q344 671 282 650Q211 670 119 649Q164 524 158 400Z',
 'qin-shi-huang':'M197 274L378 272Q416 416 407 510Q444 604 477 652Q361 670 292 652Q195 671 102 649L137 509L149 375Z',
 'zhang-juzheng':'M219 272L349 272Q401 425 380 498Q391 587 452 650Q355 669 297 652Q223 669 137 650Q166 538 162 438Z',
 'wang-anshi':'M222 283L345 277Q389 399 365 488Q385 607 444 651Q363 670 286 651Q211 668 131 651Q169 536 166 417Z',
 'xin-qiji':'M273 263Q362 221 481 331Q457 405 520 537Q442 508 389 512L283 379Z',
 'sima-qian':'M233 298L338 302Q359 365 380 445Q452 531 461 614Q404 664 330 652Q218 668 101 646Q156 582 172 483Z',
 'zheng-he':'M223 275L344 269Q409 397 382 493Q409 610 478 649Q377 670 299 651Q224 673 118 654Q156 559 140 452Z',
 'han-xin':'M224 272L337 291L389 433Q445 472 518 575L414 653Q305 667 203 643L116 547L175 417Z',
 'wu-zetian':'M210 281L378 277Q413 394 398 481Q413 588 493 651Q374 671 293 650Q202 673 95 652Q148 562 140 415Z',
 'li-qingzhao':'M242 278L345 293Q366 395 351 477Q361 594 435 649Q339 675 274 654Q202 676 123 648Q172 556 154 432L178 371Z',
 'shangguan-waner':'M212 282L340 284Q379 421 355 481Q383 582 452 650Q345 675 274 653Q198 674 113 648Q164 551 165 421Z',
 'ban-zhao':'M218 280L345 280Q378 395 361 489Q379 594 426 648Q331 671 279 654Q213 666 133 648Q176 539 172 410Z',
 'cai-wenji':'M224 292L333 282L391 487Q409 549 477 615Q421 660 365 650Q243 671 104 649Q141 584 157 490Z',
 'fu-hao':'M207 276L355 272L431 490Q413 571 439 650Q337 672 271 652Q194 669 110 650Q165 529 154 455Z',
 'lu-zhi':'M214 280L356 280Q414 420 382 486Q409 591 477 651Q367 675 286 654Q209 674 103 650Q154 548 155 419Z',
 'zhangsun':'M226 287L347 279Q382 407 368 484Q389 601 449 650Q355 672 287 653Q210 674 128 650Q173 539 173 403Z',
 'zhuo-wenjun':'M227 292L333 295L388 477Q406 554 472 623Q418 668 352 650Q251 672 99 649Q148 585 144 516Z',
 'feng-taihou':'M209 280L364 278Q409 407 387 487Q414 600 475 650Q359 673 287 652Q201 670 98 650Q154 552 150 421Z',
};
for(const [id,d] of Object.entries(hems)){
 const key=id==='zhangsun'?'  zhangsun: [':`  '${id}': [`;
 const start=source.indexOf(key);const end=source.indexOf("  ].join(''),",start);
 if(start<0||end<0)throw new Error(id);
 let section=source.slice(start,end);let i=0;
 section=section.replace(/path\('([^']+)'(?:, ('[^']+'|gold|ink|skin))?\)/g,(full,original,fill)=>{
  const slot=i++;if(slot>3)return full;
  const material=slot===0?'robe':slot===1?"'url(#sleeve)'":slot===2?"'url(#fold)'":"'url(#inner)'";
  return `path('${slot===0?d:original}', ${material})`;
 });
 source=source.slice(0,start)+section+source.slice(end);
}
source=source.replace("const ink = '#111924'","const ink = '#070909'").replace("skin = '#f3cfc3'","skin = '#efbfbb'");
const oldHead=source.slice(source.indexOf('  return `<g transform="translate(${x} ${y}) rotate(${angle})">',source.indexOf('function head')),source.indexOf('\n}',source.indexOf('function head')));
const newHead='  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(.8 .76)">${path(\'M-14 32H17L28 85L-29 104Z\', \'#dbada7\')}${path(\'M-31-34L13-44L32-29L43-7L32 1L30 21L12 45L-7 51L-30 24Z\', \'url(#face)\')}${hair[style] ?? hair.knot}</g>`;';
source=source.replace(oldHead,newHead);
const custom=`
// Li Bai: an elongated, upturned silhouette; the raised sleeve carries the gesture.
illustrations['li-bai'] = [
  path('M279 253L359 239Q423 289 443 389L408 507Q426 610 519 661Q404 683 315 659Q250 675 175 651Q221 556 237 450Z'),
  path('M279 261L222 120L88 313Q94 452 197 505L295 330Z','url(#sleeve)'),
  path('M348 259Q414 265 440 357L462 482L356 433L306 329Z','url(#fold)'),
  path('M290 292Q279 464 248 565L310 661Q253 672 195 650L237 444Z','url(#inner)'),
  head(306,194,'knot',-24),
  path('M284 235L294 255L271 290Z',ink),
  hand('M222 125L214 93L247 69L283 67L290 79L270 88L249 95L245 132Z'),
  path('M263 67Q290 76 315 66L306 91L288 98L289 111L270 106L276 92Z','#736047'),
  hand('M335 397L294 417L280 441L297 457L316 443L355 432Z'),
  sword(301,434,-32),
  ellipse(263,490,22,27,'#745b43'),ellipse(270,530,32,37,'#654e3d'),
  line('M263 486L255 566M270 555L282 576','#171714',3),
  path('M330 153Q370 195 374 244Q380 271 419 285L405 292Q365 280 363 245Q366 212 324 169Z','#3d3430'),
].join('');
`;
source=source.replace("mkdirSync('public/characters'",custom+"\nmkdirSync('public/characters'");
const begin=source.indexOf('  const svg = `<svg');const finish=source.indexOf('\n  writeFileSync',begin);
source=source.slice(0,begin)+`  const shade = (hex: string, amount: number) => '#' + hex.slice(1).match(/../g)!.map(n => Math.round(parseInt(n,16)*amount).toString(16).padStart(2,'0')).join('');
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840"><title>\${c.name} · \${v.motif}</title><defs><linearGradient id="robe" x2=".8" y2="1"><stop stop-color="#050707"/><stop offset=".58" stop-color="\${shade(v.robe,.34)}"/><stop offset="1" stop-color="#070909"/></linearGradient><linearGradient id="sleeve" x2="1" y2="1"><stop stop-color="#090b0b"/><stop offset=".72" stop-color="\${shade(v.robe,.75)}"/><stop offset="1" stop-color="#202420"/></linearGradient><linearGradient id="fold" x2=".8" y2="1"><stop stop-color="#090c0b"/><stop offset=".62" stop-color="\${shade(v.robe,.45)}"/><stop offset="1" stop-color="#080b0a"/></linearGradient><linearGradient id="inner" x2="1" y2="1"><stop stop-color="\${shade(v.robe,.65)}"/><stop offset="1" stop-color="#0d100e"/></linearGradient><linearGradient id="face" x2="1" y2="1"><stop stop-color="#f8cfca"/><stop offset="1" stop-color="#e9b1ae"/></linearGradient><linearGradient id="gold" x2=".7" y2="1"><stop stop-color="#c4a879"/><stop offset="1" stop-color="#806b49"/></linearGradient></defs><g transform="translate(0 8) scale(1 1.22)">\${illustrations[c.id]}</g></svg>\`;
`+source.slice(finish);
fs.writeFileSync(file,source);
