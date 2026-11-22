"""Build virtual surface-tension resources from current authored content."""
from pathlib import Path
import json,subprocess,hashlib,os
from html import escape
from resource_fonts import resource_text
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1]
c=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {surfaceContent as c} from './src/investigations/surface-content.js';console.log(JSON.stringify(c))"],cwd=ROOT,encoding='utf-8'))
font=next((p for p in [Path(os.environ.get('LAB_RESOURCE_FONT','C:/Windows/Fonts/arial.ttf')),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')] if p.is_file()),None)
bold=next((p for p in [Path('C:/Windows/Fonts/arialbd.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')] if p.is_file()),font)
if not font:raise SystemExit('Set LAB_RESOURCE_FONT to a Unicode TrueType font for printable resources.')
pdfmetrics.registerFont(TTFont('LabFont',str(font)));pdfmetrics.registerFont(TTFont('LabFontBold',str(bold)))
styles=getSampleStyleSheet()
for style in styles.byName.values():style.fontName='LabFont';style.fontSize=10;style.leading=14;style.spaceAfter=8
for name in ['Title','Heading1','Heading2']:styles[name].fontName='LabFontBold';styles[name].textColor=colors.HexColor('#315941')
styles['Title'].fontSize=22;styles['Title'].leading=27
styles['Heading1'].fontSize=17;styles['Heading1'].leading=22
styles['Heading2'].fontSize=12;styles['Heading2'].leading=17
def p(text,style='Normal'):return Paragraph(resource_text(text,styles[style].fontName),styles[style])
def lines(n=2):return [p('_'*78) for _ in range(n)]
def footer(canvas,doc):canvas.setFont('LabFont',8);canvas.drawString(42,25,'Science Labs | Water and Surface Tension | Virtual only | English');canvas.drawRightString(570,25,str(doc.page))
def build(kind,story):
    path=ROOT/'public/resources'/f'water-surface-tension-{kind}.pdf'
    SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=42,rightMargin=42,topMargin=40,bottomMargin=45).build(story,onFirstPage=footer,onLaterPages=footer)
    return path
student=[p(c['title'],'Title'),p('Student worksheet | Virtual only'),p('Name (optional): ______________________   Class / period: ______________'),p(c['question'],'Heading2'),p(c['intro']),p('Predict and design before setup','Heading2'),p(c['prediction']),*lines(),p(c['design']),*lines(),p(c['controls']),p(c['sampling']),PageBreak(),p('Observe and interpret','Heading1'),p('Clean each coin. Place its dedicated dropper above the center. Add three individual drops before using the optional faster additions. At the first spill, subtract the spilling drop from the counter. Multiply the last retained count by 0.05 mL to find the retained volume.')]
t=Table([['Liquid','Counter at spill','Retained drops','Retained volume (mL)'],['Water','','',''],['Detergent solution','','','']],colWidths=[145,115,110,158],rowHeights=[30,30,30]);t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'LabFont'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#b2c1a9')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2e7')),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
student+=[t,Spacer(1,12)]
for q in c['explanations']:student+=[p(q['prompt']),*lines()]
student+=[PageBreak(),p('Concept checks and model limits','Heading1')]
for q in c['checks']:student+=[p(q['prompt'],'Heading2')]+[p('O  '+label) for _,label in q['choices']]
student+=[p('Model limits','Heading2'),p(c['limits']),p('Keep your work','Heading2'),p('Download your recorded work as a PDF lab report or use native print. The completed report includes actual answers and observations. This blank worksheet does not replace that report. Save completion confirms local storage only; it is not a grade or submission.'),p('Sources','Heading2')]+[p(x['title']+' - '+x['url']) for x in c['sources']]
teacher=[p(c['title'],'Title'),p('Teacher guide | Virtual only'),p(c['question'],'Heading2'),p(c['teacher']['purpose']),p('Learning evidence','Heading2')]
for g in c['goals']:teacher+=[p(g['text'])]
teacher+=[p('Controlled comparison and workload','Heading2'),p(c['controls']),p(c['teacher']['rationale']),p(c['teacher']['mode']),p('Interpretation','Heading2'),p(c['teacher']['guidance']),PageBreak(),p('Reasoning and feedback','Heading1')]
for q in c['checks']:teacher+=[p(q['prompt'],'Heading2'),p('Correct: '+next(label for key,label in q['choices'] if key==q['correct'])),p(q['feedback'])]
teacher+=[p('Written evidence','Heading2')]+[p(q['prompt']) for q in c['explanations']]+[p('Model limits','Heading2'),p(c['limits']),p('Reports, access, and extensions','Heading1'),p('Guests can access this free lab and download the completed PDF lab report or use native print. Optional name and period, actual first prediction, student measurements, corrections, and original explanations appear in the report. No automatic grade or authenticated submission is implied. English is available; language switching and reviewed Spanish print materials remain future work.'),p(c['teacher']['extension']),p('Sources','Heading2')]+[p(x['title']+' - '+x['url']) for x in c['sources']]
paths=[build('worksheet',student),build('teacher-guide',teacher)]
ip=ROOT/'ASSET_INVENTORY.json';inventory=json.loads(ip.read_text(encoding='utf-8-sig'))
for path in paths:
    raw=path.read_bytes();rel=path.relative_to(ROOT).as_posix();inventory=[x for x in inventory if x['path']!=rel]+[{'path':rel,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}]
ip.write_text(json.dumps(sorted(inventory,key=lambda x:x['path']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Generated surface-tension worksheet and teacher guide with Unicode fonts; updated only their asset hashes.')
