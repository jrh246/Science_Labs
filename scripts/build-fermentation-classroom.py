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
def title(kind,section):return [p('Yeast Fermentation','TitleX'),p(kind+' | '+METHOD['label']+' | Biology 2e, Chapter 7','Small'),h(section)]
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
 name='yeast-fermentation-'+METHOD['id']+'-'+kind+'.pdf';file=OUT/name
 SimpleDocTemplate(str(file),pagesize=(612,792),leftMargin=54,rightMargin=54,topMargin=42,bottomMargin=52,title='Yeast Fermentation - Classroom '+kind,author='Science Labs').build(story,onFirstPage=footer,onLaterPages=footer)
 copyfile(file,ROOT/'public/resources'/name);print(file)
METHODS=[
 dict(id='balloon',label='Balloon lab',unit='cm',measurement='Balloon circumference',
 equipment='Matched flasks, same-type balloons that fit the necks, flexible tape or string and ruler. Also use a timer, thermometer, labeled transfer tools, stocks and eye protection.',
 principle='A balloon collects gas. Measure the distance around its widest part. Circumference is a relative indicator of gas accumulation, not a volume in milliliters.',
 setup='Check balloon fit and latex allergies. Use the same teacher-selected balloon preparation for every setup; do not inflate by mouth. Fit the balloon promptly after adding yeast.',
 read='Gently measure the widest circumference without squeezing. Use the same measurement method each time. Record NI (not inflated) for a limp balloon; do not invent a zero.',
 limit='Elasticity, inflation threshold, leaks and temperature affect the measurement. Do not convert circumference to volume using a spherical-balloon formula. A cm/min change is not a gas-production rate.',
 safety='Never use a rigid cap. The teacher stops setups if foam enters a balloon or its inflation becomes excessive.',
 flags='NI = not inflated; M = missing; L = suspected leak. Do not replace NI or M with zero.',
 baseline='Record actual circumference when measurable; record NI when limp. Do not subtract NI as if it were zero.',
 result='circumference', count='n / NI count'),
 dict(id='cylinder',label='Graduated-cylinder lab (water displacement)',unit='mL',measurement='Collected gas volume',
 equipment='Matched flasks, fitted one-hole bungs and delivery tubing, water troughs, graduated cylinders, stands and clamps. Also use timers, thermometer, transfer tools, stocks and eye protection.',
 principle='Gas enters an inverted, water-filled graduated cylinder and displaces water. The gas-water boundary provides a readable volume. This is water displacement, not collection by direct displacement of air.',
 setup='Fill the cylinder completely with water. Invert it with its mouth submerged in a trough, keeping out air bubbles, and clamp securely. Place the delivery-tube outlet under its submerged mouth. The flask end of the tube stays above the culture. Check for leaks and keep tubing open.',
 read='Read the collected gas volume at eye level from the cylinder scale at the gas-water boundary. Record the initial trapped-gas volume V0 and each raw volume Vt. Record net collected volume Vt minus V0. Keep the cylinder mouth submerged and the reading position consistent.',
 limit='CO2 can dissolve in the collection water, so collected volume may underestimate gas released. Unequal water levels create a pressure difference; keep the setup consistent and, when the teacher can safely do so, equalize inside/outside water levels for readings. Do not pool with syringe data.',
 safety='Keep tubing unkinked and the cylinder mouth underwater. Stop before gas reaches the cylinder capacity. Disconnect the flask from the collection apparatus before cooling or dismantling to prevent water being drawn back into the culture.',
 flags='M = missing; L = suspected leak. Record an observed zero as 0, but never replace missing data with zero.',
 baseline='Record V0 before the first timed reading. Retain raw Vt readings; calculate net volume = Vt - V0. Flag an unexpected decrease rather than silently replacing it.',
 result='net collected volume',count='n'),
 dict(id='syringe',label='Gas-syringe lab',unit='mL',measurement='Collected gas volume',
 equipment='Matched flasks, fitted one-hole bungs, delivery tubing and suitable graduated gas syringes, stands and clamps. Also use timers, thermometer, transfer tools, stocks and eye protection.',
 principle='Gas from the flask moves a freely sliding gas-syringe plunger. Read the scale to measure collected gas volume in mL. The virtual lab uses this quantitative apparatus.',
 setup='Support the gas syringe horizontally as its instructions specify, with the plunger free to move. Connect the flask to the syringe using a fitted bung and open tubing; the flask end stays above the culture. Check joints for leaks. A needle-free medical syringe may have too much friction; use suitable gas-collection equipment.',
 read='Read the syringe scale at eye level at the manufacturer-specified reference point. Record initial volume V0 and each raw volume Vt. Calculate net collected volume Vt minus V0. Do not push or pull the plunger during a run.',
 limit='Plunger friction, leaks, dead space, dissolved CO2 in the culture and temperature changes can affect results. This directly measures collected volume and avoids extra collection-water loss, but it is not error-free or a measurement of all CO2 produced.',
 safety='Never block the tubing, restrain the moving plunger or cap a gas-producing culture. Stop before the syringe reaches its capacity. Disconnect before resetting or dismantling; the teacher checks apparatus suitability.',
 flags='M = missing; L = suspected leak. Record an observed zero as 0, but never replace missing data with zero.',
 baseline='Record V0 before the first timed reading. Retain raw Vt readings; calculate net volume = Vt - V0. Flag an unexpected decrease rather than silently replacing it.',
 result='net collected volume',count='n')]
for METHOD in METHODS:
 m=METHOD; balloon=m['id']=='balloon';unit=m['unit'];result=m['result']
 T=title('Teacher guide','1. Organize a full comparison set')+[
 p('Question: How does the available sugar affect gas accumulation in a yeast culture? This download is specifically for '+m['label'].lower()+'. Use the same method for all flasks in a pooled comparison.'),
 h('Equipment and measurement'),p(m['equipment']),p(m['principle']),
 p('One set = 9 independent flasks: N1-N3 (no added sugar), G1-G3 (glucose), S1-S3 (sucrose). Each flask is a fresh mixture. Multiple readings from one flask are not additional independent trials.'),
 table([['Students','Example allocation of the 9 flasks'],['18: nine pairs','Each pair prepares 1.'],['12: six pairs','Three pairs prepare 2; three pairs prepare 1.'],['10: five pairs','Four pairs prepare 2; one pair prepares 1.'],['9: three pairs and one trio','Each team prepares 2; the teacher prepares the ninth. Or assign the trio 3.']],[160,344]),Spacer(1,12),
 p('Assign one or two flask IDs per pair and record ownership on page 4. Roles: mix/prepare, measure/time, record/share. Pairs can combine roles. Each flask needs its own start time and elapsed-time record.'),
 p('Demo: distribute observation and analysis roles while the teacher operates equipment. If using just one flask per treatment, report n = 1; do not call three time readings three trials. Share matched independent class trials to complete a set.'),
 p('Allow about 10-15 minutes to plan/prepare, 30 minutes to observe, and 15-20 minutes to pool/analyze. Use a second lesson for analysis if needed. Pilot the equipment and small-flask volumes before class.'),
 PageBreak()]+title('Teacher guide','2. Stocks, flask sizes, and supply planning')+[
 p('Choose one flask size and recipe per pooled set. These are proposed pilot volumes, not a promise of measurable gas in one lesson. Keep all treatments at the same measured temperature; a teacher-managed 30 C water bath is one possible condition.'),
 table([['Flask capacity','Treatment stock*','Yeast suspension','Final liquid'],['50 mL','10 mL','10 mL','20 mL'],['100 mL','20 mL','20 mL','40 mL'],['Custom: ____ mL','____ mL','____ mL','____ mL']],[126]*4),
 p('*Plain water for N; glucose stock for G; sucrose stock for S. Examples leave 60% headspace for gas/foam. Lower the fill if the pilot requires it; do not fill a 50 mL flask with 50 mL culture.','Small'),
 h('Optional stock recipe'),
 p('For each sugar: dissolve 80 g glucose OR sucrose and bring to a final volume of 1,000 mL with water (8% mass/volume). Disperse 20 g dry baker\'s yeast and bring to 1,000 mL (2% suspension). Keep plain water separately. Equal volumes of sugar stock and yeast give 4% sugar and 1% yeast in the flask. N has no added sugar.'),
 p('These match the virtual mass concentrations, not its 50 mL culture volume. Record the glucose product (including any dextrose monohydrate). Equal sugar mass is not equal molarity. Teachers may substitute a piloted recipe.'),
 p('Prepare labeled sugar stocks ahead. Prepare yeast close to use following package hydration guidance. Do not add sugar to shared yeast stock. Gently resuspend before EVERY aliquot because yeast settles. Use separate labeled transfer tools and equilibrate all stocks to the chosen test temperature.'),
 table([['For one 9-flask set','50 mL flasks','100 mL flasks'],['Plain water / glucose / sucrose (each)','30 mL','60 mL'],['Yeast suspension (all 9)','90 mL','180 mL'],['Sets from 1 L of EACH stock*','11','5']],[256,124,124]),
 p('*Before losses; yeast is limiting. For B sets and V mL of each stock per flask: each treatment stock = 3 x B x V; yeast = 9 x B x V. Allow extra for spills, pilot and optional controls.','Small'),
 p('Chosen sugar stock: ____ g / ____ mL. Yeast: ____ g / ____ mL.\nFinal sugar concentration: ____ %. Test temperature: ____ C.','Small'),
 PageBreak()]+title('Teacher guide','3. Set up, measure, and interpret')+[
 p(m['setup']),
 p('Label assigned flasks; dispense treatment stock first. Gently resuspend yeast stock immediately before each aliquot. Add yeast last, mix consistently, promptly connect the collector and start that flask\'s timer. Record the initial reading and any connection delay.'),
 p('Read at 0, 5, 10, 15, 20, 25 and 30 elapsed minutes, or a shared teacher-selected schedule. '+m['read']),
 p(m['baseline']+' '+m['flags']),
 h('Pooling and interpretation'),
 p(('Average only comparable numeric circumferences; report n and the number NI at each time. If NI occurs, label any numeric-only mean; it does not represent all three flasks. ' if balloon else 'Subtract each flask\'s own V0 before pooling. Average comparable net volumes and report actual n at each time. ')+ 'Keep raw readings and flag leaks, missing data and any exclusions; do not silently discard unusual results.'),
 p(m['limit']),
 p('Keep recipes, temperature, flask size, apparatus and units matched. Keep virtual and physical results separate even if both use mL. For an interval rate, divide the change in '+result+' by elapsed minutes ('+unit+'/min). A late interval rate and total gas accumulated are different quantities.'),
 p('Do not require a winning sugar. Gas accumulation supports a claim about yeast activity; it does not measure ATP yield or establish oxygen absence. The no-added-sugar control can show background activity. An optional sugar-without-yeast control helps check physical expansion.'),
 h('Practical checks'),
 p('Wear eye protection; check glassware and follow school procedures. Do not taste cultures. Teacher manages warm water, foaming, cleanup and equipment capacity. '+m['safety'],'Small'),
 p('If readings do not change: check yeast freshness, temperature, settling, leaks and collector performance. For balloons, inflation threshold may hide small gas amounts. Keep observations, allow more time if practical, and document problems.','Small'),
 PageBreak()]+title('Teacher guide','4. Assignment roster and sharing')+[
 p('Class/date: ____________________  Set ID: ______  Students: ____'),
 p('Method: '+m['label']+' | Unit: '+unit,'Small'),
 p('Flask: ____ mL  Treatment stock: ____ mL  Yeast: ____ mL'),
 p('Temperature: ____ C  Reading interval: ____ min  End time: ____ min'),
 table([['Flask ID','Treatment','Pair/team or demo','Start time'],*[[prefix+str(i),t,'',''] for t,prefix in [('No added sugar','N'),('Glucose','G'),('Sucrose','S')] for i in [1,2,3]]],[65,122,237,80],height=24),Spacer(1,10),
 p('Print worksheet pages 1-2 for each pair/team and pages 3-4 for each student or pooled group. Page 2 records up to two flasks; copy it for additional flasks. Page 3 combines all nine.'),
 p('Report actual n if fewer than three valid independent trials remain. Keep flagged originals if a fresh replacement is made. Use the classroom worksheet or a separate spreadsheet. The virtual lab stays on a gas syringe; never enter balloon cm into its mL fields.'),
 h('Method and reading connections'),
 p('Science World: Yeast-Inflated Balloons\nhttps://www.scienceworld.ca/resource/yeast-inflated-balloons/\nScience Buddies: An Aerobic Exercise (inverted-cylinder collection)\nhttps://www.sciencebuddies.org/science-fair-projects/project-ideas/MicroBio_p009/microbiology/yeast-metabolism-aerobic-anaerobic\nOpenStax Biology 2e, 7.5: Metabolism without Oxygen\nhttps://openstax.org/books/biology-2e/pages/7-5-metabolism-without-oxygen','Small'),
 p('The small-flask recipes and volumes are proposed pilot settings, not validated performance claims. The virtual apparatus measures collected gas; it does not reproduce every physical measurement error.','Small')]
 build('teacher-guide',T)
 S=title('Student worksheet','1. Plan before you mix')+[
 p('Names: ______________________________  Class/date: ______________'),
 p('Pair/team: ______  Pooled set ID: ______  Assigned flask IDs: __________'),
 p('Question: How does the available sugar affect gas accumulation in a yeast culture? Prepare your assigned one or two flasks, then pool three no-added-sugar, three glucose and three sucrose trials.'),p(m['principle']),
 h('Teacher-selected setup'),
 table([['Setting','Your assignment'],['Method / measurement / unit',m['label']+' / '+m['measurement']+' / '+unit],['Flask capacity / final liquid','____ mL / ____ mL'],['Treatment stock / yeast suspension per flask','____ mL / ____ mL'],['Sugar stock / yeast stock concentration','____________ / ____________'],['Temperature / interval / end time','____ C / ____ min / ____ min']],[230,274]),Spacer(1,10),
 p('Prediction: Compare the three treatments and explain your reasoning.'),lines(3),Spacer(1,8),p('What will you change and measure? Name three things to keep the same.'),lines(3),Spacer(1,8),
 p('Confirm IDs, stock labels, volumes and timing with your teacher. Wear eye protection, do not taste cultures, and never seal a culture in a rigid closed container. Follow the teacher\'s equipment setup instructions.','Small'),
 PageBreak()]+title('Student worksheet','2. Prepare and record your own flasks')+[
 p('Label each flask and add its assigned treatment stock. Have the yeast stock gently remixed before taking your aliquot. Add yeast last, mix consistently, promptly connect the '+('balloon' if balloon else 'gas collector')+', and start that flask\'s timer. Use a fresh mixture per flask.'),
 p(m['read'],'Small'),p(m['flags'],'Small'),
 p('Flask A ID: ____ Treatment: __________ Start time: ____ Temp: ____ C','Small'),
 p('Flask B ID: ____ Treatment: __________ Start time: ____ Temp: ____ C','Small'),
 p('Measurement: '+m['measurement']+' ('+unit+'). '+('Record actual circumference in each column.' if balloon else 'Baseline V0: A ____ mL; B ____ mL. Net = raw Vt - V0.'),'Small'),
 table(([['Elapsed min*','A ('+unit+')','B ('+unit+')','Notes']] if balloon else [['Elapsed min*','A raw mL','A net mL','B raw mL','B net mL','Notes']])+[[str(t)]+['']*(3 if balloon else 5) for t in range(0,31,5)], [80,100,100,224] if balloon else [70,70,70,70,70,154],height=30),
 p('*Use the teacher-assigned schedule if different. Each flask has its own elapsed time. Leave B unused if you have only one flask. '+('Record first visible inflation separately: A ____ min; B ____ min.' if balloon else 'Do not reset or empty the collector during a trial. Stop before it reaches capacity and tell the teacher.'),'Small'),
 p('Describe problems or observations; keep raw readings and explain any flags.'),lines(3),Spacer(1,8),p(m['safety'],'Small'),
 p('Share flask IDs, readings, units, temperature and notes. Nine separate flasks are nine trials; repeated time readings from one flask are still one trial.','Small'),
 PageBreak()]+title('Student worksheet','3. Pool three trials of each treatment')+[
 p('Set ID: ______  Measurement: '+result+' ('+unit+')','Small'),
 p('Pool matching recipes, flask sizes and equipment. Keep virtual data separate. '+m['flags']+('' if balloon else ' Copy net volumes, after subtracting each flask\'s own initial reading.'),'Small')]
 for name,prefix in [('No added sugar','N'),('Glucose','G'),('Sucrose','S')]:
  S += [h(name),table([['Elapsed min',prefix+'1',prefix+'2',prefix+'3','Mean ('+unit+')',m['count']],*[[str(t),'','','',''] for t in range(0,31,5)]],[78,65,65,65,111,120],height=18),Spacer(1,5)]
 S += [p('Mean = sum of comparable numeric readings / number of readings (n). '+('Report NI separately; a numeric-only mean with n below 3 does not represent all three flasks. ' if balloon else 'Record actual n if readings are missing or excluded. ')+'Retain flagged readings and explain exclusions. Relabel times if the teacher assigns a different schedule.','Small'),PageBreak()]+title('Student worksheet','4. Compare evidence and explain')+[
 p('Graph '+result+' ('+unit+') versus elapsed minutes. Label scales and units. Use different colors or symbols and a legend for the treatments. Mark missing'+('/NI' if balloon else '')+' data as gaps, not zero; label means with n when below three.','Small'),Graph(),p('Legend: No sugar ______  Glucose ______  Sucrose ______','Small'),
 p('1. Compare treatments using numbers, units and variation among trials. Does the treatment with the highest final reading also have the fastest increase over the final interval?'),lines(2),Spacer(1,8),
 p('2. Why include yeast with no added sugar? What would a sugar-without-yeast control help test?'),lines(2),Spacer(1,8),
 p('3. Identify one limitation of this collection method. Why can these readings alone not measure ATP yield or prove oxygen was absent?'),lines(2),Spacer(1,8),
 p('After the comparison: propose a follow-up variable and controls. Obtain teacher approval; keep new results separate.'),lines(2)]
 build('worksheet',S)
