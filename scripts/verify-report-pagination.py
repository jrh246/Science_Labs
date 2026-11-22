"""Verify a response prompt shares a PDF page with the start of its answer.

Build-time only: python scripts/verify-report-pagination.py REPORT.pdf SNAPSHOT.json
Uses the same PyMuPDF environment as report rendering. Reports long answers may
continue across pages. This check does not claim visual/classroom acceptance.
"""
import sys,json,re,unicodedata
from pathlib import Path
import pymupdf
def clean(value):
    text=unicodedata.normalize('NFKC',str(value))
    # PDF extraction keeps a real hyphen and inserts a line break after it.
    # Join only within this page; never hide a cross-page orphan.
    text=re.sub(r'(?<=[-‐‑])\s*[\r\n]+\s*','',text)
    return re.sub(r'\s+',' ',text).strip()
pdf,snapshot=map(Path,sys.argv[1:3])
pages=[clean(p.get_text()) for p in pymupdf.open(pdf)]
r=json.loads(snapshot.read_text(encoding='utf-8-sig'))
checked=0
for section in r['sections']:
    first=section['blocks'][0] if section['blocks'] else None
    if first and first['type']=='response':
        heading,prompt=clean(section['heading']),clean(first['prompt'])
        start=' '.join(clean(first['text']).split(' ')[:8])
        if not any(heading in page and prompt in page and (not start or start in page) for page in pages):
            raise SystemExit('Orphaned section heading: '+heading)
    for block in section['blocks']:
        if block['type']!='response':continue
        prompt,answer=clean(block['prompt']),clean(block['text'])
        found=[p for p in pages if prompt in p]
        if not found:raise SystemExit('Prompt missing or spans pages: '+prompt[:85])
        # Whole first words retain student punctuation/Unicode and avoid requiring
        # an entire multi-page answer to fit next to the prompt.
        start=' '.join(answer.split(' ')[:8])
        if answer and not any(start in p for p in found):raise SystemExit('Orphaned prompt: '+prompt[:85])
        checked+=1
print(f'{pdf.name}: {checked} response prompts share a page with the start of their answer; {len(pages)} pages, no missing prompt.')
