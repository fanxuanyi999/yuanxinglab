"""Build the OFL display font subset from the project's authored copy."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = Path('C:/Windows/Fonts/Source Han Serif SC Heavy (TrueType).ttf')
text = ''.join(p.read_text(encoding='utf-8') for p in (root / 'src').rglob('*') if p.suffix in {'.ts', '.tsx'})
text += ''.join(chr(n) for n in range(32, 127))
font = TTFont(source)
for record in font['name'].names:
    if record.nameID in (1, 4, 6, 16, 17):
        value = 'ArchetypeDisplay-Heavy' if record.nameID == 6 else ('Heavy' if record.nameID == 17 else 'Archetype Display')
        record.string = value.encode(record.getEncoding())
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
options.name_legacy = True
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = 'woff2'
destination = root / 'public/fonts/archetype-display-heavy.woff2'
destination.parent.mkdir(parents=True, exist_ok=True)
font.save(destination)
print(f'{len(set(text))} characters; {destination.stat().st_size:,} bytes')
