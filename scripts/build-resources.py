"""Build original, printable worksheet/guide PDFs from shared lab content.
Run: node --input-type=module -e "import {investigations} from './src/investigations/content.js'; console.log(JSON.stringify(investigations))" > tmp/pdfs/content.json
Then: python scripts/build-resources.py
"""
import json, re
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'tmp/pdfs/content.json').read_text(encoding='utf-8-sig'))
OUT=ROOT/'public/resources';OUT.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleLab',fontName='Helvetica-Bold',fontSize=22,leading=26,textColor=colors.HexColor('#234e43'),spaceAfter=14))
styles.add(ParagraphStyle(name='SectionLab',fontName='Helvetica-Bold',fontSize=13,leading=17,textColor=colors.HexColor('#234e43'),spaceBefore=12,spaceAfter=9))
styles.add(ParagraphStyle(name='BodyLab',fontName='Helvetica',fontSize=10,leading=14,spaceAfter=8))
styles.add(ParagraphStyle(name='SmallLab',fontName='Helvetica',fontSize=8,leading=11,spaceAfter=7))
styles.add(ParagraphStyle(name='CellLab',fontName='Helvetica',fontSize=8,leading=10))
def clean(s):
 return str(s).translate(str.maketrans({'–':'-','—':'-','’':"'",'‘':"'",'“':'"','”':'"','→':'->','₂':'2','×':'x','−':'-','°':' deg '}))
def para(s,style='BodyLab'):return Paragraph(escape(clean(s)),styles[style])
def heading(s):return para(s,'SectionLab')
def lines(n=3):
 t=Table([[''] for _ in range(n)],colWidths=[504],rowHeights=[19]*n)
 t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#b8c5bb'))]))
 return t
def table(rows,widths=None,row_height=None):
 t=Table([[para(x,'CellLab') for x in row] for row in rows],colWidths=widths,repeatRows=1,rowHeights=row_height)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8efe0')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#b8c5bb')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
 return t
def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#bdcbbd'));canvas.line(54,43,558,43)
 canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#50665b'))
 canvas.drawString(54,30,'Science Labs | Resource v1 | Development classroom pilot')
 canvas.drawRightString(558,30,f'{doc.page}')
def title(c,kind):return [para(c['title'],'TitleLab'),para(f'{kind} | Biology 2e, Chapter {c["chapter"]} | {c["duration"]}','SmallLab')]
def build(c,kind,story):
 file=OUT/f'{c["id"]}-{kind}.pdf'
 SimpleDocTemplate(str(file),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=46,bottomMargin=58,title=c['title']+' - '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
 print(file.name)

for c in DATA.values():
 story=title(c,'Student worksheet')
 story += [para('Name: __________________________  Class: __________  Date: __________'),heading('1. Predict and plan'),para(c['question']),para(c['overview']),para('Prediction and scientific reasoning:'),lines(3),Spacer(1,12),para('Variables and controls, or sampling plan:'),lines(3),Spacer(1,12),para('Keep consistent: '+c['constants']),heading('Select your route'),table([['Part','Virtual / Classroom','Equipment or conditions']]+[[x['label'],'',''] for x in c['conditions']],[136,130,238]),para('Use the same questions for either route. Always label the source of each dataset.','SmallLab'),PageBreak()]
 story+=title(c,'Student worksheet / observations')
 story += [heading('2. Collect observations')]
 if c['kind']=='mitosis':
  story += [para('Record a tally for two non-overlapping fields. The virtual fields contain 20 cells each; your classroom counts may differ. Group prometaphase with prophase.'),table([['Stage','Field A','Field B','Total','Percent','Est. hours']]+[[x,'','','','',''] for x in ['Interphase','Prophase','Metaphase','Anaphase','Telophase']]+[['Total','','','','100%','']],[115,70,70,70,80,99]),Spacer(1,16),para('Field A data source: __________________  Field B data source: __________________'),para('Assumed cycle duration: __________ hours. State why this is an assumption:'),lines(2),heading('Recognition notes'),para('Describe chromosome features used to classify two cells; record exclusions and uncertain cases.'),lines(5)]
 else:
  ts=list(range(0,c['end']+1,c['interval']))
  story += [para('Record '+c['yLabel'].lower()+'. Repeat each treatment with fresh material for three independent trials.'),table([['Treatment / trial']+[str(t)+' min' for t in ts]]+[[x['label']+' / '+str(t)]+['']*len(ts) for x in c['conditions'] for t in [1,2,3]],[112]+[392/len(ts)]*len(ts)),Spacer(1,16),para('Source (virtual/classroom) for each treatment: __________________________________'),heading('Trial summaries'),table([['Treatment','Trial 1','Trial 2','Trial 3','Mean']]+[[x['label'],'','','',''] for x in c['conditions']],[160,86,86,86,86]),para('Metric: '+('ET50 in minutes. Use the first crossing of five disks; interpolate between readings. If not reached by 20 min, report that limit. Calculate a mean only when all three trials reach ET50.' if c['kind']=='leaf' else 'Average gas accumulation rate in mL/min = (volume at 30 min - volume at 0 min) / 30.'),'SmallLab'),heading('Observations and graph'),para('Graph time on the x-axis and the recorded measurement on the y-axis on separate graph paper, or use the app. Label treatments, units, and data sources. Record unusual observations below.'),lines(3)]
 story += [PageBreak()]+title(c,'Student worksheet / explanation')+[heading('3. Explain the evidence'),para(c['interpretation'])]
 for i,q in enumerate(c['questions']):story += [para(f'{i+1}. {q}'),lines(3),Spacer(1,12)]
 story += [para('Before sharing: check units, source labels, calculations, and evidence. The app saves on this device only; download or print your report.','SmallLab')]
 build(c,'worksheet',story)
 guide=title(c,'Teacher guide')+[heading('Learning targets and timing'),para(c['question']),para(c['overview']),para('Suggested sequence: 8-10 min prediction and setup; 20-30 min observation; 12-20 min analysis. Virtual time can be accelerated. For photosynthesis and yeast, pool independent replicates from class groups; three sequential repeats need extra class time.'),heading('Route choices and sharing'),para('In Teacher setup, select Virtual or Classroom for each treatment/field and create an assignment link. Assign all virtual for absences or a substitute. For a hybrid route, conduct one part in class and simulate the others; compare data-source limitations before pooling. These links are editable and do not restrict access.'),heading('Materials'),*[para('- '+x) for x in c['materials']],heading('Classroom procedure'),*[para(f'{i+1}. {x}','SmallLab') for i,x in enumerate(c['procedure'])],para('Safety: '+c['safety'],'SmallLab'),PageBreak()]+title(c,'Teacher guide / interpretation')+[heading('Expected reasoning and troubleshooting'),*[para(x,'SmallLab') for x in c['teacherNotes']],heading('Model boundaries'),para(c['model'],'SmallLab'),para(c['interpretation'],'SmallLab'),heading('Suggested assessment - 12 points'),table([['Dimension','Evidence to look for','Points'],['Design','Reasoned prediction; variables, controls or sampling plan','0-3'],['Data','Complete observations, correct units, source labels, repeats','0-3'],['Analysis','Appropriate calculations and comparisons supported by data','0-3'],['Explanation','Biological reasoning, uncertainty, and a feasible improvement','0-3']],[88,367,49]),para('For each dimension: 0 = absent; 1 = partial or major errors; 2 = mostly sound with a minor omission; 3 = complete and well supported. Suggested teacher rubric only; the app does not assign a grade.','SmallLab'),heading('Downloads, access, and classroom pilot'),para('Student worksheet: three printable pages. Teacher guide: procedures, interpretation, and rubric. Reports and CSV data download from Analyze & explain. Teacher guides are public resources, not protected answer keys. Before classroom use, pilot the equipment, timing, and reading level. Editable Word and fillable PDF versions are planned.','SmallLab'),heading('Reading and method connections')]
 for name,url in c['sources']:
  guide += [Paragraph(escape(clean(name))+': <link href="'+escape(url)+'" color="#245448">Open source</link>',styles['SmallLab'])]
 guide += [para('Text and diagrams in these labs are original teaching materials. Simulated observations are not measurements from the linked sources.','SmallLab')]
 build(c,'teacher-guide',guide)
