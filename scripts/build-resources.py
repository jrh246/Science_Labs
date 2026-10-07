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
 if c['kind']=='leaf':
  story += [heading('Before you begin: prepare for the investigation'),
   heading('What is infiltration?'),para('Infiltration is the movement of liquid into spaces within a material. When those spaces contain trapped air, reducing the pressure can help remove the air so liquid can take its place.'),
   para('Place a porous material in liquid inside a needle-free syringe. Gently expel excess air, cover the tip, and pull back the plunger to lower the pressure. Trapped gas can expand and escape. Uncover the tip and gently release the vacuum; liquid can enter the spaces as normal pressure returns. Repeated cycles may be needed.'),
   para('Before testing, predict how this preparation might affect your sample. Record your prediction and reasoning on the next page.'),
   heading('Run a controlled comparison'),
   para('The virtual lab guides you through three dark trials, three low-light trials, and three bright-light trials. For each trial:'),
   para('1. In Collect observations, use Pull plunger and Release vacuum three times to prepare the disks.'),
   para('2. Click Add disks to cup. The cup stays empty until you transfer the prepared disks.'),
   para('3. Check the assigned lamp setting: Off (0%), Low (25%), or High (100%). Select it if needed. If the correct setting is already highlighted, you can start without clicking it again. The setting stays fixed during the trial.'),
   para('4. Click Start trial and observe for 20 simulated minutes. You can pause, change timer speed, advance two minutes, or run the remaining time. The app records readings every two simulated minutes; copy them into your observation table.'),
   para('5. Review the readings, then click Collect data and continue to save the results and advance. Repeat with fresh disks until all nine trials are collected.'),
   para('After the controlled comparison, use Explore other settings to investigate freely. The exploration activity is at the end of this lab worksheet; your comparison data stay saved separately.','SmallLab'),
   PageBreak()]+title(c,'Student worksheet / prediction')
 if c['kind']=='yeast':
  story += [heading('Before you begin: the gas-collection apparatus'),
   para('A flask holds the mixture. A fitted stopper and tube connect it to a gas syringe. Gas entering the barrel can move its freely sliding plunger; the scale measures collected volume in milliliters. A water bath keeps samples at a consistent temperature.'),
   para('In a real setup, check for leaks and never block the syringe plunger. Use fresh material for every independent trial. Before testing, predict how the available sugar might affect the measurements; record your reasoning on the next page.'),
   heading('Run a controlled comparison'),
   para('The lab guides you through three trials with no added sugar, three with glucose, and three with sucrose. Each comparison uses 0.5 g yeast, 50 mL final mixture, and a 30 C water bath. Sugar treatments use 2 g sugar; the control has no added sugar.'),
   para('1. In Collect observations, select the assigned treatment if it is not already highlighted. Click Prepare mixture. The flask stays empty until preparation is complete.'),
   para('2. Click Connect gas syringe to fit the stopper and tubing. The gas syringe must be connected before the trial starts. Its plunger remains free to move.'),
   para('3. Click Start trial. Observe for 30 simulated minutes. You can pause, change timer speed, advance five minutes, or run the remaining time. The app records gas volume every five simulated minutes; copy the readings into your observation table.'),
   para('4. Review the readings, then click Collect data and continue. This saves the results and advances to the next trial with a fresh flask. Repeat until all nine trials are collected.'),
   para('After the controlled comparison, choose Explore other settings. The exploration activity is at the end of the lab worksheet; your nine comparison trials remain saved separately.','SmallLab'),
   PageBreak()]+title(c,'Student worksheet / prediction')
 if c['kind']=='mitosis':
  story += [heading('Before you begin: using a microscope'),
   para('A microscope uses light and lenses to reveal small structures. Begin with a low-power objective to locate the specimen, then use higher power and fine focus to inspect chromosome features. Total magnification equals eyepiece magnification multiplied by objective magnification.'),
   para('This model uses a 10x eyepiece. The 10x objective gives 100x total magnification; the 40x objective gives 400x. The cell images are original teaching illustrations, not microscope photographs. They are snapshots, not a movie of the cell cycle.'),
   heading('Observe and collect two fields'),
   para('1. Record your prediction and sampling plan on the next page. Decide how to count each cell once and document uncertain classifications. Use the stage reference and consistent scoring rules.'),
   para('2. In Collect observations, click Load prepared slide, then Turn light on. Start at the 10x objective. Adjust Fine focus until the cells are clear; adjust illumination if needed.'),
   para('3. Switch to the 40x objective. Inspect the selected cell. If the view is unclear, adjust fine focus or illumination before choosing a stage.'),
   para('4. Classify all 20 cells in Field A. Each choice records one cell and moves to the next unclassified cell. Use the numbered cell map to revisit a cell; changing its classification replaces the old choice without adding another cell.'),
   para('5. Click Review field classifications. Compare with the practice key and revise if needed. Your own classifications are retained, including disagreements. Click Collect data and continue to save Field A and advance to Field B.'),
   para('6. Repeat for Field B. Use the collected counts to calculate stage percentages and estimated durations. The assumed cycle duration is not a measured time.'),
   para('After both fields are collected, choose Explore other settings. The exploration activity is at the end of this worksheet and uses a separate practice tally.','SmallLab'),
   PageBreak()]+title(c,'Student worksheet / prediction')
 story += [para('Name: __________________________  Class: __________  Date: __________'),heading('1. Predict and plan'),para(c['question']),para('Predict how infiltration and light conditions might affect the leaf disks. Complete the guided comparison using the assigned light level for each 20-minute trial. After collecting all nine trials, explore other settings and compare your observations with your prediction.' if c['kind']=='leaf' else c['overview']),para('Prediction and scientific reasoning:'),lines(3),Spacer(1,12),para('Variables and controls, or sampling plan:'),lines(3),Spacer(1,12),para('Keep consistent: '+c['constants']),heading('Select your route'),table([['Part','Virtual / Classroom','Equipment or conditions']]+[[x['label'],'',''] for x in c['conditions']],[136,130,238]),para('Use the same questions for either route. Always label the source of each dataset.','SmallLab'),PageBreak()]
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
  story += [PageBreak()]+title(c,'Student worksheet / exploration')+[
   heading('4. Explore after the controlled comparison'),
   para('After collecting all nine trials, choose Explore other settings. Prepare a fresh set of disks in the syringe, then click Add disks to cup. Before testing a change, predict what you expect to observe.'),
   para('Change the lamp during a run, or choose any intensity from 0 to 100%. After 20 minutes, resume to observe up to 120 minutes. Try high light, darkness, then high light again. Turning off the lamp does not pause time. Exploration is separate from your nine comparison trials and does not change their results. Download your data before restarting the exploration.'),
   para('My prediction and reasoning:'),lines(3),Spacer(1,12),
   para('My change (setting and simulated time):'),lines(2),Spacer(1,12),
   para('What happened immediately? What happened later? Compare your observations with your prediction and propose an explanation.'),lines(4),
   para('CSV and text reports include your exploration observations. Model rates are illustrative, not predictions for real leaves.','SmallLab')]
 if c['kind']=='yeast':
  story += [PageBreak()]+title(c,'Student worksheet / exploration')+[
   heading('4. Explore after the controlled comparison'),
   para('After collecting all nine trials, choose Explore other settings. Select a fuel and prepare a fresh mixture, then connect the gas syringe. Predict an outcome before changing a setting.'),
   para('Explore bath settings from 15 to 40 C while the timer runs. The bath temperature changes gradually. After the timer pauses at 30 minutes, resume for up to 120 minutes or until the syringe reaches its 100 mL capacity. Use Fresh mixture / restart trial to test another fuel or turn off Include 0.5 g baker yeast to try a no-yeast control.'),
   para('My question, prediction, and reasoning:'),lines(3),Spacer(1,12),
   para('My change (fuel, yeast present or absent, temperature, and simulated time):'),lines(3),Spacer(1,12),
   para('What happened immediately and later? Use measurements to compare your observations with your prediction.'),lines(4),
   para('Exploration does not change the comparison means. Download your data before restarting. This simplified model omits gas expansion, yeast damage, and substrate depletion; do not treat model times or temperature responses as measurements of real yeast.','SmallLab')]
 if c['kind']=='mitosis':
  story += [PageBreak()]+title(c,'Student worksheet / exploration')+[
   heading('4. Explore after collecting both fields'),
   para('Choose Explore other settings. Load the practice slide, turn on the light, focus at low power, and inspect selected cells at higher power. Explore illumination and focus. How do the controls affect your ability to distinguish chromosome features?'),
   para('Classify a practice field and review it. Switching practice fields clears only the current practice tally. Your collected Field A and Field B data stay saved separately.'),
   para('My question and prediction about microscope settings:'),lines(3),Spacer(1,12),
   para('Settings tested and what I could observe:'),lines(3),Spacer(1,12),
   heading('Explore the time assumption'),
   para('Keep the same practice tally. Compare estimated stage durations with assumed cycles of 12, 24, and 36 hours. The slider changes the estimates, not the cells or their counts. Explain why counts alone cannot measure elapsed time.'),
   para('My comparison and explanation:'),lines(4),
   para('Practice estimates use the cells classified so far. Complete the whole field for a full-field tally. Practice settings and counts are included separately in exports.','SmallLab')]
 if '--guide-only' not in sys.argv:build(c,'worksheet',story)
 if '--worksheet-only' in sys.argv:
  runpy.run_path(str(ROOT/'scripts/cutout-resources.py'))['append_cutouts'](c['id'],worksheet_only=True)
  continue
 guide=title(c,'Teacher guide')+[heading('Learning targets and timing'),para(c['question']),para(c['overview']),para('Suggested sequence: 8-10 min prediction and setup; 20-30 min observation; 12-20 min analysis. Virtual time can be accelerated. For photosynthesis and yeast, pool independent replicates from class groups; three sequential repeats need extra class time.'),heading('Route choices and sharing'),para('The student pages open as guided virtual investigations. Teacher customization is deferred to a future teacher workspace. Use this worksheet to assign classroom components separately; discuss data-source differences when comparing results. Existing hybrid links still work, but the student page no longer creates them.' if c['kind'] in ('leaf','yeast','mitosis') else 'In Teacher setup, select Virtual or Classroom for each treatment/field and create an assignment link. Assign all virtual for absences or a substitute. For a hybrid route, conduct one part in class and simulate the others; compare data-source limitations before pooling. These links are editable and do not restrict access.'),heading('Materials'),*[para('- '+x) for x in c['materials']],heading('Classroom procedure'),*[para(f'{i+1}. {x}','SmallLab') for i,x in enumerate(c['procedure'])],para('Safety: '+c['safety'],'SmallLab'),PageBreak()]+title(c,'Teacher guide / interpretation')+[heading('Expected reasoning and troubleshooting'),*[para(x,'SmallLab') for x in c['teacherNotes']],heading('Model boundaries'),para(c['model'],'SmallLab'),para(c['interpretation'],'SmallLab'),heading('Suggested assessment - 12 points'),table([['Dimension','Evidence to look for','Points'],['Design','Reasoned prediction; variables, controls or sampling plan','0-3'],['Data','Complete observations, correct units, source labels, repeats','0-3'],['Analysis','Appropriate calculations and comparisons supported by data','0-3'],['Explanation','Biological reasoning, uncertainty, and a feasible improvement','0-3']],[88,367,49]),para('For each dimension: 0 = absent; 1 = partial or major errors; 2 = mostly sound with a minor omission; 3 = complete and well supported. Suggested teacher rubric only; the app does not assign a grade.','SmallLab'),heading('Downloads, access, and classroom pilot'),para('Student worksheet: preparation, investigation, and exploration pages where included, plus companion cutouts. Teacher guide: procedures, interpretation, and rubric. Reports and CSV data download from Analyze & explain. Teacher guides are public resources, not protected answer keys. Before classroom use, pilot the equipment, timing, and reading level. Editable Word and fillable PDF versions are planned.','SmallLab'),heading('Reading and method connections')]
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
 if c['kind']=='yeast':
  guide += [PageBreak()]+title(c,'Teacher guide / interactive gas collection')+[
   heading('Preparation first; exploration after comparison'),
   para('Students choose the assigned fuel, prepare the 50 mL mixture with 0.5 g yeast, and connect the stopper and tubing to the movable gas syringe. The flask stays empty until preparation is finished. Each treatment has three guided repeats at 30 C for 30 simulated minutes. No-added-sugar is preselected and needs no extra confirmation.'),
   para('The timer runs at 30x, 60x, or 120x, with pause and time-advance controls. It stops at 30 minutes. Students must click Collect data and continue to save the trial and advance. Data are recorded every five minutes. Completed trials and classroom data are preserved on this device; reload restores an unfinished virtual trial paused.'),
   heading('Free exploration'),
   para('After all nine trials, students can adjust the bath from 15 to 40 C. The simulated temperature approaches the setting gradually and affects subsequent gas accumulation. Students can resume past 30 minutes, up to 120 minutes or 100 mL. Use a fresh mixture to change fuel or omit yeast. Explore a no-yeast control and discuss physical gas expansion, which this simplified model does not represent.'),
   para('Exploration is stored separately and exported with fuel, yeast presence, time, gas volume, and temperature. It never replaces the nine comparison trials. Download exploration before starting a fresh mixture; that action replaces the current exploration.'),
   heading('Interpretation and model limits'),
   para('Assess predictions, matched conditions, measured rates, variability, and evidence-based explanations. The plunger shows cumulative gas volume, not foam height or ATP yield. This illustrative model has trial variation and a lag but omits substrate depletion, leaks, thermal expansion, and temperature damage. It does not prove oxygen was absent or establish that all gas arose through fermentation. Never block a real syringe or seal a rigid vessel against gas production.')]
 if c['kind']=='mitosis':
  guide += [PageBreak()]+title(c,'Teacher guide / interactive microscope')+[
   heading('Guided setup and field collection'),
   para('Students load a prepared slide, turn on illumination, and focus at the 10x objective (100x total). Once the low-power field is clear, the 40x objective (400x total) becomes available. Focus and illumination affect the view; classification is enabled only with a loaded, illuminated, focused high-power view.'),
   para('The numbered map preserves the identity of 20 cells. Each classification advances to the next unclassified cell. Selecting a map number lets students revise without double-counting. The higher-power view enlarges a selected cell; it does not introduce a different sample.'),
   para('After all 20 classifications, Review field classifications shows agreement with the model key. Collect data and continue explicitly saves Field A and advances to Field B. Accept collection even with disagreements; the app preserves student classifications rather than substituting the key. After Field B, analyze the totals or enter free exploration.'),
   heading('Exploration and saved work'),
   para('Practice microscope settings, classify separate illustrated fields, and vary an assumed 1-48 hour cycle. Changing this assumption changes estimates only. Practice field changes clear that practice tally, not collected data. Exports identify practice counts and duration separately. Reload restores setup, selections, and classifications; existing classroom assignments and saved field data remain supported.'),
   heading('Instructional limits and assessment'),
   para('These are teaching illustrations, not histology photographs or a physical optics model. Focus and brightness controls use arbitrary scales. Cells do not advance through stages while students count. The model key reflects a curated distribution; real samples need not match it.'),
   para('Assess chromosome evidence, complete sampling, avoidance of double-counting, uncertainty, and explicit assumptions behind duration estimates. Students can use the stage reference during work. Classroom counts should not be corrected to match the virtual key; discuss sampling differences before pooling. The app does not submit a grade.')]
 build(c,'teacher-guide',guide)
 runpy.run_path(str(ROOT/'scripts/cutout-resources.py'))['append_cutouts'](c['id'],'--guide-only' in sys.argv)
