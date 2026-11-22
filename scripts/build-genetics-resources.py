"""Build a virtual-only teacher guide from the current genetics model and report."""
from pathlib import Path
import json,subprocess
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[1]
query="import * as g from './src/investigations/genetics-model.js';import {geneticsReport} from './src/investigations/genetics-report.js';const report=geneticsReport(g.freshGenetics());console.log(JSON.stringify({title:g.title,phases:g.phases,coding:g.coding,template:g.template,rna:g.rna,codons:g.codons,checks:g.checks,explanationPrompts:g.explanationPrompts,limits:g.limits,schemaVersion:report.schemaVersion,activityVersion:report.activityVersion}));"
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',query],cwd=ROOT,encoding='utf-8'))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='LabTitle',fontName='Times-Roman',fontSize=26,leading=30,spaceAfter=12,textColor=colors.HexColor('#285746')))
styles.add(ParagraphStyle(name='LabHeading',fontName='Helvetica-Bold',fontSize=12,leading=16,spaceBefore=11,spaceAfter=7,keepWithNext=True,textColor=colors.HexColor('#285746')))
styles.add(ParagraphStyle(name='LabBody',fontSize=9.5,leading=13,spaceAfter=8))
styles.add(ParagraphStyle(name='LabSmall',fontSize=8,leading=11,spaceAfter=7))
def clean(text):return str(text).translate(str.maketrans({'′':"'",'’':"'",'–':'-','—':'-','→':' -> ','×':'x'}))
def p(text,style='LabBody'):return Paragraph(escape(clean(text)),styles[style])
def h(text):return p(text,'LabHeading')
def title(sub):return [p('SCIENCE LABS / GENETICS / VIRTUAL ONLY','LabSmall'),p(data['title'],'LabTitle'),p(sub,'LabSmall')]
def table(rows):
 t=Table([[p(cell,'LabSmall') for cell in row] for row in rows],colWidths=[115,389],repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2e6')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#bac9bc')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
def footer(canvas,doc):
 canvas.setFont('Helvetica',8);canvas.drawString(54,31,'Science Labs | Genetic information teacher guide | Resource v1');canvas.drawRightString(558,31,str(doc.page))

sequence_notes=[
 h('Current sequence and versions'),p('Coding DNA '+data['coding']+' gives mRNA '+data['rna']+'. Codons '+', '.join(data['codons'])+' give Met-Ala-Phe followed by stop. The last codon contributes no amino acid.','LabSmall'),
 p(f'Report schema {data["schemaVersion"]} and report activity revision {data["activityVersion"]} describe the exported evidence. Saved attempts use storage version 1 and the existing genetic-information:v1 key.','LabSmall'),
 h('Reading connections'),p('OpenStax Biology 2e, chapters 14 and 15','LabSmall'),p('https://openstax.org/books/biology-2e/pages/14-5-dna-replication-in-eukaryotes','LabSmall'),p('https://openstax.org/books/biology-2e/pages/15-3-eukaryotic-transcription','LabSmall'),p('https://openstax.org/books/biology-2e/pages/15-5-ribosomes-and-protein-synthesis','LabSmall')
]

story=title('Teacher guide / goals and facilitation')+[
 h('Learning evidence'),p('Students follow information from DNA to RNA to an amino-acid chain. Use their placements, checked responses, corrections, and written explanations to judge their reasoning. The activity takes place in a model cell with a nucleus.'),
 h('Plan the lesson'),p('Ask students to predict how a gene in the nucleus can lead to a protein. They record the prediction before entering the processes. Students can work individually or discuss in pairs. Each student should keep a report of their own explanations.'),
 table([['Process','What students do and what it shows'],
 ['Replication','Place helicase at the DNA fork and DNA polymerase at a supplied primer. Build a short complementary section on both templates. Each daughter DNA molecule keeps an original strand and a new strand.'],
 ['Transcription','Choose the nucleus and place RNA polymerase at the promoter. Build the first RNA codon, then run the supplied extension. RNA uses U when pairing with A.'],
 ['RNA processing','Place the cap-making machinery, spliceosome, and tail-making machinery at the RNA sites. Remove the intron, join the exons, and move mature mRNA through the nuclear pore.'],
 ['Translation','Move mRNA into the ribosome. Choose tRNAs using the current codon and anticodon. Add Met, Ala, and Phe. Use the release factor at UAA to release the peptide.'],
 ['Explanation','Check whether DNA replication is needed for each transcription. Explain where the processes happen and what each makes.']]),
 h('Workload and access'),p('Students practice short sections with different pairing rules and locations. The model supplies longer extension, primers, and helper machinery. A component can be dragged or selected and placed. Tab and Enter support keyboard placement. Reduced motion retains the resulting structures.'),
 *sequence_notes,PageBreak()]+title('Teacher guide / interpretation and completed reports')+[
 h('Checked concepts')]
for check in data['checks'].values():
 story += [p(check['prompt']),p('Correct response - '+check['choices'][check['correct']],'LabSmall'),p(check['feedback'],'LabSmall')]
story += [h('Written explanation prompts')]
for prompt in data['explanationPrompts']:story += [p(prompt)]
story += [h('Evidence to look for'),p('The student connects the enzyme with its work site, uses DNA and RNA base-pair rules, traces mRNA through the pore, and uses codons to explain the peptide order and stop. A corrected answer is evidence of revision after feedback. Review the written explanation alongside the recorded work.'),
 h('Keep the completed report'),p('Students may add a name and class or period. After the required work and both explanations, Save completed explanation confirms whether the work was saved. Download lab report (PDF) or Print lab report keeps the actual prediction, results, concept checks, evidence, and writing. The filename includes a supplied name. The export time includes local time and time zone. An early export is labeled In progress.'),
 p('The report is made on the device and works offline after caching. JSON and the PDF attachment retain detailed responses and corrections for future assessment. Review written reasoning before assigning a grade.','LabSmall'),
 h('Model boundaries'),p(data['limits'],'LabSmall'),
]
path=ROOT/'public/resources/genetic-information-teacher-guide.pdf'
SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=44,bottomMargin=54,title=data['title']+' - teacher guide',author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
print(path.name)
