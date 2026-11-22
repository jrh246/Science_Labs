"""Build matching resources from a lab's authored content (build-time only).

Usage: python scripts/build-biology-resources.py food-macromolecules food-content.js foodContent
"""
from pathlib import Path
import json,subprocess,hashlib,os,re,sys
from html import escape
from resource_fonts import resource_text
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing,Line,Circle,String,Rect
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1]
lab_id,module,symbol=sys.argv[1:4]
if not re.fullmatch('[a-z0-9-]+',lab_id) or not re.fullmatch(r'[a-z0-9-]+\.js',module) or not re.fullmatch('[A-Za-z][A-Za-z0-9_]*',symbol):raise SystemExit('Use a stable lab ID, local module filename, and export name.')
query=f"import {{{symbol} as c}} from './src/investigations/{module}';console.log(JSON.stringify(c))"
c=json.loads(subprocess.check_output(['node','--input-type=module','-e',query],cwd=ROOT,encoding='utf-8'))
if c['id']!=lab_id:raise SystemExit('Content ID does not match requested lab.')
font=next((p for p in [Path(os.environ.get('LAB_RESOURCE_FONT','C:/Windows/Fonts/arial.ttf')),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')] if p.is_file()),None)
bold=next((p for p in [Path('C:/Windows/Fonts/arialbd.ttf'),Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')] if p.is_file()),font)
if not font:raise SystemExit('Set LAB_RESOURCE_FONT to a Unicode TrueType font.')
pdfmetrics.registerFont(TTFont('LabFont',str(font)));pdfmetrics.registerFont(TTFont('LabBold',str(bold)))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Small',parent=styles['Normal']))
for s in styles.byName.values():s.fontName='LabFont';s.fontSize=10;s.leading=14;s.spaceAfter=8
for name in ['Title','Heading1','Heading2']:styles[name].fontName='LabBold';styles[name].textColor=colors.HexColor('#315941');styles[name].keepWithNext=True
styles['Title'].fontSize=22;styles['Title'].leading=27
styles['Heading1'].fontSize=17;styles['Heading1'].leading=22
styles['Heading2'].fontSize=12;styles['Heading2'].leading=17
styles['Small'].fontName='LabFont';styles['Small'].fontSize=8.5;styles['Small'].leading=12
styles.add(ParagraphStyle(name='Choice',parent=styles['Normal'],spaceAfter=2))
styles.add(ParagraphStyle(name='Source',parent=styles['Small'],spaceAfter=3))
def p(text,style='Normal'):return Paragraph(resource_text(text,styles[style].fontName),styles[style])
def lines(n=2):return [p('_'*78) for _ in range(n)]
def footer(canvas,doc):canvas.setFont('LabFont',8);canvas.drawString(42,25,'Science Labs | '+lab_id+' | Virtual only | English');canvas.drawRightString(570,25,str(doc.page))
def build(kind,story):
    path=ROOT/'public/resources'/f'{lab_id}-{kind}.pdf'
    SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=42,rightMargin=42,topMargin=40,bottomMargin=45).build(story,onFirstPage=footer,onLaterPages=footer)
    return path
def grid(rows,widths):
    t=Table([[p(cell,'Small') for cell in row] for row in rows],colWidths=widths,repeatRows=1)
    t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.5,colors.HexColor('#b2c1a9')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2e7')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
def reference_diagram():
    diagram=c.get('resourceDiagram')
    if not diagram:return []
    if diagram['kind']=='reserve-map':
        drawing=Drawing(528,185)
        shades={'F':'#98b28a','M':'#c6ce9a','W':'#94b6ae'}
        for slot,label in enumerate(['Plan A planning copy','Plan B planning copy']):
            drawing.add(String(132+slot*264,178,label,textAnchor='middle',fontName='LabBold',fontSize=9))
            for n,kind in enumerate(c['land']):
                row,col=divmod(n,6);x,y=54+slot*264+col*26,141-row*26
                drawing.add(Rect(x,y,25,25,fillColor=colors.HexColor(shades[kind]),strokeColor=colors.HexColor('#657b64'),strokeWidth=.6))
                drawing.add(String(x+3,y+16,chr(65+row)+str(col+1),fontName='LabFont',fontSize=7.5))
                drawing.add(String(x+12.5,y+3,kind,textAnchor='middle',fontName='LabBold',fontSize=10))
        return [p('Fictional reserve planning map','Heading2'),drawing,p('F woodland; M meadow; W wetland. Each100m-side cell is1ha and1credit. Optional paper planning copies: mark12selected cells per plan. Protection status does not change habitat type.','Small')]
    if diagram['kind']!='contact-network':raise ValueError('Unsupported resource diagram')
    drawing=Drawing(360,252)
    positions=diagram['positions']
    for edge in diagram['contacts']:
        a,b=[positions[k] for k in edge]
        drawing.add(Line(a['x']*.6,(420-a['y'])*.6,b['x']*.6,(420-b['y'])*.6,strokeColor=colors.HexColor('#7e967c'),strokeWidth=2))
        drawing.add(String((a['x']+b['x'])*.3,(840-a['y']-b['y'])*.3,edge,fontName='LabBold',fontSize=10,fillColor=colors.HexColor('#315941')))
    for key,position in positions.items():
        x,y=position['x']*.6,(420-position['y'])*.6
        drawing.add(Circle(x,y,17,fillColor=colors.HexColor('#e3ebdb'),strokeColor=colors.HexColor('#6a866e')))
        drawing.add(String(x,y-4,key,textAnchor='middle',fontName='LabBold',fontSize=12,fillColor=colors.HexColor('#315941')))
    return [p('Provided contact map (use for planning)','Heading2'),drawing,p('Only the shown contacts are possible in the model. A starts infectious. No spread is shown in this reference diagram.','Small')]

student=[p(c['title'],'Title'),p('Student worksheet | Virtual only'),p('Name (optional): ______________________   Class / period: ______________'),p(c['question'],'Heading2'),p(c['intro']),*([p('Use the provided '+('contact map' if c['resourceDiagram']['kind']=='contact-network' else 'reserve map')+' on the following page when making your prediction.')] if c.get('resourceDiagram') else []),p('Predict and design before setup','Heading2'),p(c['prediction']),*lines(),p(c['design']),*lines(),p(c['sampling']),PageBreak(),p('Record different lines of evidence','Heading1')]
student+=reference_diagram()
if c.get('pollinationCheck'):
    checkpoint=c['pollinationCheck']
    student+=[p('Pollen-transfer checkpoint','Heading2'),p(checkpoint['prompt'])]+[p('O  '+label,'Choice') for _,label in checkpoint['choices']]+[Spacer(1,8)]
assays=c.get('assays',[])
if assays:student+=[p('Record your actual unknown observation and the claim supported by its comparison with the supplied positive and negative controls. Keep each portion separate.'),grid([['Target / indicator','Observed unknown appearance','Claim from this test']]+[[a['label']+' / '+a['reagent'],'',''] for a in assays],[170,210,148]),Spacer(1,12)]
if c.get('resourceTable'):
    student+=[p(c['resourceTable']['intro'])]
    for t in c['resourceTable']['tables']:student+=[grid([t['columns']]+t['rows'],[528/len(t['columns'])]*len(t['columns'])),Spacer(1,12)]
for q in c['explanations']:student+=[KeepTogether([p(q['prompt']),*lines()])]
resource_checks=([c['pollinationCheck']] if c.get('pollinationCheck') else [])+c['checks']
student+=[PageBreak(),p('Concept checks and limits','Heading1')]
for q in c['checks']:student+=[p(q['prompt'],'Heading2')]+[p('O  '+label,'Choice') for _,label in q['choices']]
student+=[p('Model limits','Heading2'),p(c['limits']),p('Keep your work','Heading2'),p('Download your recorded PDF lab report or print it. It includes your actual work; this blank worksheet does not replace it. Completion confirms saving on this device, not a grade or submission.'),p('Sources','Heading2')]+[p(x['title']+' - '+x['url'],'Source') for x in c['sources']]
teacher=[p(c['title'],'Title'),p('Teacher guide | Virtual only'),p(c['question'],'Heading2'),p(c['teacher']['purpose']),p('Goals and evidence','Heading2')]+[p(g['text']+' '+c['explanations'][i]['prompt']) for i,g in enumerate(c['goals'])]+[p('Workload and mode','Heading2'),p(c['teacher']['rationale']),p(c['teacher']['mode']),p('Interpretation and assessment','Heading2'),p(c['teacher']['guidance'])]
if assays:
    teacher+=[p('Supplied controls and test boundaries','Heading2'),p('Negative controls are model-prepared water blanks. Positive controls contain the named target. Benedict’s controls are heated; stained-paper controls are rinsed and dried. These are provided reference results, not independent student measurements.')]
    for a in assays:teacher+=[p(a['label']+' - '+a['reagent'],'Heading2'),p('Positive control: '+a['control']+'. Positive appearance: '+a['positive']+'. Negative appearance: '+a['negative']+'.'),p(a['definition']),p(a['mechanism'])]
for i,q in enumerate(resource_checks):teacher+=[KeepTogether(([p('Concept checks','Heading2')] if i==0 else [])+[p(q['prompt']),p('Correct: '+next(label for key,label in q['choices'] if key==q['correct'])+' '+q['feedback'])])]
teacher+=[p('Model limits','Heading2'),p(c['limits']),p('Reports, access and later physical work','Heading2'),p('Guests can access this free lab and download the completed PDF lab report or use native print. Optional name and period, the first prediction, actual current selections, corrected evidence, and original explanations are preserved. Unconfirmed entries stay labeled. No automatic grade or authenticated submission is implied. English is available; native language switching and reviewed Spanish print materials remain future work.'),p(c['teacher']['extension']),p('Sources','Heading2')]+[p(x['title']+' - '+x['url'],'Source') for x in c['sources']]
paths=[build('worksheet',student),build('teacher-guide',teacher)]
ip=ROOT/'ASSET_INVENTORY.json';inventory=json.loads(ip.read_text(encoding='utf-8-sig'))
for path in paths:
    raw=path.read_bytes();rel=path.relative_to(ROOT).as_posix();inventory=[x for x in inventory if x['path']!=rel]+[{'path':rel,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}]
ip.write_text(json.dumps(sorted(inventory,key=lambda x:x['path']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Generated '+lab_id+' worksheet and teacher guide from current content; updated their asset hashes.')
