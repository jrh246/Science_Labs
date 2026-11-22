"""Generate Seed Germination handouts from the same English content as the lab."""
from pathlib import Path
import json, subprocess, hashlib
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
ROOT=Path(__file__).resolve().parents[1]
c=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {seedContent} from './src/investigations/seed-content.js';console.log(JSON.stringify(seedContent))"],cwd=ROOT,encoding='utf-8'))
styles=getSampleStyleSheet()
styles['Normal'].fontSize=10
styles['Normal'].leading=15
styles['Normal'].spaceAfter=9
styles['Heading1'].textColor=colors.HexColor('#24563d')
styles['Heading2'].textColor=colors.HexColor('#24563d')
def p(text,style='Normal'):return Paragraph(escape(text).replace('\n','<br/>'),styles[style])
def lines(n=2):return [p('_'*88) for _ in range(n)]
def footer(canvas,doc):
    canvas.saveState();canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#52654d'))
    canvas.drawString(42,25,'Science Labs | Virtual only | English | Seed Germination v1')
    canvas.drawRightString(570,25,str(doc.page));canvas.restoreState()
def build(kind,story):
    path=ROOT/'public/resources'/f'seed-germination-{kind}.pdf'
    SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=42,rightMargin=42,topMargin=40,bottomMargin=45).build(story,onFirstPage=footer,onLaterPages=footer)
    return path
work=[p('SEED GERMINATION','Title'),p('Student worksheet | Virtual only'),p('Name (optional): _______________________   Class / period: ______________'),p(c['question'],'Heading2'),p(c['intro']),p(c['sharedConditions']),p('Before you begin','Heading2'),p(c['prediction']),*lines(),p(c['design']),*lines(),p('Choose the two conditions: Dish A ___ mL; Dish B ___ mL. Use one 0 mL dry control and one 5 mL damp dish.'),p(c['sampleNote']),PageBreak(),p('Observe and explain','Heading1'),p('Select seeds with visible roots. Swelling alone does not count. Observe the same seeds on days 2 and 5. Percent germinated = seeds with roots / 10 x 100.')]
table=Table([['Dish','Water (mL)','Day 2 roots / 10','Day 5 roots / 10','Day 5 (%)'],['A','','','',''],['B','','','','']],colWidths=[45,90,130,130,133],rowHeights=[30,32,32])
table.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.5,colors.HexColor('#a7b8a2')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2e7')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('FONTSIZE',(0,0),(-1,-1),9)]))
work+=[table,Spacer(1,14)]
for q in c['explanations']:work+=[p(q['prompt']),*lines(2)]
work+=[PageBreak(),p('Check your concepts','Heading1')]
for q in c['checks']:
    work+=[p(q['prompt'],'Heading2')]+[p('O  '+label) for _,label in q['choices']]
work+=[p('Model limits','Heading2'),p(c['limits']),p('Keep your work','Heading2'),p('The lab can download a completed PDF report or print your recorded work. The report includes your actual answers and observations. A blank worksheet does not replace that report. Save completion only confirms a successful save on this device; it does not grade or submit your work.'),p('Sources','Heading2')]+[p(x['title']+' - '+x['url']) for x in c['sources']]
teacher=[p('SEED GERMINATION','Title'),p('Teacher guide | Virtual only'),p(c['question'],'Heading2'),p(c['teacher']['purpose']),p('Goals and evidence','Heading2')]
for goal in c['goals']:teacher+=[p(goal['text']+' '+goal['evidence'])]
teacher+=[p('Design choices','Heading2'),p(c['teacher']['rationale']),p(c['sharedConditions']),p(c['teacher']['mode']),p('Feedback and assessment','Heading2'),p(c['teacher']['guidance'])]
for q in c['checks']:teacher+=[p(q['prompt']),p('Correct: '+next(label for key,label in q['choices'] if key==q['correct'])+' '+q['feedback'])]
teacher+=[PageBreak(),p('Interpretation and boundaries','Heading1'),p(c['limits']),p('The model produces 2-4 roots by day 2 and 7-9 by day 5 in the damp dish. The dry dish has no emerged roots during the modeled interval. These are synthetic teaching values, not measured seed probabilities or a guarantee for a physical batch. Positions and displayed answer order are stable within each attempt. Students must classify the seeds; the model does not enter observations for them.'),p('Written explanations for review','Heading2')]
for q in c['explanations']:teacher+=[p(q['prompt'])]
teacher+=[p('Expected reasoning: compare both observed conditions with numbers; identify added water as the changed factor; explain matched conditions and the dry comparison; avoid treating ten seeds or two days as independent dishes. Require new independently prepared dishes when repeatability is the question.'),p('Reports and access','Heading2'),p('Guests can use this free lab, share its public link, and download their completed PDF report or use native print. Optional name and period appear in the report. Saved completion is not a grade or authenticated submission. Corrected selections remain distinguishable from correct first checks. The app and print resources currently support English; translated delivery remains future work.'),p('Future physical extension','Heading2'),p(c['teacher']['extension']),p('Sources checked during development','Heading2')]+[p(x['title']+' - '+x['url']) for x in c['sources']]
paths=[build('worksheet',work),build('teacher-guide',teacher)]
inventory_path=ROOT/'ASSET_INVENTORY.json'
inventory=json.loads(inventory_path.read_text(encoding='utf-8-sig'))
for path in paths:
    content=path.read_bytes();rel=path.relative_to(ROOT).as_posix()
    inventory=[x for x in inventory if x['path']!=rel]+[{'path':rel,'sha256':hashlib.sha256(content).hexdigest(),'bytes':len(content)}]
inventory_path.write_text(json.dumps(sorted(inventory,key=lambda x:x['path']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Generated Seed Germination worksheet and teacher guide; refreshed their asset hashes.')
