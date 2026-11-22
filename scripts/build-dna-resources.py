"""Generate the concise extraction-v3 worksheet and teacher guide."""
from pathlib import Path
from xml.sax.saxutils import escape
import json
import subprocess
import shutil
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/resources'
COPY=ROOT/'output/pdf'
COPY.mkdir(parents=True,exist_ok=True)
shared=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {extendedById} from './src/investigations/extended-content.js'; import {explanationQuestions} from './src/investigations/extraction-report.js';import {checkpoints} from './src/investigations/extraction-model.js';console.log(JSON.stringify({lab:extendedById['dna-replication'],explanationQuestions,checkpoints}));"],cwd=ROOT,encoding='utf-8'))
lab=shared['lab']
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleDNA',fontName='Times-Roman',fontSize=27,leading=31,textColor=colors.HexColor('#285746'),spaceAfter=14))
styles.add(ParagraphStyle(name='SectionDNA',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=colors.HexColor('#285746'),spaceBefore=11,spaceAfter=7))
styles.add(ParagraphStyle(name='BodyDNA',fontSize=9.5,leading=13,spaceAfter=7))
styles.add(ParagraphStyle(name='SmallDNA',fontSize=8,leading=11,spaceAfter=8,textColor=colors.HexColor('#607269')))
def p(text,style='BodyDNA'):return Paragraph(escape(text),styles[style])
def h(text):return p(text,'SectionDNA')
def title(sub):return [p('SCIENCE LABS / CELL BIOLOGY / EXTRACTION V3','SmallDNA'),p(lab['title'],'TitleDNA'),p(sub,'SmallDNA')]
def lines(n):
    t=Table([['']]*n,colWidths=[504],rowHeights=[23]*n)
    t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#bac9bc'))]));return t
def table(rows,widths):
    t=Table([[p(x,'SmallDNA') for x in row] for row in rows],colWidths=widths,repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2e6')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#bac9bc')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]));return t
def footer(canvas,doc):
    canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#607269'))
    canvas.drawString(54,31,'Science Labs | Extraction v3 | Original classroom resource')
    canvas.drawRightString(558,31,str(doc.page))
def build(kind,story):
    path=OUT/f'dna-replication-{kind}.pdf'
    SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=44,bottomMargin=50,title=lab['title']+' - '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
    shutil.copyfile(path,COPY/path.name)
    print(path)

student=title('STUDENT WORKSHEET / 1. UNDERSTAND AND PREDICT')+[
 h('What do the words mean?'),
 p('Release: let existing DNA leave a cell or nucleus and enter the liquid. Separate: sort parts of a mixture using differences such as size or solubility. Filtrate: the liquid that passes through a filter.'),
 p('Precipitate: come out of solution as solid material. The solid that forms is also called a precipitate. Alcohol makes DNA less soluble; many molecules can collect into visible clumps, along with other substances.'),
 h('Why can detergent open a membrane?'),
 p('Cell membranes and the membranes around the nucleus contain a lipid bilayer: two layers of lipid molecules. Water-attracting heads face the liquid; water-avoiding tails face inward. To release DNA, these barriers must be opened.'),
 p('Detergent has water-interacting and lipid-interacting parts. It mixes with membrane lipids and pulls them out of the bilayer, disrupting the membrane. It does not need to cut the DNA. The rigid plant cell wall is a different structure, mainly made of cellulose.'),
 p('Mashing breaks up tissue and cell walls and can rupture some cell and nuclear membranes. Some DNA can be released without detergent. Detergent helps open more membranes; the comparison concerns recovery, not whether detergent creates DNA.'),
 p('Name: ________________________  Class: __________  Date: __________'),
 p(lab['question']),h('Predict before you begin'),
 p('How will leaving out detergent affect visible material, and why?'),lines(2),
 PageBreak()]+title('STUDENT WORKSHEET / 2. PREPARE AND OBSERVE')+[h('One preparation, two required checkpoints'),
 p('Move fruit into the bag; mash it; add water, salt and detergent; mix gently; filter; layer cold alcohol. Drag tools, or select a tool and then its target. For classroom work, use the teacher-approved procedure.'),
 p('In the virtual lab, answer each checkpoint correctly before continuing. The equipment pauses and the next tool instructions stay hidden until the checkpoint is passed. Use feedback to revise your reasoning.'),
 p(shared['checkpoints']['4']['question']),lines(1),
 p(shared['checkpoints']['8']['question']),lines(1),
 h('Compare after five minutes'),
 p('Inspect the complete sample and two matched controls. Mark the source V (virtual) or C (classroom). Score visibility: 0 none, 1 faint, 2 clear, 3 abundant. These are ordered categories, not DNA concentrations.'),
 table([['Sample','Source','Score','Describe what you see'],['Complete extraction','','',''],['No detergent control','','',''],['No fruit blank','','','']],[150,50,50,254]),
 p('The virtual controls are prepared by the simulation. In the no-detergent control, replace detergent with the same volume of water. Keep fruit mass, salt, alcohol, final liquid volume and observation time matched. The blank contains no fruit.','SmallDNA'),
 PageBreak()]+title('STUDENT WORKSHEET / 3. EXPLAIN WITH EVIDENCE')+[
 h('1. What does the comparison support?'),
 p(shared['explanationQuestions'][0]),p('What does the no-fruit blank test?'),lines(6),
 h('2. How far can the claim go?'),
 p(shared['explanationQuestions'][1]),lines(5),
 h('Transfer question / class discussion'),
 p('A group sees no strands. Does that mean its fruit contained no DNA? Give another explanation and a comparison that could test it.'),
 h('Keep your completed work'),p('At the end, use Download lab report (PDF) or Print lab report. The report includes your prediction, checkpoint responses, observations, sources and explanations. An unfinished report is labeled In progress. Name and class fields are optional.','SmallDNA'),
 p('Keep unexpected results. One sample per condition begins a comparison; pool independent classroom repeats to assess variability. Do not attribute differences between virtual and classroom samples to detergent alone. Appearance does not establish identity or purity, and visible strands are not individual double helices.','SmallDNA')]
build('worksheet',student)

teacher=title('TEACHER GUIDE / 1. PURPOSE AND PREPARATION')+[
 h('Learning evidence, not a successful tube'),
 p('Students connect membrane structure to extraction, track separation of a mixture, interpret two controls, and limit a claim to what their observations support. Producing white material alone is not evidence of understanding.'),
 h('Streamlined sequence'),
 p('1. Predict the effect of leaving out detergent. 2. Prepare one complete sample, answering required membrane and dissolved-DNA questions before the corresponding tool instructions appear. 3. Score and describe the three samples. 4. Write two short explanations. 5. Download the completed PDF report or print it. Use the transfer question as an exit discussion.'),
 p('The virtual controls are model-prepared. Students do not repeat nine preparations. Classroom mode accepts actual observations without requiring virtual preparation. Mouse, touch and pen dragging have a click/tap/keyboard alternative.'),
 h('Classroom materials and procedure'),p(lab['materials']),
 *[p(str(i+1)+'. '+x) for i,x in enumerate(lab['physical'])],
 p('Pilot this recipe with your fruit and detergent before class. Quantities illustrate a starting protocol; they are not a guarantee of yield. Distribute control preparations and independent repeats across groups when time is short.','SmallDNA'),
 PageBreak()]+title('TEACHER GUIDE / 2. INTERPRETATION AND ASSESSMENT')+[
 h('What an explanation should connect'),
 table([['Evidence / concept','Look for'],['Preparation','Mashing disrupts tissue and can rupture some cell and nuclear membranes. Detergent interacts with lipids and disrupts additional bilayers. DNA was already present.'],['Separation','Filtering removes large debris; dissolved molecules pass through. Alcohol promotes precipitation rather than creating DNA.'],['Controls','No detergent tests the effect of its inclusion under matched conditions. No fruit checks reagents and handling without tissue. Neither establishes DNA purity.'],['Limits','Visibility is ordinal. A crude extract can contain DNA, RNA, proteins and other components. More material need not mean more DNA. One sample cannot estimate variability.']],[125,379]),
 h('Feedback'),
 p('Ask students to identify the actual observations supporting their claim, connect them to a plausible mechanism, and name a specific limitation. Do not grade classroom observations by agreement with the model. A blank with material is a reason to investigate contamination or precipitation, not overwrite the result.'),
 p('In this illustrative model the complete sample scores 2 or 3, the no-detergent sample 1 (faint), and the blank 0. This represents partial release by mechanical disruption, not a measured yield. Earlier already-recorded attempts retain their old illustrations. Students record their own interpretations. Matching a model category is not proof of scientific understanding.'),
 h('Transfer and follow-up'),
 p('No visible strands can reflect incomplete release, low recovery, dilution, or precipitation conditions. Have students propose a matched comparison. Repeated physical samples strengthen evidence; specific identification would require additional analytical evidence.'),
 h('Sources and model limits'),
 p('University of Utah, extraction science and limitations: https://learn.genetics.utah.edu/content/labs/extraction/howto/','SmallDNA'),
 p('Smithsonian, mechanical disruption: https://invention.si.edu/activities/hands-on-activities/extract-dna-home','SmallDNA'),
 p('NHGRI, strawberry extraction: https://www.genome.gov/about-genomics/teaching-tools/strawberry-dna-extraction','SmallDNA'),
 p('The model is not experimentally calibrated and does not demonstrate replication, inheritance, sequence, or a double helix. PDF and print reports preserve recorded answers. PDF attachments and JSON exports retain stable response IDs and checkpoint response history for future assessment. Completion does not assign a grade. Existing earlier-version browser work remains downloadable.','SmallDNA')]
build('teacher-guide',teacher)
