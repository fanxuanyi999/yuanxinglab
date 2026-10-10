import { mkdirSync, writeFileSync } from 'node:fs';
import { characters } from '../src/data/characters';
import { characterVisuals } from '../src/data/characterVisuals';

// Each body, gesture and prop is composed individually. Helpers only share drawing materials.
const ink = '#070909',
  skin = '#efbfbb',
  gold = 'url(#gold)',
  robe = 'url(#robe)';
const path = (d: string, fill = robe, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d: string, color = '#e9c99b', width = 3) =>
  path(
    d,
    'none',
    `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`,
  );
const ellipse = (x: number, y: number, rx: number, ry: number, fill: string) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const hand = (d: string) => path(d, skin);
const scroll = (x: number, y: number, angle = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle})">${path('M0 0H120V69H0Z', '#eadabb')}${path('M3 0V69M117 0V69', 'none', 'stroke="#927344" stroke-width="7"')}${line('M22 19H94M22 31H84M22 43H99', '#b29f80', 2)}</g>`;
const sword = (x: number, y: number, angle = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle})">${path('M-5 0H5V236L0 257L-5 236Z', '#b2c4c9')}${path('M0 3V239H5V3Z', '#e3e9dc')}${path('M-29-7H29V4H-29Z', gold)}${path('M-6-57H6V-7H-6Z', ink)}${ellipse(0, -60, 9, 6, '#cba264')}</g>`;
function head(x: number, y: number, style: string, angle = 0) {
  const hair: Record<string, string> = {
    knot:
      path('M-37-30Q-47-65-3-67Q38-63 35-22L24 5L12-29L-20-35L-30 17Z', ink) +
      ellipse(-15, -78, 24, 19, ink),
    scholar: path('M-37-35L-45-86L28-90L37-32Z', ink) + path('M-31-82L-21-35H-5L-8-86Z', '#263746'),
    wings:
      path('M-37-33L-33-79H33L37-33Z', ink) +
      path('M-34-55L-122-74L-126-62L-36-39M34-55L121-74L124-62L36-39Z', ink),
    war:
      path('M-44-28Q-45-80 0-91Q43-81 44-28L26-10L20-43H-21L-29-3Z', ink) +
      path('M-8-93L0-121L10-93L7-39H-7Z', gold),
    emperor:
      path('M-36-36V-84H36V-36Z', ink) +
      path('M-62-87L-37-108L68-94L45-74Z', ink) +
      line('M-53-80V-24M-33-79V-12M-12-78V-8M11-76V-9M33-74V-17M52-78V-33', '#d3b076', 3),
    phoenix:
      path('M-39-24Q-57-60-31-79L0-54L31-79Q57-59 39-24L23-41H-20Z', ink) +
      path(
        'M-45-61Q-81-54-97-83Q-71-73-48-97L-54-119Q-22-111-17-86L0-62L17-86Q22-111 54-119L48-97Q71-73 97-83Q81-54 45-61L25-45H-25Z',
        gold,
      ) +
      path('M-10-61L-8-100L0-119L8-100L10-61Z', gold) +
      line('M-61-64L-63-25M61-64L63-25', '#ddb67b', 3) +
      ellipse(-63, -21, 5, 7, gold) +
      ellipse(63, -21, 5, 7, gold) +
      ellipse(0, -76, 13, 11, '#d97762'),
    loops:
      path('M-35-28Q-48-63-3-71Q42-68 39-28L28 4L18-36L-20-37L-27 9Z', ink) +
      ellipse(-35, -71, 22, 24, ink) +
      ellipse(27, -81, 19, 27, ink) +
      line('M-65-73L59-88', '#dab786', 5),
    butterfly:
      path('M-33-24Q-51-71 0-74Q44-67 35-23L20-36L-17-36Z', ink) +
      path('M-4-68Q-57-82-38-120Q-3-118 0-85Q21-123 45-117Q61-89 9-65Z', ink) +
      line('M-52-94L64-94', '#d7ba7c', 5),
    simple:
      path('M-36-25Q-47-66 0-68Q41-64 34-24L22-38L-18-36L-27 13Z', ink) +
      ellipse(-20, -77, 24, 14, ink) +
      line('M-51-79L45-71', '#cdbb8f', 4),
    hood: path(
      'M-57 28Q-65-46-28-82Q5-103 42-63L57 44L34 32L23-28L-12-43L-35-15L-27 43Z',
      '#25324c',
    ),
    cap:
      path('M-40-28Q-47-75 0-89Q45-68 40-29L22-41H-23Z', ink) +
      path('M-40-34H39V-23H-40Z', gold) +
      ellipse(0, -62, 9, 12, '#739eac'),
    bronze:
      path('M-42-30V-66L-71-99L-48-106L-21-78L0-112L22-78L48-105L70-99L42-66V-30Z', gold) +
      path('M-30-43V-68H30V-43Z', ink),
    tiered:
      path('M-37-29Q-54-74 0-79Q48-73 37-29Z', ink) +
      path('M-48-75V-88H48V-75M-33-93V-109H33V-93M-16-114V-132H16V-114Z', gold) +
      ellipse(0, -65, 11, 9, '#a74a4b'),
    flower:
      path('M-38-23Q-52-68 0-77Q50-67 38-23L20-37H-20Z', ink) +
      ellipse(-30, -80, 23, 19, ink) +
      ellipse(30, -80, 23, 19, ink) +
      ellipse(0, -92, 12, 19, gold) +
      ellipse(-14, -82, 17, 11, gold) +
      ellipse(14, -82, 17, 11, gold) +
      ellipse(0, -80, 6, 7, '#a65654'),
    long:
      path(
        'M-34-27Q-49-78 0-80Q46-68 37-22L30 112L17 75L23 7L14-36L-17-39L-27-9L-24 57L-44 136Z',
        ink,
      ) +
      ellipse(5, -91, 26, 14, ink) +
      line('M-29-95L50-83', '#d8b588', 4),
    northern:
      path('M-37-30L-31-112L0-144L29-109L39-29Z', ink) +
      path('M-28-107L0-133L26-106L17-96L0-118L-18-96Z', gold) +
      line('M-31-39H34', '#cba362', 7),
  };
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(.8 .76)">${path('M-14 32H17L28 85L-29 104Z', '#dbada7')}${path('M-31-34L13-44L32-29L43-7L32 1L30 21L12 45L-7 51L-30 24Z', 'url(#face)')}${hair[style] ?? hair.knot}</g>`;
}
const illustrations: Record<string, string> = {
  'su-shi': [
    path(
      'M247 276L349 290Q402 390 374 506Q396 617 466 657Q350 670 287 653Q204 672 103 655Q167 557 165 435L194 328Z',
      robe,
    ),
    path('M253 291L189 361L112 478L171 498L273 372Z', 'url(#sleeve)'),
    path('M325 299L410 374L465 458L406 482L307 365Z', 'url(#fold)'),
    path('M256 284L289 350L323 294L319 636L252 642Z', 'url(#inner)'),
    head(280, 222, 'knot', -8),
    path('M191 179Q279 98 373 175L292 201Z', '#8d815d'),
    line('M296 120L191 179L373 175', '#c5b891', 4),
    line('M460 261L412 651', '#8c704e', 10),
    hand('M414 423L455 399L464 407L447 423L431 440Z'),
    ellipse(166, 510, 27, 36, '#bc9453'),
    ellipse(166, 478, 14, 20, '#bc9453'),
    line('M283 379L240 588M316 364L364 595', '#719699', 3),
  ].join(''),
  'wang-yangming': [
    path(
      'M231 267L350 267Q384 394 371 481Q388 589 449 656Q354 646 290 662Q211 645 127 658Q181 543 180 379Z',
      robe,
    ),
    path('M223 282L127 422L168 490L272 369Z', 'url(#sleeve)'),
    path('M333 280L425 337L449 487L369 482L302 341Z', 'url(#fold)'),
    path('M251 270L288 343L324 269L301 623H252Z', 'url(#inner)'),
    head(286, 204, 'scholar'),
    scroll(347, 337, -10),
    hand('M353 370L380 350L392 355L375 376L355 389Z'),
    path('M176 455L217 447L236 465L211 477L181 480Z', skin),
    line('M281 365L214 592M309 353L360 613', '#7a9890', 3),
  ].join(''),
  'cao-cao': [
    path('M267 284Q380 232 512 383Q467 461 503 633Q369 592 304 636L224 418Z', robe),
    path('M228 278L331 291L392 486L345 647L174 649L138 489Z', 'url(#sleeve)'),
    path('M237 294L137 381L87 466L147 496L280 386Z', 'url(#fold)'),
    path('M316 302L402 326L459 408L410 446L306 364Z', 'url(#inner)'),
    path('M245 287L276 343L307 292L288 459L249 451Z', '#acb4b4'),
    head(276, 218, 'scholar', 5),
    sword(351, 451, 79),
    hand('M362 415L384 421L394 447L369 454L354 437Z'),
    path('M203 471L348 454L354 477L198 496Z', gold),
    path('M287 244L302 271L278 307L273 259Z', ink),
  ].join(''),
  'zhuge-liang': [
    path(
      'M212 281L354 273Q432 399 402 501Q409 615 470 646Q371 675 294 655Q212 672 124 651Q167 555 149 425Z',
      robe,
    ),
    path('M220 280L155 344L108 497L205 521L272 342Z', 'url(#sleeve)'),
    path('M342 279L423 365L471 484L397 516L297 351Z', 'url(#fold)'),
    path('M247 285L282 367L320 282L332 653H224Z', 'url(#inner)'),
    head(284, 216, 'scholar'),
    path('M365 342Q448 262 497 304Q517 338 430 414L398 419Z', '#eae8d7'),
    line('M394 434L465 311', '#baad85', 6),
    line('M405 407L403 333M415 393L427 310M432 372L454 302M448 351L478 307', '#b3baa9', 2),
    hand('M360 413L391 397L409 410L391 430L369 433Z'),
    path('M272 250L299 249L285 321L270 275Z', ink),
  ].join(''),
  'li-bai': [
    path(
      'M206 310L302 270Q360 390 353 500Q374 625 450 653Q349 676 266 652Q197 673 112 650Q161 568 151 435Z',
      robe,
    ),
    path('M206 315L131 358L67 464L142 498L255 376Z', 'url(#sleeve)'),
    path('M292 283L358 271L403 172L447 184L421 344L334 371Z', 'url(#fold)'),
    path('M221 307L272 341L295 278L297 641L242 650Z', 'url(#inner)'),
    head(257, 242, 'knot', -27),
    hand('M403 181L399 148L408 128L418 130L418 154L437 159L439 180Z'),
    path('M402 120L452 118L443 145L414 150Z', gold),
    sword(192, 410, 18),
    line('M298 377Q377 451 426 579', '#ece1ce', 4),
    path('M119 374Q57 392 42 447L145 412Z', '#647f9b'),
  ].join(''),
  'tao-yuanming': [
    path(
      'M218 298L336 286Q382 397 362 496Q386 595 427 650Q326 673 260 653Q194 665 133 648Q160 559 170 436Z',
      robe,
    ),
    path('M217 300L129 380L112 490L190 493L266 350Z', 'url(#sleeve)'),
    path('M330 292L407 371L429 480L374 497L290 352Z', 'url(#fold)'),
    path('M240 290L274 351L308 289L289 641L233 644Z', 'url(#inner)'),
    head(274, 233, 'simple', 9),
    path('M163 188L272 109L385 196L274 218Z', '#a38f60'),
    line('M272 112V208M272 115L213 202M273 115L332 204', '#c8b88d', 3),
    path('M87 482L206 479L192 583L110 584Z', '#a58450'),
    line('M103 485Q144 410 191 483', '#c5aa74', 7),
    line('M115 510H199M113 534H194M119 557H187M128 487L135 581M165 485L158 582', '#725f3e', 3),
    hand('M362 456L393 432L405 440L388 469Z'),
    line('M393 449L440 346', '#b2b979', 5),
    ellipse(443, 340, 25, 15, '#e5c274'),
    ellipse(461, 323, 18, 18, '#e6cd89'),
  ].join(''),
  'liu-bang': [
    path(
      'M218 269L336 281Q376 390 350 489Q369 593 437 655Q344 671 282 650Q211 670 119 649Q164 524 158 400Z',
      robe,
    ),
    path('M220 282L113 306L46 371L111 436L259 345Z', 'url(#sleeve)'),
    path('M326 285L419 316L510 269L531 320L436 414L301 350Z', 'url(#fold)'),
    path('M244 270L281 348L311 284L296 640H232Z', 'url(#inner)'),
    head(274, 211, 'cap', -5),
    path('M248 140L285 104L301 145Z', '#c87563'),
    hand('M45 371L20 349L24 336L45 343L69 347L76 370Z'),
    hand('M495 283L517 253L540 249L547 258L532 271L522 302Z'),
    path('M186 443L347 437L354 459L180 467Z', gold),
    ellipse(302, 479, 21, 23, gold),
    ellipse(302, 479, 13, 15, '#2c2731'),
  ].join(''),
  'qin-shi-huang': [
    path(
      'M197 274L378 272Q416 416 407 510Q444 604 477 652Q361 670 292 652Q195 671 102 649L137 509L149 375Z',
      robe,
    ),
    path('M205 289L103 392L61 547L167 578L276 349Z', 'url(#sleeve)'),
    path('M369 282L475 404L524 552L413 574L304 349Z', 'url(#fold)'),
    path('M237 284L289 379L341 282L341 649H229Z', 'url(#inner)'),
    head(289, 214, 'emperor'),
    path('M226 303L254 309L290 374L324 309L351 303L290 414Z', gold),
    sword(289, 413),
    hand('M247 387L278 395L289 417L273 435L248 419Z'),
    hand('M332 387L302 396L289 417L309 432L333 415Z'),
    line('M161 458L196 520M411 458L377 520', '#a08b5c', 5),
  ].join(''),
  'zhang-juzheng': [
    path(
      'M219 272L349 272Q401 425 380 498Q391 587 452 650Q355 669 297 652Q223 669 137 650Q166 538 162 438Z',
      robe,
    ),
    path('M225 285L112 396L154 527L268 376Z', 'url(#sleeve)'),
    path('M343 281L449 389L447 506L351 520L298 357Z', 'url(#fold)'),
    path('M248 273L286 346L320 273L302 447H251Z', 'url(#inner)'),
    head(285, 211, 'wings'),
    path('M184 449L368 444L376 475L179 481Z', gold),
    [199, 239, 279, 319, 359].map((x) => path(`M${x} 449H${x + 18}V470H${x}Z`, '#bcdbcc')).join(''),
    path('M296 321L330 315L340 433L306 440Z', '#e3d5b8'),
    hand('M269 407L306 389L322 397L314 415L280 428Z'),
    path('M276 247L296 247L293 298L271 274Z', ink),
  ].join(''),
  'wang-anshi': [
    path(
      'M222 283L345 277Q389 399 365 488Q385 607 444 651Q363 670 286 651Q211 668 131 651Q169 536 166 417Z',
      robe,
    ),
    path('M226 291L135 361L114 490L194 518L274 355Z', 'url(#sleeve)'),
    path('M336 285L433 365L458 490L378 513L300 356Z', 'url(#fold)'),
    path('M252 280L280 334L313 280L297 639H245Z', 'url(#inner)'),
    head(282, 221, 'scholar', -5),
    scroll(219, 385, 4),
    scroll(316, 392, -2),
    hand('M192 407L219 397L231 414L217 435L195 438Z'),
    hand('M412 412L440 422L432 443L407 436Z'),
    line('M167 325L121 197M157 293L117 258M143 258L153 215', '#8f9e73', 5),
  ].join(''),
  'xin-qiji': [
    path('M273 263Q362 221 481 331Q457 405 520 537Q442 508 389 512L283 379Z', robe),
    path('M231 274L327 295L370 425L300 632L99 652L132 466Z', 'url(#sleeve)'),
    path('M233 290L168 302L69 239L44 279L151 381L268 355Z', 'url(#fold)'),
    path('M303 294L376 294L477 251L490 291L401 359L310 357Z', 'url(#inner)'),
    head(258, 216, 'knot', 12),
    path('M245 275L272 337L300 284L285 389L247 358Z', '#c8b6a8'),
    hand('M44 246L78 241L121 256L153 250L170 258L143 272L86 270L52 287Z'),
    hand('M467 250L493 239L511 248L509 266L477 291Z'),
    path(
      'M470 57Q586 280 448 585',
      'none',
      'stroke="#202d35" stroke-width="11" stroke-linecap="round"',
    ),
    line('M470 57L497 260L448 585', '#d3c6aa', 2),
    line('M139 261L530 254', '#292d32', 5),
    path('M525 247L553 254L525 264Z', gold),
    line('M182 405L146 554M302 403L276 537', '#63777e', 3),
  ].join(''),
  'sima-qian': [
    path(
      'M233 298L338 302Q359 365 380 445Q452 531 461 614Q404 664 330 652Q218 668 101 646Q156 582 172 483Z',
      robe,
    ),
    path('M238 312L174 391L204 490L276 421Z', 'url(#sleeve)'),
    path('M319 309L413 363L469 458L418 491L308 386Z', 'url(#fold)'),
    head(282, 256, 'cap', 13),
    path('M210 282L262 332L308 295L278 388Z', 'url(#inner)'),
    path('M85 519H502V542H85ZM112 542H133V669H112ZM459 542H480V669H459Z', '#4b3d34'),
    scroll(152, 458, 0),
    hand('M392 439L425 448L438 474L422 481L400 467Z'),
    line('M425 466L453 375', ink, 6),
    path('M425 466L418 491L427 482Z', '#d6c4a2'),
    [0, 1, 2]
      .map((i) =>
        path(`M309 ${493 - i * 17}H384V${506 - i * 17}H309Z`, i === 1 ? '#c8b185' : '#9e8254'),
      )
      .join(''),
    line('M167 470H254M167 481H242', '#a08f70', 2),
  ].join(''),
  'zheng-he': [
    path(
      'M223 275L344 269Q409 397 382 493Q409 610 478 649Q377 670 299 651Q224 673 118 654Q156 559 140 452Z',
      robe,
    ),
    path('M223 283L143 332L73 471L171 510L271 355Z', 'url(#sleeve)'),
    path('M336 277L431 343L485 487L395 522L304 351Z', 'url(#fold)'),
    path('M247 276L286 348L321 273L318 649H226Z', 'url(#inner)'),
    head(284, 213, 'cap'),
    path('M246 144L253 120H315L322 144Z', '#3b6674'),
    path('M163 395L395 371L441 474L205 503Z', '#e4d2ab'),
    line('M189 413Q263 437 306 400T418 456M215 477Q293 423 393 457', '#799294', 3),
    line('M284 394L279 480M348 387L350 478', '#bba77c', 2),
    hand('M153 403L183 401L201 419L195 440L174 429Z'),
    hand('M416 450L439 448L449 466L432 482L414 472Z'),
    path('M187 306L232 347L208 369L163 345Z', gold),
  ].join(''),
  'han-xin': [
    path('M224 272L337 291L389 433Q445 472 518 575L414 653Q305 667 203 643L116 547L175 417Z', robe),
    path('M236 291L153 350L103 449L170 482L278 366Z', 'url(#sleeve)'),
    path('M321 306L416 365L432 432L362 452L285 364Z', 'url(#fold)'),
    path('M185 501L376 471L419 536L217 582Z', '#dacba9'),
    head(279, 229, 'war', 18),
    hand('M354 418L389 415L399 437L378 448L362 463L348 450Z'),
    line('M250 525L344 503M265 540L353 518', '#827557', 3),
    sword(156, 451, -31),
    path('M215 384L329 390L337 414L203 411Z', gold),
    path('M264 141Q235 103 184 109L228 136L258 173Z', '#b97164'),
  ].join(''),
  'wu-zetian': [
    path(
      'M210 281L378 277Q413 394 398 481Q413 588 493 651Q374 671 293 650Q202 673 95 652Q148 562 140 415Z',
      robe,
    ),
    path('M215 287Q122 265 62 383L131 519L256 391Z', 'url(#sleeve)'),
    path('M365 283Q471 281 525 403L434 527L312 381Z', 'url(#fold)'),
    path('M250 281L291 360L336 277L355 650H220Z', 'url(#inner)'),
    head(292, 223, 'phoenix'),
    path('M238 309L291 357L346 307L334 348L291 389L250 350Z', gold),
    path('M192 474L386 465L397 499L184 510Z', gold),
    line('M433 293L425 621', '#b38c51', 10),
    ellipse(434, 277, 24, 23, gold),
    ellipse(434, 277, 10, 10, '#bb7060'),
    hand('M402 420L434 407L446 420L439 440L410 445Z'),
    hand('M181 452L220 463L228 484L202 494L176 476Z'),
  ].join(''),
  'li-qingzhao': [
    path(
      'M242 278L345 293Q366 395 351 477Q361 594 435 649Q339 675 274 654Q202 676 123 648Q172 556 154 432L178 371Z',
      robe,
    ),
    path('M244 294L165 349L110 491L191 526L274 356Z', 'url(#sleeve)'),
    path('M334 302L403 389L461 453L401 502L310 370Z', 'url(#fold)'),
    path('M260 280L290 336L315 287L286 648L227 655Z', 'url(#inner)'),
    head(285, 224, 'loops', -13),
    ellipse(397, 362, 66, 73, '#e8d7cb'),
    ellipse(397, 362, 57, 64, '#dac7c3'),
    line('M397 414L387 492', '#b59282', 6),
    line('M360 361Q396 330 432 364M374 388L419 332', '#a6a99b', 2),
    hand('M356 451L380 434L401 440L403 457L377 474Z'),
    scroll(160, 498, 14),
    path('M324 304Q352 394 471 487L430 551Q341 482 306 367Z', '#8994b3'),
  ].join(''),
  'shangguan-waner': [
    path(
      'M212 282L340 284Q379 421 355 481Q383 582 452 650Q345 675 274 653Q198 674 113 648Q164 551 165 421Z',
      robe,
    ),
    path('M222 288L133 359L78 494Q148 564 236 512L282 348Z', 'url(#sleeve)'),
    path('M329 292Q385 292 401 232L424 147L471 165L452 330Q425 408 349 410Z', 'url(#fold)'),
    path('M241 280L281 344L316 285L294 649H230Z', 'url(#inner)'),
    head(277, 217, 'butterfly', -4),
    hand('M425 154L416 128L425 104L438 109L438 134L457 148L448 168Z'),
    line('M434 129L486 54', '#342331', 6),
    path('M486 54L497 38L491 68Z', '#dbc3a5'),
    scroll(117, 413, -9),
    hand('M199 418L232 424L243 441L225 455L198 439Z'),
    path('M279 350Q327 449 390 507L409 548Q340 519 294 445Z', '#b685ae'),
  ].join(''),
  'ban-zhao': [
    path(
      'M218 280L345 280Q378 395 361 489Q379 594 426 648Q331 671 279 654Q213 666 133 648Q176 539 172 410Z',
      robe,
    ),
    path('M226 291L148 367L133 503L216 514L272 352Z', 'url(#sleeve)'),
    path('M337 289L420 367L449 500L361 522L299 350Z', 'url(#fold)'),
    path('M249 281L284 340L317 281L302 646H237Z', 'url(#inner)'),
    head(282, 225, 'simple', 7),
    path(
      'M176 396Q238 369 282 402Q336 371 397 391L389 491Q331 472 282 498Q233 477 182 492Z',
      '#ecdec1',
    ),
    line(
      'M282 402V498M194 418L254 412M195 434L255 428M307 411L374 410M307 427L374 426',
      '#b0a083',
      2,
    ),
    hand('M159 436L179 421L195 434L192 456L170 464Z'),
    hand('M390 434L414 430L424 445L402 470L388 456Z'),
    [0, 1, 2]
      .map((i) =>
        path(`M137 ${594 + i * 15}H261V${605 + i * 15}H137Z`, i % 2 ? '#c7b68b' : '#897b58'),
      )
      .join(''),
  ].join(''),
  'cai-wenji': [
    path(
      'M224 292L333 282L391 487Q409 549 477 615Q421 660 365 650Q243 671 104 649Q141 584 157 490Z',
      robe,
    ),
    path('M230 284L170 334L121 507L197 528L273 354Z', 'url(#sleeve)'),
    path('M320 287L409 352L452 490L374 525L291 355Z', 'url(#fold)'),
    path('M211 304L191 622L228 649L270 389L307 292Z', 'url(#inner)'),
    head(276, 233, 'hood', -12),
    path(
      'M359 299L389 156L405 158L387 311Q443 365 408 446Q365 505 308 454Q261 404 314 348Z',
      '#b78761',
    ),
    path('M352 321Q417 359 389 424Q359 465 327 432Q299 397 337 350Z', '#d7af7d'),
    line('M383 170L343 432M390 172L350 434M397 174L358 432', '#634933', 2),
    hand('M311 385L348 367L362 380L347 398L320 411Z'),
    hand('M367 288L387 273L399 280L395 302L374 312Z'),
    path('M367 149L416 151L411 173L364 171Z', gold),
  ].join(''),
  'fu-hao': [
    path(
      'M207 276L355 272L431 490Q413 571 439 650Q337 672 271 652Q194 669 110 650Q165 529 154 455Z',
      robe,
    ),
    path('M210 288L135 325L87 457L159 488L251 345Z', 'url(#sleeve)'),
    path('M346 280L426 335L465 443L405 464L305 337Z', 'url(#fold)'),
    path('M239 292L282 342L323 290L330 449H229Z', 'url(#inner)'),
    head(281, 216, 'bronze'),
    [0, 1, 2, 3]
      .map((i) =>
        path(
          `M${190 - i * 9} ${462 + i * 39}H${369 + i * 9}V${486 + i * 39}H${183 - i * 9}Z`,
          i % 2 ? '#554638' : '#8e714b',
        ),
      )
      .join(''),
    line('M464 204L414 647', '#745432', 12),
    path('M455 212L444 122Q493 99 537 142L525 215L483 247Z', gold),
    path('M472 144L476 222L516 198L523 150Z', '#9c8659'),
    hand('M415 396L456 384L466 399L446 422L421 423Z'),
    path('M176 441L378 435L384 460L169 469Z', gold),
  ].join(''),
  'lu-zhi': [
    path(
      'M214 280L356 280Q414 420 382 486Q409 591 477 651Q367 675 286 654Q209 674 103 650Q154 548 155 419Z',
      robe,
    ),
    path('M220 282L131 348L73 501L166 545L266 350Z', 'url(#sleeve)'),
    path('M349 282L445 353L500 508L399 545L298 345Z', 'url(#fold)'),
    path('M246 282L282 351L320 282L339 651H217Z', 'url(#inner)'),
    head(282, 231, 'tiered'),
    path('M210 304L281 366L352 301L344 325L282 391L221 327Z', gold),
    path('M243 426L312 424L323 464L233 468Z', gold),
    ellipse(279, 419, 18, 15, '#b99357'),
    hand('M193 447L232 434L250 445L245 468L220 481L193 465Z'),
    hand('M343 438L313 435L301 449L316 470L345 466Z'),
    line('M176 526L143 618M390 531L417 619', '#91666c', 4),
  ].join(''),
  zhangsun: [
    path(
      'M226 287L347 279Q382 407 368 484Q389 601 449 650Q355 672 287 653Q210 674 128 650Q173 539 173 403Z',
      robe,
    ),
    path('M223 285L136 357L85 489L166 529L271 351Z', 'url(#sleeve)'),
    path('M338 282L427 350L478 491L392 524L299 346Z', 'url(#fold)'),
    path('M253 283L286 341L316 281L324 650H239Z', 'url(#inner)'),
    head(285, 224, 'flower', -3),
    path(
      'M190 313Q106 368 119 477Q179 529 238 527L232 551Q104 542 84 471Q81 356 182 293Z',
      '#d8c6ac',
    ),
    path('M357 301Q468 359 475 476L437 511Q475 405 350 328Z', '#d8c6ac'),
    ellipse(289, 414, 58, 59, '#e6d7b7'),
    line('M289 460V515', '#b69667', 7),
    hand('M245 490L282 477L302 485L301 505L276 518L248 511Z'),
    line('M253 416Q287 386 325 412', '#b1b88f', 2),
  ].join(''),
  'zhuo-wenjun': [
    path(
      'M227 292L333 295L388 477Q406 554 472 623Q418 668 352 650Q251 672 99 649Q148 585 144 516Z',
      robe,
    ),
    path('M233 304L165 362L112 468L183 496L275 353Z', 'url(#sleeve)'),
    path('M325 301L402 379L473 458L418 496L293 365Z', 'url(#fold)'),
    path('M251 299L279 345L310 301L298 610L226 639Z', 'url(#inner)'),
    head(278, 245, 'long', 13),
    path('M61 510L473 462L496 490L78 544Z', '#422d39'),
    line('M82 516L470 473M90 524L474 481', '#cfb690', 2),
    hand('M164 466L205 476L219 494L193 501L173 486Z'),
    hand('M385 449L417 458L432 477L413 486L392 473Z'),
    path('M189 327Q126 405 181 495L211 565L166 573Q108 478 129 402Z', '#c890a2'),
    line('M291 564L320 645', '#be879b', 4),
  ].join(''),
  'feng-taihou': [
    path(
      'M209 280L364 278Q409 407 387 487Q414 600 475 650Q359 673 287 652Q201 670 98 650Q154 552 150 421Z',
      robe,
    ),
    path('M213 280L139 315L79 464L163 512L272 344Z', 'url(#sleeve)'),
    path('M353 279L437 329L492 468L404 516L302 345Z', 'url(#fold)'),
    path('M238 280L288 355L335 280L347 650H225Z', 'url(#inner)'),
    head(288, 231, 'northern'),
    path('M193 294L232 302L288 362L345 300L383 295L365 346L289 397L210 347Z', gold),
    path('M351 357L407 370L388 494L332 480Z', '#d8c39b'),
    line('M363 374L345 467M378 378L360 471M393 382L375 475', '#a68b62', 3),
    hand('M314 431L344 417L361 430L355 450L326 459Z'),
    hand('M169 412L199 398L228 408L238 423L215 432L189 425Z'),
    path('M231 489H349V509H231Z', gold),
  ].join(''),
};

// Li Bai: an elongated, upturned silhouette; the raised sleeve carries the gesture.
illustrations['li-bai'] = [
  path(
    'M279 253L359 239Q423 289 443 389L408 507Q426 610 519 661Q404 683 315 659Q250 675 175 651Q221 556 237 450Z',
  ),
  path('M279 261L222 120L88 313Q94 452 197 505L295 330Z', 'url(#sleeve)'),
  path('M348 259Q414 265 440 357L462 482L356 433L306 329Z', 'url(#fold)'),
  path('M290 292Q279 464 248 565L310 661Q253 672 195 650L237 444Z', 'url(#inner)'),
  head(306, 194, 'knot', -24),
  path('M284 235L294 255L271 290Z', ink),
  hand('M222 125L214 93L247 69L283 67L290 79L270 88L249 95L245 132Z'),
  path('M263 67Q290 76 315 66L306 91L288 98L289 111L270 106L276 92Z', '#736047'),
  hand('M335 397L294 417L280 441L297 457L316 443L355 432Z'),
  sword(301, 434, -32),
  ellipse(263, 490, 22, 27, '#745b43'),
  ellipse(270, 530, 32, 37, '#654e3d'),
  line('M263 486L255 566M270 555L282 576', '#171714', 3),
  path(
    'M330 153Q370 195 374 244Q380 271 419 285L405 292Q365 280 363 245Q366 212 324 169Z',
    '#3d3430',
  ),
].join('');

mkdirSync('public/characters', { recursive: true });
for (const c of characters) {
  const v = characterVisuals[c.id];
  if (!illustrations[c.id] || !v) throw new Error('Missing portrait: ' + c.id);
  const shade = (hex: string, amount: number) =>
    '#' +
    hex
      .slice(1)
      .match(/../g)!
      .map((n) =>
        Math.round(parseInt(n, 16) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840"><title>${c.name} · ${v.motif}</title><defs><linearGradient id="robe" x2=".8" y2="1"><stop stop-color="#050707"/><stop offset=".58" stop-color="${shade(v.robe, 0.34)}"/><stop offset="1" stop-color="#070909"/></linearGradient><linearGradient id="sleeve" x2="1" y2="1"><stop stop-color="#090b0b"/><stop offset=".72" stop-color="${shade(v.robe, 0.75)}"/><stop offset="1" stop-color="#202420"/></linearGradient><linearGradient id="fold" x2=".8" y2="1"><stop stop-color="#090c0b"/><stop offset=".62" stop-color="${shade(v.robe, 0.45)}"/><stop offset="1" stop-color="#080b0a"/></linearGradient><linearGradient id="inner" x2="1" y2="1"><stop stop-color="${shade(v.robe, 0.65)}"/><stop offset="1" stop-color="#0d100e"/></linearGradient><linearGradient id="face" x2="1" y2="1"><stop stop-color="#f8cfca"/><stop offset="1" stop-color="#e9b1ae"/></linearGradient><linearGradient id="gold" x2=".7" y2="1"><stop stop-color="#c4a879"/><stop offset="1" stop-color="#806b49"/></linearGradient></defs><g transform="translate(0 8) scale(1 1.22)">${illustrations[c.id]}</g></svg>`;

  writeFileSync(`public/characters/${c.id}.svg`, svg);
}
console.log('Created 24 individually composed geometric character portraits.');
