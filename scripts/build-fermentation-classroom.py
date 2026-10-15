"""Build flexible classroom fermentation handouts; publish copies with the website."""
from pathlib import Path
from shutil import copyfile
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
styles=getSampleStyleSheet()
for name,size,leading in [('Body',10,14),('Small',8,11),('Cell',8,10),('Head',13,17),('TitleX',22,26)]:
 styles.add(ParagraphStyle(name=name,fontName='Helvetica-Bold' if name in ['Head','TitleX'] else 'Helvetica',fontSize=size,leading=leading,spaceAfter=8,textColor=colors.HexColor('#234e43') if name in ['Head','TitleX'] else colors.HexColor('#202b27')))
def p(s,style='Body'): return Paragraph(escape(s),styles[style])
def h(s): return p(s,'Head')
def title(kind,section):return [p('Yeast Fermentation','TitleX'),p(kind+' | Flexible classroom investigation | Biology 2e, Chapter 7','Small'),h(section)]
def table(rows,widths=None,height=None):
 t=Table([[p(str(x),'Cell') for x in row] for row in rows],colWidths=widths or [504/len(rows[0])]*len(rows[0]),rowHeights=height,repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8efe0')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#9eafa5')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),3 if height and height<25 else 6),('BOTTOMPADDING',(0,0),(-1,-1),3 if height and height<25 else 6)]));return t
def lines(n=2):
 t=Table([['']]*n,colWidths=[504],rowHeights=[22]*n);t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#aab9b0'))]));return t
class Graph(Flowable):
 def __init__(self):Flowable.__init__(self);self.width=504;self.height=205
 def draw(self):
  c=self.canv;c.setStrokeColor(colors.HexColor('#d6dfd8'));c.setLineWidth(.4)
  for x in range(42,495,25):c.line(x,27,x,190)
  for y in range(27,191,20):c.line(42,y,492,y)
  c.setStrokeColor(colors.HexColor('#405b50'));c.line(42,27,492,27);c.line(42,27,42,190);c.setFont('Helvetica',8);c.drawCentredString(267,6,'Elapsed time (min) - choose and label a scale');c.saveState();c.translate(12,110);c.rotate(90);c.drawCentredString(0,0,'Measurement and unit');c.restoreState()
def footer(c,d):
 c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#50665b'));c.drawString(54,30,'Science Labs | Classroom options | Revised October 2026');c.drawRightString(558,30,str(d.page))
def build(kind,story):
 name='yeast-fermentation-classroom-'+kind+'.pdf';file=OUT/name
 SimpleDocTemplate(str(file),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=42,bottomMargin=52,title='Yeast Fermentation - Classroom '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
 copyfile(file,ROOT/'public/resources'/name);print(file)
T=title('Teacher guide','1. Choose the equipment and organize the class')+[
 p('Question: How does the available sugar affect gas accumulation in a yeast culture? Use no added sugar, glucose, and sucrose. Students work in pairs or small teams, then pool a complete comparison set.'),
 table([['Option','Measurement','Use and limitation'],['Simple classroom lab','Balloon circumference (cm)','Matched flasks or bottles and balloons. Relative indicator of gas accumulation; not gas volume.'],['Quantitative lab','Collected gas volume (mL)','Suitable gas syringe or approved gas-collection apparatus. Check leaks, capacity and unobstructed movement.'],['Sensor lab','Pressure (kPa) OR CO2 (ppm or %)','Use school-approved equipment and its protocol. Keep headspace and temperature fixed; do not treat pressure or concentration as volume.']],[112,123,269]),Spacer(1,12),
 p('One full comparison set = 9 independent flasks: N1-N3 (no added sugar), G1-G3 (glucose), S1-S3 (sucrose). Assign each pair one or two flask IDs. Each trial is a fresh mixture in a separate flask; repeated readings from one flask are not extra trials.'),
 table([['Students in a pooled group','Example allocation for all 9 flasks'],['18: nine pairs','Each pair prepares 1 flask.'],['12: six pairs','Three pairs prepare 2; three pairs prepare 1.'],['10: five pairs','Four pairs prepare 2; one pair prepares 1.'],['9: three pairs and one trio','Each team prepares 2; the teacher prepares the ninth flask. Alternatively assign the trio 3.']],[164,340]),Spacer(1,10),
 p('Roles: prepare/mix; measure/time; record/share. Pairs can combine roles and swap. Teams with two flasks must record separate start times and track elapsed time for each.'),
 p('Demo option: distribute observation and analysis roles while the teacher prepares the apparatus. If only one flask per treatment is available, report n = 1; do not label repeated time readings as three trials. Pool additional matched, independent class setups if available.','Small'),
 PageBreak()]+title('Teacher guide','2. Stock solutions and flask sizes')+[
 p('Choose one flask size and recipe for an entire pooled set. These are starting volumes to pilot, not a guarantee of visible balloon inflation in one period. Use identical balloons that fit securely; small samples may make too little gas to inflate stiff balloons.'),
 table([['Flask capacity','Treatment stock*','Yeast suspension','Final liquid'],['50 mL','10 mL','10 mL','20 mL'],['100 mL','20 mL','20 mL','40 mL'],['Teacher-selected: ____ mL','____ mL','____ mL','____ mL']],[126,126,126,126]),
 p('*Treatment stock is plain water for N, glucose solution for G, or sucrose solution for S. These examples leave 60% of flask capacity empty for headspace/foam; lower the fill if your pilot requires it. Do not fill a 50 mL flask with 50 mL of culture.','Small'),
 h('Optional stock recipe matching the virtual concentration'),
 p('For each sugar stock: dissolve 80 g of glucose OR sucrose and bring to a final volume of 1,000 mL with water (8% mass/volume). For yeast: disperse 20 g dry baker\'s yeast and bring to 1,000 mL (2% mass/volume suspension). Keep a separate plain-water stock. Equal stock and yeast volumes give 4% sugar and 1% yeast in the final mixture. The no-sugar control receives no sugar.'),
 p('This matches the virtual lab\'s mass concentrations, not its apparatus or volume. Use the same glucose product throughout; record if it is dextrose monohydrate. Equal sugar mass concentration is not equal molarity. A teacher may use another piloted recipe and record it below.'),
 p('Prepare sugar stocks ahead in labeled clean containers. Prepare yeast close to use following its package hydration guidance; do not add sugar to the shared yeast stock. Gently resuspend immediately before every aliquot because yeast settles. Use separate labeled transfer tools and equilibrate all stocks to the same chosen test temperature.'),
 table([['For one 9-flask set','50 mL flasks','100 mL flasks'],['Plain water / glucose / sucrose (each)','30 mL','60 mL'],['Yeast suspension (all 9 flasks)','90 mL','180 mL'],['Complete sets from 1 L of EACH stock*','11 sets','5 sets']],[256,124,124]),
 p('*Before transfer losses; yeast is limiting. For B sets and V mL of each stock per flask: each treatment stock = 3 x B x V; yeast = 9 x B x V. Allow extra for spills and the pilot. Optional controls need additional stock.','Small'),
 p('Chosen sugar stock: ____ g / ____ mL final stock. Yeast: ____ g / ____ mL.\nChosen test temperature: ____ C. Final sugar concentration: ____ %.','Small'),
 PageBreak()]+title('Teacher guide','3. Run, measure, and interpret')+[
 h('Classroom sequence'),
 p('Allow about 10-15 minutes to plan and prepare, 30 minutes to observe, and 15-20 minutes to pool and interpret. Adjust after a pilot; use the next lesson for analysis if needed. A shared 30 C water bath is one possible test condition; keep all treatments at the same measured temperature.'),
 p('1. Assign nine flask IDs using page 4. Students label their flasks, record their prediction, and copy the teacher-approved volumes, temperature, measurement and schedule.'),
 p('2. Dispense treatment stock first. Gently resuspend the common yeast stock, add the assigned volume last, mix each flask consistently, fit the balloon promptly, and start that flask\'s timer. Record initial observations. Do not inflate balloons by mouth; use the same teacher-selected preparation for every balloon.'),
 p('3. Record at 0, 5, 10, 15, 20, 25 and 30 elapsed minutes, or a common teacher-selected schedule. With balloons, measure the widest circumference gently with string/ruler or flexible tape. Do not squeeze. Use the same location/method each time.'),
 p('4. For a limp balloon, record NI (not inflated), not a fabricated zero. Record M for missing and L for a suspected leak, with notes. A visibly inflated balloon may be measured even if small. Report time to first visible inflation separately if useful.'),
 p('5. Share raw readings and flask IDs. Average only comparable numeric readings and report n at each time. If some trials are NI, report how many are uninflated and any numeric-only mean separately; do not imply it represents all three flasks. Do not silently discard unusual results.'),
 h('Interpretation and alternative equipment'),
 p('Circumference is a proxy affected by balloon elasticity, leaks, temperature and gas dissolved in the liquid. Do not convert it to mL using a spherical-balloon formula. A cm/min change is a circumference-change rate, not a gas-production rate. For gas syringes use mL and baseline-correct readings; for sensors use the manufacturer\'s calibration and operating procedure.'),
 p('Compare only matching apparatus, recipes, temperatures and units in a pooled mean. Keep different flask sizes, measurement methods and virtual results separate. Gas accumulation supports a claim about yeast activity; it does not directly measure ATP yield or establish oxygen absence. Do not require glucose to beat sucrose.'),
 h('Practical checks'),
 p('Use eye protection and school lab procedures. Check glassware, balloon fit and latex allergies. Never cap a gas-producing culture in a rigid closed container; never obstruct a gas syringe. Pressure sensors require a rated system and its specified pressure limit. Do not taste cultures. Teacher handles warm water, stops foaming/overfilled setups and directs cleanup.','Small'),
 p('If nothing inflates: check yeast freshness, temperature, settling, leaks and balloon stiffness; allow more time if practical. A sugar-without-yeast control can help assess physical gas expansion. Record it separately from the nine required flasks.','Small'),
 PageBreak()]+title('Teacher guide','4. Assignment roster and lesson settings')+[
 p('Class/date: ____________________  Pooled set ID: __________  Students: ____'),
 p('Method/unit: ____________________  Flask capacity: ____ mL  Balloon type: __________'),
 p('Treatment stock per flask: ____ mL  Yeast suspension per flask: ____ mL'),
 p('Temperature: ____ C  Reading interval: ____ min  Final time: ____ min'),
 table([['Flask ID','Treatment','Pair/team or demo','Start time'],*[[i,t,'',''] for t,prefix in [('No added sugar','N'),('Glucose','G'),('Sucrose','S')] for i in [prefix+'1',prefix+'2',prefix+'3']]],[65,122,237,80],height=24),Spacer(1,10),
 p('If fewer than three valid independent trials remain, report the actual sample size and reason. Add a fresh replacement if time allows; retain the original record with its flag.'),
 h('Print and share'),
 p('Print worksheet pages 1-2 for each pair/team and pages 3-4 for each student or pooled group. Page 2 records up to two flasks; copy it for additional flasks. Page 3 combines all nine. For other collection methods, change the measurement/unit fields and provide the equipment protocol.'),
 p('The website\'s virtual lab uses gas volume (mL). Keep balloon and sensor results on this worksheet or a separate class spreadsheet; do not enter cm, kPa or ppm into its mL fields. No login is needed to download these handouts.'),
 h('Method and reading connections'),
 p('Science World: Yeast-Inflated Balloons\nhttps://www.scienceworld.ca/resource/yeast-inflated-balloons/\nScience Buddies: Yeasty Beasties\nhttps://www.sciencebuddies.org/science-fair-projects/project-ideas/MicroBio_p011/microbiology/yeast-activity-balloons\nOpenStax Biology 2e, 7.5: Metabolism without Oxygen\nhttps://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen','Small'),
 p('This guide adapts the measurement approach to pooled classroom trials. Small-flask recipes and volumes above are proposed pilot settings, not validated performance claims.','Small')]
build('teacher-guide',T)
S=title('Student worksheet','1. Plan before you mix')+[
 p('Names: __________________________________  Class/date: __________________'),
 p('Pair/team: __________  Pooled set ID: __________  Assigned flask IDs: __________'),
 p('Question: How does the available sugar affect gas accumulation in a yeast culture? Your team prepares one or two independent flasks. Pool results with other teams to compare three no-added-sugar, three glucose and three sucrose trials.'),
 p('A balloon can collect gas from a culture. Measuring its circumference means measuring the distance around its widest part. This gives a relative indicator of gas accumulation, not a volume in milliliters. Predict the results before starting.'),
 h('Teacher-selected setup'),
 table([['Setting','Record your assignment'],['Method / measurement / unit','Balloon / circumference / cm OR: __________________'],['Flask size / final liquid volume','________ mL / ________ mL'],['Treatment stock / yeast suspension per flask','________ mL / ________ mL'],['Sugar stock concentration / yeast stock concentration','________________ / ________________'],['Temperature / reading interval / end time','________ C / ________ min / ________ min']],[245,259]),Spacer(1,10),
 p('Prediction: Compare the three treatments and explain your reasoning.'),lines(3),Spacer(1,9),
 p('What will you change? What will you measure? Name three things to keep the same.'),lines(3),Spacer(1,9),
 p('Before beginning: confirm your flask IDs, stock labels, volumes and timing with the teacher. Wear eye protection, do not taste the mixtures, and never seal a culture with a rigid cap. Tell the teacher about damaged glassware or a balloon allergy.','Small'),
 PageBreak()]+title('Student worksheet','2. Prepare and record your own flasks')+[
 p('Label each flask. Add its assigned treatment stock. Ask for the yeast stock to be gently remixed immediately before measuring your aliquot. Add yeast last, mix consistently, promptly attach the balloon, and start that flask\'s timer. Use a fresh mixture for every flask.'),
 p('At each elapsed time, gently measure the widest balloon circumference without squeezing. Record NI if not inflated, M if a reading is missing, and L with a note for a suspected leak. Do not substitute zero for NI or M. For gas collection or sensors, use the teacher\'s equipment procedure and the correct units.','Small'),
 p('Measurement: ____________________  Unit: ______  Pooled set ID: __________'),
 p('Flask A ID: ____ Treatment: __________ Start time: ____ Temperature: ____ C'),
 p('Flask B ID: ____ Treatment: __________ Start time: ____ Temperature: ____ C'),
 table([['Elapsed min*','Flask A reading','Flask B reading','Notes: foam, leaks, delays, changes'],*[[str(t),'','',''] for t in range(0,31,5)]],[80,100,100,224],height=32),
 p('*Use 0-30 minutes at 5-minute intervals unless your teacher assigns another schedule; relabel times. Read each flask at its own elapsed time. Leave the second flask column unused if you have only one.','Small'),
 p('Time to first visible inflation (if observed): A ______ min; B ______ min'),
 p('Describe anything that could affect your measurements. Keep the raw readings.'),lines(3),Spacer(1,8),
 p('Share your flask IDs, raw readings, units, temperature and notes with your pooled group. Nine flasks are nine independent trials; seven readings from one flask are still only one trial.','Small'),
 PageBreak()]+title('Student worksheet','3. Pool three trials of each treatment')+[
 p('Pooled set ID: ______  Measurement: __________________  Unit: ______'),
 p('Pool only matching recipes, flask sizes, equipment and temperatures. Keep virtual mL results separate from balloon cm or sensor readings. Copy actual times if your schedule differs. NI = not inflated; M = missing; L = suspected leak.','Small')]
for name,prefix in [('No added sugar','N'),('Glucose','G'),('Sucrose','S')]:
 S += [h(name),table([['Elapsed min',prefix+'1',prefix+'2',prefix+'3','Numeric mean','n / NI count'],*[[str(t),'','','',''] for t in range(0,31,5)]],[78,65,65,65,111,120],height=18),Spacer(1,5)]
S += [p('Mean = sum of comparable numeric readings / number of those readings (n). Report NI separately. If n is below 3, label the mean as numeric-only; it does not represent all three flasks. Keep flagged observations and explain any exclusion.','Small'),PageBreak()]+title('Student worksheet','4. Compare evidence and explain')+[
 p('Graph measurement versus elapsed time. Label scales and units; use different colors or symbols and a legend for the three treatments. Mark missing/NI readings as gaps, not zero. Label means with n when fewer than three trials contribute.','Small'),Graph(),p('Legend: No sugar __________  Glucose __________  Sucrose __________','Small'),
 p('1. What do the data support? Compare treatments using numbers, units and variation among the three independent trials.'),lines(2),Spacer(1,8),
 p('2. Why include no-added-sugar yeast? Would sugar solution without yeast answer a different question?'),lines(2),Spacer(1,8),
 p('3. Explain why balloon size alone cannot measure ATP production or prove that oxygen was absent. Identify a measurement limitation.'),lines(2),Spacer(1,8),
 p('After the comparison: propose one follow-up test (for example sugar concentration or temperature). State what you would change and keep constant. Get teacher approval before testing; record new results separately.'),lines(2)]
build('worksheet',S)
