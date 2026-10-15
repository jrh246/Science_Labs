"""Build original worksheets and guides from the same definitions as the ten labs."""
import json, subprocess, shutil
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {extendedLabs,sordariaExtension} from './src/investigations/extended-content.js'; console.log(JSON.stringify([...extendedLabs,sordariaExtension]));"],cwd=ROOT,encoding='utf-8'))
OUT=ROOT/'public/resources'; OUT.mkdir(exist_ok=True)
COPY=ROOT/'output/pdf'; COPY.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='LabTitle',fontName='Helvetica-Bold',fontSize=22,leading=26,textColor=colors.HexColor('#255749'),spaceAfter=12))
styles.add(ParagraphStyle(name='LabBody',fontSize=10,leading=14,spaceAfter=9))
styles.add(ParagraphStyle(name='LabSmall',fontSize=8,leading=11,spaceAfter=6,wordWrap='CJK'))
styles.add(ParagraphStyle(name='LabHeading',fontName='Helvetica-Bold',fontSize=13,leading=17,spaceBefore=12,spaceAfter=8,textColor=colors.HexColor('#255749')))
def clean(s):return str(s).translate(str.maketrans({'×':'x','µ':'u','—':'-','–':'-','’':"'",'→':'->'}))
def p(s,style='LabBody'):return Paragraph(escape(clean(s)),styles[style])
def h(s):return p(s,'LabHeading')
def title(c,subtitle):return [p(c['title'],'LabTitle'),p('Biology 2e chapter '+str(c['chapter'])+' reading connection | '+subtitle,'LabSmall')]
def lines(n=3):
 t=Table([[''] for _ in range(n)],colWidths=[504],rowHeights=[22]*n)
 t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#a9bcb1'))]));return t
def table(rows,widths):
 t=Table([[p(x,'LabSmall') for x in row] for row in rows],colWidths=widths,repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7efe1')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#b2c5b7')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
def footer(can,doc):
 can.setFont('Helvetica',8);can.setFillColor(colors.HexColor('#526b5e'));can.drawString(54,32,'Science Labs | Original teaching resource | v1 | Classroom pilot');can.drawRightString(558,32,str(doc.page))
def build(c,kind,story):
 path=OUT/f"{c['id']}-{kind}.pdf"
 SimpleDocTemplate(str(path),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=46,bottomMargin=54,title=c['title']+' - '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
 shutil.copyfile(path,COPY/path.name)
 print(path.name)

EXPECT={
 'microscope':'Students should apply the objective-specific calibration and acknowledge sampling uncertainty. Look for evidence of cell walls in plant schematics and chloroplasts in the aquatic leaf. Onion bulb epidermis generally lacks visible chloroplasts. Do not grade real cells against simulated sizes.',
 'enzyme':'In the modeled 10-35 C comparison, warmer conditions increase initial gas collection rate. This limited range does not establish the temperature optimum or demonstrate denaturation. Check equal extract concentration and gas leaks before interpreting physical differences.',
 'plant':'Model treatment plants elongate more than carrier controls. Compare changes from baseline. The endpoint is a whole-plant response; it cannot identify a receptor or prove all steps of a signaling pathway.',
 'meiosis':'The no-exchange model yields ABC, ABC, abc and abc. An exchange between A and B yields ABC, Abc, aBC and abc; an exchange between B and C yields ABC, ABc, abC and abc (order varies with chosen chromatids). Each single exchange produces two parental and two recombinant chromatids. Recombination rearranges existing alleles; it does not create new ones. This controlled model does not estimate crossover frequency in organisms.',
 'asci':'4:4 is first-division segregation. 2:4:2 and 2:2:2:2 are second-division patterns. The simple distance estimate is half the second-division percentage because half the chromatids are recombinant in a single crossover. Multiple crossovers complicate interpretation.',
 'corn':'For the defined Pp x Pp model, expected phenotypes are 3 purple:1 yellow. Expected counts equal total x 0.75 and total x 0.25. Chi-square summarizes squared deviations divided by expected counts; do not infer a p-value without the distribution and its assumptions.',
 'flies':'Gray/long and dark/short are parental; gray/short and dark/long are recombinant for this stated cross. Recombination percent = recombinant offspring / total x 100. Male Drosophila are not suitable heterozygous parents for this crossover assay. Two-point data do not determine three-gene order.',
 'extraction':'The model complete extraction usually has more visible strands than its no-detergent control; the blank has none. Real precipitate is not pure DNA. Visibility scores are ordered categories, not concentrations; compare distributions and descriptions rather than treating scores as mass.',
 'expression':'The reporter-DNA condition develops fluorescence; no-DNA and translation-blocked conditions remain near background in this model. Reporter maturation delays visibility. This is not direct mRNA measurement, and fluorescent signal depends on more than transcription.',
 'regulation':'The no-plasmid nutrient plate supports growth; the no-plasmid antibiotic plate does not in this model. Reporter-bearing cells grow on both selective media but fluoresce with arabinose. Growth and induction are separate observations. The model starts with prepared cells, so it does not estimate transformation efficiency.',
 'gel':'Unknown bands are modeled at 3000, 1500 and 700 bp, matching reference A. Accept reasonable interpolated estimates. Distance is approximately linear in log10(size) over the useful range. A matching classroom pattern does not establish a real-world personal identity.'}
def virtual_instructions(c):
 kind=c['kind']
 if kind=='corn':return 'Select the assigned ear, then mark a 48-kernel sampling region before its colors are revealed. Use separate purple and yellow tally counters. Tapping a kernel only adds or removes a pencil mark; it does not tally automatically. Check the total and review your counts.'
 if kind=='flies':return 'Use the equipment tray to prepare the sorting pad. Select a fly to inspect it through the magnifier. Use the four manual tally counters and optional inspection marks; record both body and wing traits. Review your total before collection.'
 if kind=='meiosis':return 'Align the homologs. For each exchange model select one nonsister chromatid from each homolog, then the assigned cut position. Exchange matching end segments. Separate homologs, then place each sister chromatid in a gamete from its own cell. Record all four allele strings and tally parental and recombinant products.'
 if kind=='asci':return 'Prepare the microscope using its setup controls. Inspect and classify all complete ordered asci. Review the classifications; retain and explain any uncertain observations.'
 text='Select the indicated tool in the equipment tray, then select its target on the apparatus. Follow the preparation checklist and observe the changes.'
 if kind=='extraction':text+=' Mash fruit with three tool passes; the no-fruit blank skips mashing. Add the assigned mixture, filter, and layer alcohol.'
 if kind=='regulation':text+=' Complete three spreader passes before moving the closed plate to incubation. Observe growth and fluorescence separately.'
 if kind=='gel':text+=' Select the loading pipette and load each of the four labeled wells individually before connecting the positive lead.'
 return text

for c in DATA:
 labels=(['Parental gametes','Recombinant gametes'] if c['kind']=='meiosis' else c.get('categories')) or (['Largest band (bp)','Middle band (bp)','Smallest band (bp)'] if c['kind']=='gel' else ['Colonies','Fluorescence 0/1'] if c['kind']=='regulation' else [c['unit']])
 student=title(c,'Student worksheet / preparation')+[p('Name: _____________________  Class: __________  Date: __________'),h('Before predicting'),p(c['intro']),h('Investigation question'),p(c['question']),p('Prediction and reasoning:'),lines(3),p('Controls, independent variable, measurement and sampling plan:'),lines(3),h('How to use the virtual lab'),p(c['setup']),p(virtual_instructions(c)+' Review observations, then click Collect data and continue. Complete the assigned comparison before exploring.'),PageBreak()]
 student+=title(c,'Student worksheet / observations')+[p('Label every sample virtual or classroom. Keep independent replicates separate; retain unexpected results. Units: '+c['unit']),table([['Condition / sample','Repeat','Source']+labels]+[[cond,str(i),'']+['']*len(labels) for cond in c['conditions'] for i in range(1,c['repeats']+1)],[160,40,60]+[244/len(labels)]*len(labels)),h('Equipment and observations'),p('Record calibration, initial values, specimen selection, ambiguous observations or method changes. Use additional paper for larger classroom counts.'),lines(5),PageBreak()]
 student+=title(c,'Student worksheet / detailed record')
 if c['duration'] and c['kind']!='gel':
  times=list(range(0,c['duration']+1,c['interval']))
  student += [p('Copy this page for each trial. Treatment: __________________ Repeat: ____ Source: __________'),table([[c['timeUnit'],c['unit'],'Notes']]+[[str(t),'',''] for t in times],[80,150,274]),h('Graph your observations'),p('Label axes and units; keep each treatment and source identifiable. For repeated measurements, connect readings only from the same sample. For ordinal scores, explain the categories instead of treating the scale as concentration.'),lines(4)]
 else:
  student += [p('Sample / field: __________________ Source: __________'),table([['Item / band / cell','Measurement or classification','Reasoning / uncertainty']]+[['','',''] for _ in range(10)],[100,180,224]),p('For large counts, use tallies with a clear starting position so each specimen is counted once. For microscopy and gels, record calibration and measurement units.'),lines(3)]
 student += [PageBreak()]+title(c,'Student worksheet / interpretation')
 for q in c['analysis']:student += [p(q),lines(3),Spacer(1,8)]
 student += [h('Explore after the comparison'),p('Propose one additional test. Change one condition or sample choice, collect exploration separately, and explain what the new evidence adds.'),lines(3),p('Important limits: '+c['limits'],'LabSmall')]
 if c['kind']=='meiosis':
  from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line
  student += [PageBreak()]+title(c,'Printable chromosome strips')+[p('Print one sheet for each model, or use removable tape to reuse strips. Cut around each strip. The dot is the centromere. Matching letters mark corresponding gene positions. Pair the two same-color strips as sister chromatids.'),p('For crossing over, cut ONE strip of each color at the same gap between genes. Exchange the complete right-hand segments. Keep the other two strips unchanged.')]
  drawing=Drawing(504,340)
  for row,genes in enumerate(['ABC','ABC','abc','abc']):
   y=285-row*70
   drawing.add(Rect(8,y,475,45,fillColor=colors.HexColor('#d1e8ed' if row<2 else '#f5ddca'),strokeColor=colors.HexColor('#546f6b')))
   drawing.add(Circle(35,y+22,8,fillColor=colors.HexColor('#50665c')))
   for j,gene in enumerate(genes):drawing.add(String(105+j*145,y+15,gene,fontName='Helvetica-Bold',fontSize=22))
   drawing.add(String(12,y-12,'Homolog '+str(1 if row<2 else 2)+' / chromatid '+str(row+1),fontSize=9))
  student += [drawing,p('Draw four gamete circles on another sheet. Separate homologs first, then sisters. Place one resulting strip in each circle; record its allele string and whether it is parental or recombinant.'),p('Optional evidence extension: the separate Sordaria activity connects chromosome modeling to ordered spore patterns.')]
 build(c,'worksheet',student)
 teacher=title(c,'Teacher guide / classroom preparation')+[h('Learning target'),p(c['question']),h('Timing and materials'),p(c['time']),p(c['materials']),h('Classroom route')]
 teacher += [p(str(i+1)+'. '+x) for i,x in enumerate(c['physical'])]
 teacher += [p('Pilot the physical procedure with your own equipment. Follow school handling and disposal rules and the purchased kit instructions. The virtual numerical settings are not an equipment prescription.','LabSmall'),PageBreak()]
 teacher+=title(c,'Teacher guide / instruction and assessment')+[h('Hybrid or substitute assignment'),p('Assign all virtual, all physical, or specified samples in each mode. The classroom entry button is available during collection. Students complete the same prediction and evidence questions. Record classroom time series on the worksheet; the online classroom form stores endpoint measurements and notes. Keep sources and measurement scales separate.'),h('Guided virtual sequence'),p('Students prepare each sample, inspect the apparatus or classify specimens, then explicitly collect data. All assigned trials are required before exploration. Reload pauses the clock and restores saved work. Downloads retain source labels; no automatic grade is submitted.'),h('Expected reasoning'),p(EXPECT[c['kind']]),h('Feedback and scoring'),table([['Criterion','Points','Evidence'],['Prediction and controls','0-2','Testable claim; comparable samples and controlled variables.'],['Observations','0-2','Complete, labeled records with units and source.'],['Interpretation','0-2','Correct calculations or categorical comparisons; claim tied to evidence.'],['Limitations','0-2','Specific uncertainty and a useful follow-up investigation.']],[130,50,324]),p('Score reasoning and data quality, not agreement of physical results with the simulation. Manual tallies are student observations; a matching total does not prove every category is correct. Do not replace student counts with the model answer. The optional Sordaria extension retains classification feedback.'),PageBreak()]
 teacher+=title(c,'Teacher guide / model and sources')+[h('Model limitations'),p(c['limits']),h('Troubleshooting'),p('Confirm the preparation steps are finished before starting or collecting. Corn and fly activities require manual tallies summing to the sample size plus review; optional specimen marks do not classify or tally automatically. Chromosome models require all four gametes plus a reviewed tally; cell measurements require a focused 40x view; gels require staining and three size estimates; fluorescence labs require the viewer. Use the visible Collect data and continue button to advance.'),p('For physical work, preserve unexpected observations, check the control and instrument setup, then repeat with fresh material where appropriate. Never replace measured results with the virtual answer.'),h('Evidence and optional classroom resources')]
 for label,url in c['sources']:teacher += [p(label),p(url,'LabSmall')]
 teacher += [p('External resources remain on their publishers\' websites. This packet contains original text and tables, not supplier worksheets. Chapter numbers are reading connections. No supplier or textbook publisher endorsement is implied.'),h('Teacher pilot checklist'),p('Confirm availability and preparation time; test controls; check units and observation windows; verify handling/disposal; choose class grouping and accessible alternatives; keep notes for revision.'),lines(3)]
 build(c,'teacher-guide',teacher)
