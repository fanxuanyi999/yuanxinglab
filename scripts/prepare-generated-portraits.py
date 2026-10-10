"""Package image_gen raster outputs; only resize and add transparent padding.

No drawing, synthesis, background removal, or replacement of generated alpha.
Run from the repository root after all 24 originals exist.
"""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'output/imagegen'
WEB = ROOT / 'public/characters/generated'
FINAL = ART / 'final'
SIZE = (800, 1120)
MARGIN = 64

manifest = json.loads((ART / 'character-manifest.json').read_text(encoding='utf-8-sig'))
missing = [c['id'] for c in manifest if not (ART / 'originals' / (c['id'] + '.png')).exists()]
if missing:
    raise SystemExit('Missing generated originals: ' + ', '.join(missing))
WEB.mkdir(parents=True, exist_ok=True)
FINAL.mkdir(parents=True, exist_ok=True)
checks = []
sheet = Image.new('RGB', (1600, 4 * 402), '#ececdd')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 21)

for index, character in enumerate(manifest):
    ident = character['id']
    source = ART / 'originals' / (ident + '.png')
    original = Image.open(source)
    if original.mode != 'RGBA':
        raise ValueError(f'{ident}: missing RGBA alpha')
    alpha = original.getchannel('A')
    if alpha.getextrema()[0] != 0 or alpha.histogram()[0] < original.width * original.height * 0.1:
        raise ValueError(f'{ident}: background is not substantially transparent')
    # Include every nontransparent source pixel, even very faint edge antialiasing.
    bounds = alpha.getbbox()
    figure = original.crop(bounds)
    figure.thumbnail((SIZE[0] - 2 * MARGIN, SIZE[1] - 2 * MARGIN), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(figure, ((SIZE[0] - figure.width) // 2, (SIZE[1] - figure.height) // 2))
    png = FINAL / (ident + '.png')
    webp = WEB / (ident + '.webp')
    canvas.save(png, optimize=True)
    canvas.save(webp, quality=90, method=6)
    decoded = Image.open(webp).convert('RGBA')
    bbox = decoded.getchannel('A').getbbox()
    margins = [bbox[0], bbox[1], SIZE[0] - bbox[2], SIZE[1] - bbox[3]]
    if min(margins) < MARGIN:
        raise ValueError(f'{ident}: insufficient safe margin {margins}')
    checks.append({
        'id': ident, 'name': character['name'], 'sourceSize': original.size,
        'sourceMode': original.mode, 'sourceAlphaExtrema': alpha.getextrema(),
        'sourceTransparentPixels': alpha.histogram()[0], 'sourceBounds': bounds,
        'outputSize': SIZE, 'outputAlphaExtrema': decoded.getchannel('A').getextrema(),
        'safeMarginsPx': margins, 'webpBytes': webp.stat().st_size,
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'webpSha256': hashlib.sha256(webp.read_bytes()).hexdigest(),
    })
    character.pop('model', None)
    character.update({
        'generationTool': 'builtin image_gen', 'model': 'tool-selected (not pinned)',
        'status': 'generated', 'sourceFile': source.relative_to(ROOT).as_posix(),
        'finalFile': png.relative_to(ROOT).as_posix(),
        'webFile': webp.relative_to(ROOT).as_posix(),
        'actualPromptFile': f'output/imagegen/prompts/builtin-2026-10-10/{ident}.txt',
        'referenceFiles': ['output/imagegen/references/poet-style.png'] if ident == 'li-bai' else [
            'output/imagegen/originals/li-bai.png', 'output/imagegen/references/column-style.png'],
        'originalSize': list(original.size), 'webSize': list(SIZE), 'transparent': True,
    })
    thumb = decoded.copy()
    thumb.thumbnail((254, 356), Image.Resampling.LANCZOS)
    x, y = (index % 6) * 266, (index // 6) * 402
    sheet.paste(thumb, (x + (266 - thumb.width) // 2, y), thumb)
    draw.text((x + 12, y + 362), character['name'], font=font, fill='#292b25')

(ART / 'character-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(ART / 'asset-validation.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sheet.save(ART / 'character-contact-sheet.jpg', quality=94)
print(json.dumps({'count': len(checks), 'size': SIZE, 'minimumMarginPx': MARGIN,
                  'webpTotalBytes': sum(c['webpBytes'] for c in checks)}, indent=2))
