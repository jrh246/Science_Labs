"""Build original, printable worksheet/guide PDFs from shared lab content.
Run: node --input-type=module -e "import {investigations} from './src/investigations/content.js'; console.log(JSON.stringify(investigations))" > tmp/pdfs/content.json
Then: python scripts/build-resources.py
"""
import json, re, sys, runpy
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
 if len(sys.argv)>1 and c["id"]!=sys.argv[1]:continue
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
 if c['kind']=='leaf':
  story += [PageBreak()]+title(c,'Student worksheet / preparation and exploration')+[
   heading('What is infiltration?'),para('Infiltration is the movement of liquid into spaces within a material. When those spaces contain trapped air, reducing the pressure can help remove the air so liquid can take its place.'),
   para('Place a porous material in liquid inside a needle-free syringe. Gently expel excess air, cover the tip, and pull back the plunger to lower the pressure. Trapped gas can expand and escape. Uncover the tip and gently release the vacuum; liquid can enter the spaces as normal pressure returns. Repeated cycles may be needed. Before testing, predict how this preparation might affect your sample.'),
   heading('Run a controlled comparison'),para('In Collect observations, prepare the disks using Pull plunger and Release vacuum three times. Keep the assigned lamp setting: off (0%), low (25%), or high (100%). Start the timer and watch the lamp and disks. Use Pause, change timer speed, or advance two minutes. Record every two simulated minutes through 20 minutes. Use fresh disks for each independent trial.'),
   heading('Then experiment freely'),para('Change the lamp during a run, or choose any intensity from 0 to 100%. After 20 minutes, resume to observe up to 120 minutes. Try high light, darkness, then high light again. Turning off the lamp does not pause time. Predict the effect of a change before testing it. Changed-light or incompletely infiltrated trials are labeled exploratory and excluded from comparison means. Download data before restarting a trial.'),
   para('My change (setting and simulated time):'),lines(2),para('What happened immediately? What happened later? Compare your observations with your prediction and propose an explanation.'),lines(3),
   para('CSV and text reports include exploratory observations and lamp-change history. Model rates are illustrative, not predictions for real leaves.','SmallLab')]
 if '--guide-only' not in sys.argv:build(c,'worksheet',story)
 guide=title(c,'Teacher guide')+[heading('Learning targets and timing'),para(c['question']),para(c['overview']),para('Suggested sequence: 8-10 min prediction and setup; 20-30 min observation; 12-20 min analysis. Virtual time can be accelerated. For photosynthesis and yeast, pool independent replicates from class groups; three sequential repeats need extra class time.'),heading('Route choices and sharing'),para('The photosynthesis student page opens as a standard virtual investigation. Teacher customization is deferred to a future teacher workspace. Use this worksheet to assign classroom components separately; discuss data-source differences when comparing results. Existing hybrid links still work, but the student page no longer creates them.' if c['id']=='light-photosynthesis' else 'In Teacher setup, select Virtual or Classroom for each treatment/field and create an assignment link. Assign all virtual for absences or a substitute. For a hybrid route, conduct one part in class and simulate the others; compare data-source limitations before pooling. These links are editable and do not restrict access.'),heading('Materials'),*[para('- '+x) for x in c['materials']],heading('Classroom procedure'),*[para(f'{i+1}. {x}','SmallLab') for i,x in enumerate(c['procedure'])],para('Safety: '+c['safety'],'SmallLab'),PageBreak()]+title(c,'Teacher guide / interpretation')+[heading('Expected reasoning and troubleshooting'),*[para(x,'SmallLab') for x in c['teacherNotes']],heading('Model boundaries'),para(c['model'],'SmallLab'),para(c['interpretation'],'SmallLab'),heading('Suggested assessment - 12 points'),table([['Dimension','Evidence to look for','Points'],['Design','Reasoned prediction; variables, controls or sampling plan','0-3'],['Data','Complete observations, correct units, source labels, repeats','0-3'],['Analysis','Appropriate calculations and comparisons supported by data','0-3'],['Explanation','Biological reasoning, uncertainty, and a feasible improvement','0-3']],[88,367,49]),para('For each dimension: 0 = absent; 1 = partial or major errors; 2 = mostly sound with a minor omission; 3 = complete and well supported. Suggested teacher rubric only; the app does not assign a grade.','SmallLab'),heading('Downloads, access, and classroom pilot'),para('Student worksheet: three investigation pages, plus companion cutouts where included. Teacher guide: procedures, interpretation, and rubric. Reports and CSV data download from Analyze & explain. Teacher guides are public resources, not protected answer keys. Before classroom use, pilot the equipment, timing, and reading level. Editable Word and fillable PDF versions are planned.','SmallLab'),heading('Reading and method connections')]
 for name,url in c['sources']:
  guide += [Paragraph(escape(clean(name))+': <link href="'+escape(url)+'" color="#245448">Open source</link>',styles['SmallLab'])]
 guide += [para('The investigation materials are original; appended cutouts were supplied by the classroom teacher. Simulated observations are not measurements from the linked sources.','SmallLab')]
 if c['kind']=='leaf':
  guide += [PageBreak()]+title(c,'Teacher guide / interactive lamp investigation')+[
   heading('Teach the preparation before interpreting flotation'),para('Infiltration removes trapped air and replaces it with solution. Without this baseline, floating disks do not establish oxygen production. Demonstrate a needle-free syringe: expel excess air, cover the tip, gently pull the plunger, then uncover and release the vacuum. Repeat only as needed; avoid damaging leaf tissue. The simulation uses three preparation cycles as a teaching simplification.'),
   heading('Use controlled trials and exploratory trials'),para('Each virtual trial starts with its assigned lamp level. Off, Low, High, and the 0-100% slider remain available throughout the run. The clock runs at 30x, 60x, or 120x speed; students can pause or advance time. It pauses at 20 minutes, then can resume to 120 minutes. Fresh disks / restart trial replaces only that selected trial after confirmation.'),
   para('A fully infiltrated run held at its assigned intensity contributes its first 20 minutes to the treatment comparison. Any time advanced with incomplete infiltration or a different intensity labels the entire run exploratory and excludes it from those means. Exploratory data and setting changes remain in CSV and text reports. Turning the lamp away from the target and back while paused does not affect gas or disqualify a trial unless time advances under the changed setting.'),
   heading('Suggested extension'),para('Ask students to predict the effects of switching from high light to darkness and back. Gas remaining in the disks creates a delayed flotation response. Respiration and gas loss continue in darkness. Have students distinguish an immediate change in light from the later change in disk buoyancy.'),
   heading('Assessment and limits'),para('Assess explanations of infiltration, timing, source labels, and controlled versus changed settings. Do not require real leaves to match model times. Temperature, bicarbonate, leaf health, and physical disturbance are not adjustable in this version. Switching trials, navigating away, or reloading pauses the clock; there is no background time simulation.')]
 build(c,'teacher-guide',guide)
 runpy.run_path(str(ROOT/'scripts/cutout-resources.py'))['append_cutouts'](c['id'],'--guide-only' in sys.argv)
