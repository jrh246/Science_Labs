"""Render retained lab review PDFs and check text fidelity. Run with a stable lab ID."""
from pathlib import Path
import sys,json,re
import pymupdf as fitz
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
lab_id=sys.argv[1]
if not re.fullmatch('[a-z0-9-]+',lab_id):raise SystemExit('Use a stable lowercase lab ID.')
OUT=ROOT/'data/development-tracker/biology-reviews/evidence'/lab_id
paths=list((ROOT/'public/resources').glob(lab_id+'-*.pdf'))+list(OUT.glob('*.pdf'))
summary=[];thumbs=[]
for path in paths:
    doc=fitz.open(path);text=re.sub(r'\s+',' ',' '.join(page.get_text() for page in doc))
    if any(not page.get_text().strip() for page in doc):raise ValueError('Blank page in '+str(path))
    if path.name.startswith('long') and 'FINAL LONG ANSWER' not in text:raise ValueError('Lost final long answer')
    if path.name=='complete.pdf' and not all(x in text for x in ['Zoë García','Complete','PST']):raise ValueError('Lost completed report identity/status/time zone')
    summary.append({'file':path.relative_to(ROOT).as_posix(),'pages':len(doc),'pageCharacters':[len(page.get_text()) for page in doc],'finalLongMarker':'FINAL LONG ANSWER' in text})
    for i,page in enumerate(doc):
        pix=page.get_pixmap();im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);im.save(OUT/f'{path.stem}-page-{i+1}.png');im.thumbnail((306,396))
        tile=Image.new('RGB',(330,430),'#dce5da');tile.paste(im,((330-im.width)//2,25));ImageDraw.Draw(tile).text((10,6),path.stem+f' / {i+1}',fill='black');thumbs.append(tile)
for batch in range(0,len(thumbs),8):
    group=thumbs[batch:batch+8];sheet=Image.new('RGB',(1320,430*((len(group)+3)//4)),'#dce5da')
    for i,tile in enumerate(group):sheet.paste(tile,((i%4)*330,(i//4)*430))
    sheet.save(OUT/f'pdf-contact-{batch//8+1}.png')
(OUT/'pdf-inspection.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary))
