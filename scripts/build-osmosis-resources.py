"""Build source-labeled osmosis resources from the live configuration and prompts."""
from pathlib import Path
import json,subprocess
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {labConfig} from './src/data/labConfig.js';import * as learning from './src/data/osmosis-learning.js';console.log(JSON.stringify({config:labConfig,...learning}));"],cwd=ROOT,encoding='utf-8'))
c=data['config'];out=ROOT/'public/resources'
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='LabTitle',fontSize=23,leading=28,spaceAfter=16,textColor=colors.HexColor('#255749')))
styles.add(ParagraphStyle(name='LabBody',fontSize=10,leading=14,spaceAfter=10))
styles.add(ParagraphStyle(name='LabHeading',fontSize=13,leading=17,spaceBefore=12,spaceAfter=8,keepWithNext=True,textColor=colors.HexColor('#255749')))
def p(s,style='LabBody'):return Paragraph(escape(str(s)),styles[style])
def h(s):return p(s,'LabHeading')
def title(sub):return [p('Osmosis and Cell Homeostasis','LabTitle'),p(sub)]
def lines(n):
 t=Table([['']]*n,colWidths=[504],rowHeights=[22]*n);t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#b2c5b7'))]));return t
def table(rows,widths):
 t=Table([[p(x) for x in row] for row in rows],colWidths=widths,repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7efe1')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#b2c5b7')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));return t
def footer(canvas,doc):
 canvas.setFont('Helvetica',8);canvas.drawString(54,31,'Science Labs | Osmosis resource v2 | Supplied-data model');canvas.drawRightString(558,31,str(doc.page))
def build(kind,story):
 path=out/f'osmosis-homeostasis-{kind}.pdf'
 SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=46,bottomMargin=56,title='Osmosis and Cell Homeostasis - '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
 print(path.name)
student=title('Student worksheet / predict before testing')+[
 p('Name _____________________  Period ______  Date __________'),h('Investigate water movement'),
 p('Dialysis tubing models a cell membrane. Water can cross it. Sugar stays on its side in this model. Osmosis is net water movement across a membrane. Net means the overall change after water moves both ways.'),
 p('Sugar concentration is shown as % w/v. This means grams of sugar per 100 mL of solution. The model treats added sugar as having no effect on the stated volume.'),
 table([['Tube','Inside sugar','Outside sugar']]+[[t['id'],str(t['sugarPercent'])+'%',str(b['sugarPercent'])+'%'] for t,b in zip(c['tubes'],c['beakers'])],[80,212,212]),
 h('Prediction required before beginning'),p(data['predictionPrompt']),lines(5),PageBreak()]
student+=title('Student worksheet / measurements')+[
 h('Prepare and measure'),p('Prepare the five solutions. Zero the balance with the empty dish before weighing sugar. Record each tube\'s initial mass. Place each tube in its matching beaker. Advance the model by 24 hours. Weigh each tube again.'),
 p('Mass change = final mass minus initial mass. Keep a minus sign for a loss. Include grams (g).'),
 table([['Tube','Initial mass (g)','Final mass (g)','Change (g)']]+[[t['id'],'','',''] for t in c['tubes']],[50,151,151,152]),
 h('Data source'),p(data['osmosisModelNote']),p('Label these observations supplied-data model. Keep classroom measurements separately labeled.'),h('Observation notes'),lines(5),PageBreak()]
student+=title('Student worksheet / explain your evidence')
for q in data['reasoningQuestions']:student += [h(q['goal']),p(q['prompt']),lines(4)]
student += [p('Save your completed explanation in the app. Use Download lab report (PDF) or Print lab report to keep your writing and measurements.'),p('Reading source - OpenStax Biology 2e, Passive Transport'),p(data['osmosisSource'])]
build('worksheet',student)
teacher=title('Teacher guide / learning and evidence')+[
 h('Learning targets'),p('Students connect inside/outside sugar concentrations, net water movement, and signed mass change. Require a prediction before testing and all three written explanations after results. Predictions can be wrong. Assess the explanation using the actual recorded values.'),
 h('Keep the five conditions'),p('A compares 0% inside with 0% outside. D compares 10% with 10%. Both are equal-concentration conditions, called isotonic. B and C favor net water entry. E favors net water loss. Water still moves both ways in isotonic conditions. Small supplied mass changes need not be exactly zero.'),
 h('Provenance and worksheet correction'),p('The app identifies its masses as teacher-supplied experimental data and adds small measurement variation. They are not calculated osmotic predictions. The teacher confirmed that the latest lab corrections already resolved the concentration wording and accepted the current A/D conditions. This worksheet follows that accepted configuration.'),
 h('Assessment'),p('Check whether students cite concentrations and measured mass changes, retain the sign, infer net movement, explain two-way water movement, and identify a limit of the tubing/supplied-data model. Written reasoning is retained for teacher review. The app checks subtraction and required work, then generates a completed lab report as a PDF, a print view, and structured responses.'),
 h('Earlier attempts'),p('Earlier saved masses remain unchanged. A prediction entered after results is labeled with its actual timing. Students without an earlier prediction can explain their existing results without a fabricated prediction record.'),
 h('Source and physical classroom use'),p('A physical investigation requires the teacher to check the actual membrane properties, solute, concentration preparation, timing, drying/weighing method, and equipment. Keep its observations and units separate from the supplied-data model.'),p(data['osmosisSource'])]
build('teacher-guide',teacher)
