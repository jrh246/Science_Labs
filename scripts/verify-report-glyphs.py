"""Verify actual PDF glyphs and full source fragments, excluding layout whitespace.
Usage: python scripts/verify-report-glyphs.py REPORT.pdf [SNAPSHOT.json]
Build-time PyMuPDF check; visual and language review remain separate.
"""
import sys,json,re,unicodedata
from pathlib import Path
import pymupdf
pdf=Path(sys.argv[1]);doc=pymupdf.open(pdf)
body='\n'.join(span['text'] for page in doc for block in page.get_text('dict')['blocks'] if 'lines' in block for line in block['lines'] for span in line['spans'] if span['bbox'][1]<748)
if '\x00' in body or '\ufffd' in body:raise SystemExit('Missing/replacement glyph in '+pdf.name)
def compact(text):return re.sub(r'\s+','',unicodedata.normalize('NFKC',str(text)))
checked=0
if len(sys.argv)>2:
    r=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8-sig'));fragments=[r['title'],r['question'],r['student']['name'],r['student']['class']]
    for section in r['sections']:
        fragments.append(section['heading'])
        for block in section['blocks']:
            if block['type']=='response':fragments.extend([block['prompt'],block['text']])
            elif block['type']=='table':fragments.extend(block['columns']);fragments.extend(str(v) for row in block['rows'] for v in row if v is not None)
            else:fragments.append(block['text'])
    text=compact(body)
    for value in fragments:
        if value and compact(value) not in text:raise SystemExit('Source text/glyph lost: '+ascii(value[:95]))
        checked+=bool(value)
print(f'{pdf.name}: no missing/replacement glyphs; {checked} complete source fragments retained across {len(doc)} pages (layout whitespace ignored).')
