import type { ShareCardData } from './shareCard';
import { characterVisuals } from '../data/characterVisuals';
const W = 1080,
  H = 1440;
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('人物图像暂时加载失败，请重试。'));
    image.src = src;
  });
}
export function wrapText(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    if (char === '\n') {
      lines.push(line);
      line = '';
      continue;
    }
    if (ctx.measureText(line + char).width > width && line) {
      lines.push(line);
      line = char;
    } else line += char;
  }
  if (line) lines.push(line);
  return lines;
}
function drawFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  min = 24,
  family = 'sans-serif',
  weight = 400,
) {
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > width && size > min)
    ctx.font = `${weight} ${--size}px ${family}`;
  ctx.fillText(text, x, y);
}
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await document.fonts.load('900 48px "Archetype Display"');
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器暂不支持图片绘制。');
  const { primary: p, secondary: s, closeness } = data;
  const v = characterVisuals[p.id];
  const portrait = await loadImage(p.image);
  const display = '"Archetype Display", "Songti SC", SimSun, serif';
  const sans = '"PingFang SC", "Microsoft YaHei", sans-serif';
  const ink = '#141410';
  const text = '#fff9e9';
  const quiet = '#d1cfc1';

  const sky = ctx.createLinearGradient(0, 0, W, 980);
  sky.addColorStop(0, v.top);
  sky.addColorStop(1, '#171612');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 960);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = v.top;
  ctx.fillRect(0, 0, 265, 960);
  ctx.globalAlpha = 1;
  ctx.fillStyle = text;
  ctx.font = `500 23px ${sans}`;
  ctx.fillText('人生原型实验室', 65, 69);
  ctx.textAlign = 'right';
  ctx.fillText('与你相遇的历史原型', 1015, 69);
  ctx.textAlign = 'left';
  ctx.strokeStyle = v.light + '55';
  ctx.beginPath();
  ctx.moveTo(65, 106);
  ctx.lineTo(1015, 106);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 110, W, 850);
  ctx.clip();
  const glow = ctx.createRadialGradient(740, 560, 0, 740, 560, 590);
  glow.addColorStop(0, v.glow + 'aa');
  glow.addColorStop(0.42, v.bottom + 'aa');
  glow.addColorStop(1, v.top + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 110, W, 850);
  // Contain the entire generated figure, including weapons and the robe hem.
  const portraitBox = { x: 290, y: 235, width: 760, height: 725 };
  const portraitScale = Math.min(
    portraitBox.width / portrait.naturalWidth,
    portraitBox.height / portrait.naturalHeight,
  );
  const portraitWidth = portrait.naturalWidth * portraitScale;
  const portraitHeight = portrait.naturalHeight * portraitScale;
  ctx.drawImage(
    portrait,
    portraitBox.x + (portraitBox.width - portraitWidth) / 2,
    portraitBox.y + portraitBox.height - portraitHeight,
    portraitWidth,
    portraitHeight,
  );
  ctx.restore();

  ctx.fillStyle = text;
  ctx.font = `25px ${sans}`;
  ctx.fillText(p.era, 69, 166);
  const nameSize = p.name.length === 4 ? 124 : 143;
  ctx.font = `900 ${nameSize}px ${display}`;
  [...p.name].forEach((char, i) => ctx.fillText(char, 60, 320 + i * (nameSize + 14)));
  drawFitText(ctx, p.identity, 69, 907, 600, 22, 18, sans);
  ctx.font = `28px ${sans}`;
  ctx.textAlign = 'right';
  wrapText(ctx, v.encounter, 540).forEach((line, i) => ctx.fillText(line, 1008, 180 + i * 48));
  ctx.textAlign = 'left';

  ctx.fillStyle = ink;
  ctx.fillRect(0, 960, W, H - 960);
  ctx.fillStyle = text;
  drawFitText(ctx, p.archetypeTitle, 65, 1045, 950, 46, 30, display, 900);
  ctx.font = `500 24px ${sans}`;
  ctx.fillText(p.tags.join('  /  '), 67, 1100);
  ctx.textAlign = 'right';
  ctx.font = `22px ${sans}`;
  ctx.fillStyle = quiet;
  ctx.fillText(`${closeness}% 原型接近度`, 1015, 1100);
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#797c6a';
  ctx.beginPath();
  ctx.moveTo(65, 1130);
  ctx.lineTo(1015, 1130);
  ctx.stroke();
  let quoteSize = 35;
  let lines: string[] = [];
  do {
    ctx.font = `500 ${quoteSize}px ${sans}`;
    lines = wrapText(ctx, p.shareQuote, 940);
    if (lines.length <= 2) break;
    quoteSize--;
  } while (quoteSize > 25);
  ctx.fillStyle = text;
  lines.forEach((line, i) => ctx.fillText(line, 65, 1196 + i * 50));
  ctx.font = `23px ${sans}`;
  ctx.fillStyle = quiet;
  ctx.fillText(`另一面的你 · ${s.name}`, 67, 1300);
  ctx.strokeStyle = '#797c6a';
  ctx.beginPath();
  ctx.moveTo(65, 1333);
  ctx.lineTo(1015, 1333);
  ctx.stroke();
  ctx.font = `900 28px ${display}`;
  ctx.fillStyle = text;
  ctx.fillText('千年之外，与你相逢。', 65, 1381);
  ctx.font = `16px ${sans}`;
  ctx.fillStyle = quiet;
  ctx.fillText('原创人物意象 · 自我探索与娱乐体验', 65, 1414);
  if (data.qrCode) {
    const qr = await loadImage(data.qrCode);
    ctx.drawImage(qr, 919, 1345, 80, 80);
  } else {
    ctx.textAlign = 'right';
    ctx.font = `18px ${sans}`;
    ctx.fillText('历史人格原型', 1015, 1394);
    ctx.textAlign = 'left';
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片生成失败，请重试。'))),
      'image/png',
    ),
  );
}
