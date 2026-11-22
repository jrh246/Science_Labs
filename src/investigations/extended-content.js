import {learningDesign} from './learning-design.js';
// Original curriculum. External links are references, not embedded supplier resources.
export const extendedLabs = [
 {id:'cell-microscopy',chapter:4,title:'Cells Under the Microscope',kind:'microscope',question:'How do the visible structures and sizes of different cells compare?',
 inlineLimit: "These are cell drawings with enlarged features. Their colors and sizes help you compare cells. Two selected cells give a small sample of a tissue.",
 studentProcedure: [
   "Use thin plant samples in a small drop of water. Use the prepared animal slide supplied by your teacher. Handle slides by their edges.",
   "Find the specimen at low power. Use a stage micrometer, a slide with known distances, to calibrate the eyepiece scale for each objective. Use fine focus at high power.",
   "Measure one clearly visible cell in each of two fields per specimen. Keep the fields separate. Record the scale, cell length, visible structures, and any uncertain measurements."
  ],
 intro: "A microscope enlarges a small area of a specimen. The objective is the lens near the slide. An eyepiece scale needs calibration, which links its divisions to a known length. Resolution means seeing two nearby features as separate. Onion epidermis is a thin outer cell layer. Epithelium is a layer of animal cells.",
 conditions:['Onion epidermis','Aquatic leaf','Prepared animal epithelium'],repeats:2,duration:0,unit:'micrometers',steps: [
   "Load slide",
   "Turn on illuminator",
   "Load calibration scale"
  ],
 setup: "Load the slide and turn on the light. Focus at the 10× objective, then load the calibration scale. Switch to 40× and calculate micrometers per division from the marked line. Match the red ruler to the selected cell. The total magnification at 40× is 400×.",
 materials:'Compound microscope, slides and coverslips, dropper, water, onion epidermis, school-approved aquatic leaf specimen, prepared animal epithelial slide, stage micrometer and eyepiece reticle.',
 physical:['Make thin plant wet mounts using a small drop of water. Use a prepared animal slide; do not collect human specimens. Lower coverslips at an angle and handle glass carefully.','Find the specimen at low power. Calibrate the eyepiece reticle against a stage micrometer separately for each objective, then use fine focus at higher power.','Measure two non-overlapping fields per specimen, with a consistently selected cell in each. Record the calibration, length, visible structures, and uncertainty. More cells improve the sample.'],
 time:'One class period; prepare slides and calibrate equipment beforehand.',analysis: [
   "Compare the cell lengths and visible structures. Which features can you see clearly?",
   "Why does the eyepiece scale need a new calibration when you change the objective?",
   "You measured two selected cells from each specimen. How could you improve the sample before making a claim about the whole tissue?"
  ],
 limits: "These cell drawings show possible shapes and sizes. They use colors and clear outlines to make features easier to see. Real views depend on the stain, light, slide thickness, and microscope. Use the measured cells as a small sample of each tissue.",
 sources:[['Plant cell microscopy','https://www.carolina.com/teacher-resources/Document/carolina-labsheets-observing-plant-cells/tr38030.tr']]},
 {id:'enzyme-activity',chapter:6,title:'What Changes Enzyme Activity?',kind:'enzyme',question:'How does temperature affect the initial rate of gas collection from potato catalase?',
 inlineLimit: "One reaction per temperature shows a comparison. More fresh samples are needed to study variation. Use the first 30 seconds for initial rate. Higher temperatures and protein shape need further tests.",
 studentProcedure: [
   "Use the extract and diluted peroxide prepared by your teacher. Wear eye protection. Use the same reagent amounts and collector in each trial.",
   "Bring the separate reagents to the assigned temperature. Add peroxide last and start timing. Keep the syringe plunger free to move.",
   "Read the gas volume every 30 seconds for 120 seconds. Keep unexpected readings. Use fresh mixtures for extra trials. Stop before the syringe reaches capacity."
  ],
 intro: "Catalase is an enzyme that speeds up the breakdown of hydrogen peroxide. The products are water and oxygen. A gas syringe collects gas and moves its plunger. The initial rate is the gas collected per second near the start of a reaction.",
 conditions:['Cold bath (10 C)','Room bath (22 C)','Warm bath (35 C)'],settings:[10,22,35],repeats:1,workflowVersion:2,duration:120,interval:30,timeUnit:'seconds',unit:'mL oxygen',steps:['Add potato extract','Connect free-moving syringe','Add peroxide and start reaction'],
 setup: "Use the assigned bath temperature. Add fresh potato extract, connect the syringe, and add peroxide last. This starts the reaction and clock. Record gas every 30 seconds for 120 seconds. Compare the first 30 seconds for each temperature.",
 materials:'Potato extract, teacher-diluted 1% hydrogen peroxide, water baths, thermometer, 100 mL flask, fitted delivery tube, 50 mL gas syringe with free plunger, graduated pipettes, timer, eye protection.',
 physical:['Teacher pilot: prepare one well-mixed batch of filtered potato extract. Try 2 mL extract and 5 mL 1% peroxide, with identical apparatus and quantities in every trial. Reduce extract if the syringe approaches capacity. These starting quantities need local validation.','Equilibrate separate reagents at 10, 22 or 35 C. Add peroxide last, promptly connect the gas collector, and start timing consistently. A teacher-approved addition port reduces gas lost during setup. Never obstruct the plunger or pressurize a sealed vessel.','Read collected gas every 30 seconds for 120 seconds. Start the classroom comparison with one fresh mixture per temperature; pool independent repeats when assessing variability or making a reliable treatment claim. Include an optional water-instead-of-extract control; avoid skin and eye contact with peroxide.'],
 time:'One class period after a teacher pilot.',analysis: [
   "Calculate gas collected per second during the first 30 seconds at each temperature. What pattern do you see? Why would more fresh samples help test it?",
   "Which equipment or setup problems could lower collected gas? Explain one way to check for them.",
   "An optimum is the best condition for a reaction. Denaturation is a change in protein shape that can reduce its activity. What further temperature tests would you need to study these ideas?"
  ],
 limits: "The main comparison uses one reaction at each temperature. Extra fresh trials are available in exploration. The model shows an example of a temperature response and a slowing reaction as the starting material is used up. Its values are teaching examples. Real gas collection can be affected by leaks, dissolved gas, mixing delays, and temperature. Testing from 10 to 40 °C gives a limited temperature range.",
 sources:[['Enzyme reaction investigation','https://www.sciencebuddies.org/science-fair-projects/project-ideas/BioChem_p011/biotechnology-techniques/enzyme-catalyzed-reactions-what-affects-their-rates']]},
 {id:'cell-signaling',chapter:9,title:'How Plants Respond to Signals',kind:'plant',question: "How does a growth signal affect stem growth compared with the carrier liquid alone?",
 inlineLimit: "Compare change from starting height. Daily readings follow the same plant. They give a growth record for that plant. More separate plants are needed to test variation.",
 studentProcedure: [
   "Use same-age plants of the same variety. Label each plant and follow your teacher's treatment groups. Use several separate plants per group when testing variation.",
   "Use the signal and matched carrier prepared for the class. Apply the same volume to each plant. Follow the supplied handling directions.",
   "Measure from soil to shoot tip before treatment and each day for seven days. Keep water, light, soil, and plant age similar. Record each plant separately."
  ],
 intro: "Gibberellin is a plant growth signal. A carrier is the liquid used to apply it. The carrier control gets the same liquid without the signal. Compare growth from each plant's starting height.",
 conditions:['Carrier control','Gibberellin treatment'],repeats:1,workflowVersion:2,duration:7,interval:1,timeUnit:'days',unit:'cm stem height',steps:['Plant matched seedling','Measure starting height','Apply assigned treatment'],
 setup: "Follow one plant per treatment for seven simulated days. Measure from the soil line to the shoot tip. Use the starting height when you calculate growth. More separate plants can help you study variation.",
 materials:'Dwarf pea seedlings of one documented variety, pots and soil, tray and grow light, ruler, labels, pipettes, educational gibberellic acid preparation and its matched carrier.',
 physical:['Grow same-age dwarf peas until shoots can be measured. Randomly assign at least three plants to each treatment and label each plant.','Use an educational GA3 preparation at the supplier-approved concentration and application volume for the chosen dwarf variety; follow its handling instructions. Apply an equal volume of matched carrier to control plants. Do not invent a stock formulation.','Measure stem height before treatment and daily for seven days. Keep water, light, soil and age comparable; rotate pot positions. Track each plant separately rather than treating repeated measurements as independent plants.'],
 time:'Setup plus daily observations for one to two weeks; grow seedlings in advance.',analysis: [
   "Compare growth from each starting height. What can two plants show? How would you test whether the pattern holds across more plants?",
   "Why should the control receive the same carrier liquid as the treated plant?",
   "A receptor is a molecule that receives a signal. What evidence would you need to connect a height change to a particular receptor or cell process?"
  ],
 limits: "The main comparison follows one plant per condition. Extra plants are available in exploration. Growth can depend on genes and growing conditions. The model shows a whole-plant response. Receptors and the steps inside cells need other kinds of evidence. The displayed growth and treatment amounts are teaching examples.",
 sources:[['University plant physiology investigation','https://schulte.faculty.unlv.edu/BIO442/Lab11DwarfPeas.pdf']]},
 {id:'meiosis-variation',chapter:11,title:'How Crossing Over Creates New Allele Combinations',kind:'meiosis',question: "How does crossing over change the DNA passed into eggs and sperm?",
 inlineLimit: "This model shows one of the 23 human chromosome pairs. A polar body is a small cell that receives chromosomes and little cytoplasm. Follow the one egg and the four sperm as different outcomes.",
 studentProcedure: [
   "For each path, put both copied homologs inside one paper nucleus and one cell. Use two ABCDEFGH strips for one homolog and two abcdefgh strips for the other. Mark the centromere, which holds copied chromosomes together, between B and C.",
   "Exchange matching end sections from one chromatid on each homolog. Choose C-D or F-G. Separate the homologs first. Keep their sister chromatids joined until the second division.",
   "For the egg path, give most cytoplasm to one large cell. The small cells are polar bodies. Use the sperm-entry signal before finishing the second division. Record which chromosome enters the egg.",
   "For the sperm path, begin with a separate cell. Form four similar cells, then model their change into sperm. Record the allele letters in every product."
  ],
 intro: "A diploid cell has two copies of each chromosome type. A matching pair is called homologous chromosomes, or homologs. After DNA is copied, each chromosome has two joined copies called sister chromatids. Crossing over exchanges matching DNA sections between one chromatid from each homolog.",
 conditions:['Egg formation (oogenesis)','Sperm formation (spermatogenesis)'],repeats:1,duration:0,unit:'chromosome products',steps:['Pair homologs within one nucleus','Exchange matching DNA segments','Separate homologs in meiosis I','Separate sisters in meiosis II'],
 setup: "Complete one egg path and one sperm path. Each starts in its own cell with both homologs already in one nucleus. Select a chromatid from each homolog and choose an exchange site. Follow the two divisions. Then compare the cell products.",
 materials:'Original eight-position chromosome strips, two colors of paper, scissors, removable tape, large paper circles for cells and smaller circles for nuclei and polar bodies.',
 physical:['For each pathway, place both replicated homologs inside ONE paper nucleus inside ONE diploid germ cell. Use two identical ABCDEFGH strips for Homolog 1 and two abcdefgh strips for Homolog 2. Mark the centromere between B and C. These are existing chromosomes in one cell, not gametes being combined.','Pair homologs and exchange equal distal segments of one nonsister chromatid from each homolog at C-D or F-G. Separate the homologs in meiosis I, keeping sister chromatids joined.','Egg pathway: divide the cytoplasm unequally into a large secondary oocyte and a small first polar body. Either homolog may enter the larger cell. Model a sperm-entry signal before completing meiosis II; do not add a sperm chromosome to this meiosis model. Place one chromatid in the egg and the other in a polar body. For bookkeeping, allow the first polar body to divide into two smaller polar bodies. It does not always divide in real oogenesis.','Sperm pathway: start again in a separate primary spermatocyte. Follow crossing over and two equal divisions to four spermatids. Model maturation into four sperm without another division. Record the allele combinations and distinguish the one functional egg from polar bodies.'],
 time:'One class period; one egg pathway and one sperm pathway. No three-trial requirement.',analysis: [
   "Where did the DNA exchange happen? Explain why both homologs were already inside one cell.",
   "Follow an exchanged DNA section into a final cell. Compare which chromosomes separate in the first and second divisions.",
   "Explain how the egg path shares the cytoplasm. What starts the final egg division in this human model? Which steps are supplied or simplified?"
  ],
 limits: "This human model shows one chromosome pair and eight gene positions. A human cell has 23 pairs. The two starting cells use the same example letters so you can follow the process. Colors identify chromosomes within one cell. The model shows one exchange. Other exchanges and independent assortment add more variation. A sperm-entry signal starts the final egg division. Fertilization is outside this activity. The first polar body divides in this example. That division can vary in real eggs. Cell sizes and timing are simplified.",
 sources:[['OpenStax Biology 2e: gametogenesis','https://openstax.org/books/biology-2e/pages/43-3-human-reproductive-anatomy-and-gametogenesis'],['OpenStax Anatomy and Physiology 2e: oogenesis and polar bodies','https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system']]},
 {id:'inheritance-ratios',chapter:12,title:'Testing Inheritance Patterns',kind:'corn',question:'How closely do observed kernel traits match an inheritance prediction?',
 inlineLimit: "Keep each ear's counts before combining them. Chance affects small samples. The displayed cross models one suitable color gene. Real corn color can involve more genes.",
 studentProcedure: [
   "Identify the parent genotypes and visible trait. Write a predicted ratio before counting.",
   "Choose a clear region or count the whole ear. Mark your starting point. Keep separate counts for at least three ears.",
   "Combine counts only for matching crosses. Use the expected ratio to calculate expected counts. Compare the results with sample size and chance in mind."
  ],
 intro: "An allele is a version of a gene. A genotype is the allele combination, such as Pp. A phenotype is a visible trait, such as kernel color. In this cross, one P allele is enough for purple color. The parents are both Pp. Chance can make small offspring samples differ.",
 conditions:['Ear A','Ear B','Ear C'],repeats:1,duration:0,unit:'kernels',steps:['Select documented cross','Mark sampling region','Inspect kernel traits'],categories:['Purple','Yellow'],count:48,
 setup: "Predict the purple and yellow proportions from the Pp × Pp cross. Choose the assigned ear and mark a 48-kernel region. Count each color with its tally counter. Pencil marks can help you track kernels you have counted.",
 materials:'Documented monohybrid genetic corn ears, magnifier if useful, counting sheet, removable position marker and calculator. Do not substitute decorative corn with unknown parents.',
 physical:['Obtain ears from a documented cross and identify the trait and parent genotypes. Predict the phenotype ratio before counting.','Choose a systematic region or count the entire ear without removing kernels. Mark the starting position to avoid double counting. Count at least three ears and retain each ear\'s counts.','Pool counts only for comparable crosses. Compute expected counts from the proposed ratio, then calculate chi-square if appropriate; evaluate assumptions and sample size.'],
 time:'One class period; dry ears are reusable.',analysis: [
   "Compare each ear's purple proportion with the combined proportion and the 3:1 prediction. How do the three ears differ?",
   "Calculate chi-square by adding (observed - expected)² / expected for both colors. This number measures the size of the gaps from the prediction. What does your value describe?",
   "How could chance cause a small sample to differ from the predicted ratio? What further evidence would help you judge the model?"
  ],
 limits: "The kernel counts are generated examples. Real corn color can involve several genes. Use this single-gene prediction for a suitable cross with known parents. Chi-square describes the gap between counts and a prediction. Use sample size and other evidence when you judge that gap.",
 sources:[['Genetic corn classroom materials','https://www.carolina.com/plant-genetics/monohybrid-genetics-with-corn-kit/176362.pr']]},
 {id:'linked-genes',chapter:13,title:'Mapping Linked Genes',kind:'flies',question: "How often are the two traits inherited together in this cross?",
 inlineLimit: "Score both body color and wing length. The two markers support a distance estimate. Extra markers are needed to work out a three-gene order. The counts come from a model.",
 studentProcedure: [
   "Use a documented cross with known traits and parent genotypes. Follow the kit's culture and handling directions. A live cross needs advance preparation.",
   "Use the heterozygous female specified for this cross. Male Drosophila normally have no crossing over during meiosis. Keep the parental combinations with your records.",
   "Count both traits in every offspring sample. Record uncertain traits and the total count. Keep vial identities. Calculate recombinants as a percentage of all offspring."
  ],
 intro: "In a testcross, one parent has two different alleles, or gene versions. The other has two recessive copies. Offspring traits help trace the first parent's gene combinations. Parental combinations match the starting cross. Recombinants have a new combination of those alleles.",
 conditions:['Offspring sample A','Offspring sample B','Offspring sample C'],repeats:1,duration:0,unit:'flies',steps:['Read cross record','Place offspring under scope','Focus body and wing traits'],categories:['Gray / long','Dark / short','Gray / short','Dark / long'],count:32,
 setup: "Read the female GL/gl × male gl/gl cross. G gives gray body color and L gives long wings in this model. Gray/long and dark/short match the parental combinations. Inspect both traits on each fly. Tally all four combinations. Marks can help you track counted flies.",
 materials:'Optional documented two-point Drosophila cross kit, culture vials and medium, dissecting microscopes, supplier-approved immobilization equipment, sorting brushes and scoring sheets. A photograph/data investigation can replace live handling.',
 physical:['Use an educational cross with known linked traits and parent genotypes. Follow its culture and handling instructions. Cross timing and selection of virgin females require advance preparation; allow several weeks.','Use heterozygous females for a recombination investigation: male Drosophila do not normally undergo meiotic crossing over. Record the parental combinations from the cross history.','Score offspring for both traits without selecting only unusual flies. Keep vial identity, ambiguous scores and total sample sizes. Estimate recombination percent; two traits estimate distance, not three-gene order.'],
 time:'Virtual first; one scoring class with prepared offspring or several weeks for live crosses.',analysis: [
   "Calculate recombinants divided by total offspring, then multiply by 100. Compare each sample with the combined estimate. Why might they differ?",
   "Multiple exchanges can hide some recombination between far-apart genes. How could this affect a map estimate?",
   "The model uses a heterozygous female with two different allele combinations. Why does the parent's sex matter in this fruit-fly cross?"
  ],
 limits: "These fly drawings and offspring counts are teaching examples. The model uses an 18% chance of recombination. Real survival differences can also affect counts. Two markers give an estimate of the distance between them. Determining the order of three genes needs another marker and more evidence.",
 sources:[['Two-point linkage classroom reference','https://knowledge.carolina.com/labsheets/two-point-linkage-with-drosophila/']]},
 {id:'dna-replication',chapter:14,title:'Extracting DNA from Fruit',kind:'extraction',question:'How does detergent affect material recovered from fruit cells, and what can our observations tell us?',
 intro:'Recover material from fruit cells, compare matched controls, and explain what the evidence supports. Extraction releases existing cell components; it does not create or copy DNA.',
 conditions:['Complete extraction','No detergent control','No fruit blank'],repeats:1,duration:5,interval:1,timeUnit:'minutes',unit:'visibility score (0-3)',steps:['Mash assigned sample','Add extraction mixture','Filter into tube','Layer cold alcohol'],
 setup:'Prepare one complete extraction interactively, then inspect two matched controls prepared by the simulation. Score each sample yourself: 0 none, 1 faint, 2 clear, 3 abundant. Categories are not concentrations. Physical repeats can be pooled across the class.',
 materials:'Strawberries, sealable bags, water, salt, plain dish detergent, filters and funnels, clear tubes, measuring cylinders, cold school-approved ethanol or isopropyl alcohol, goggles and wooden sticks.',
 physical:['Teacher pilot: for one complete extraction use 10 g fruit, 9 mL water, 0.1 g salt and 1 mL plain detergent. For easier measuring, prepare stock with 90 mL water, 10 mL detergent and 1 g salt; use 10 mL per sample. The no-detergent control replaces detergent with an equal volume of water. The no-fruit blank uses the complete mixture without fruit.','Mash fruit consistently, gently mix with the assigned solution, and filter. Transfer 5 mL filtrate to a tube and layer 5 mL cold alcohol. Use the same alcohol type, concentration, volumes and five-minute observation window. Wear goggles, keep alcohol away from flames and heat, and do not taste materials.','Record one sample per condition for the initial comparison. Pool independent classroom repeats to examine variability; retain unexpected results. Use the visibility rubric and descriptive notes. Do not interpret crude precipitate as pure DNA. Follow school disposal rules.'],
 time:'One class period; pilot the recipe and chill alcohol beforehand. One virtual preparation replaces nine repeated preparations.',analysis:['Use observations from the detergent comparison to explain the role of membranes. What does the no-fruit blank test?','Why does twice as much visible material not establish twice as much DNA?','What could explain no visible strands even when DNA was present in the starting cells?'],
 limits:'Illustrative crude extraction, not measured DNA concentration, purity, molecular structure or replication. Virtual controls are prepared by the model. One sample per condition cannot establish variability; repeat physical trials. Classroom observations must not be graded for agreement with simulated results.',
 sources:[['DNA extraction background','https://www.genome.gov/about-genomics/teaching-tools/strawberry-dna-extraction'],['Extraction science and limitations','https://teach.genetics.utah.edu/content/labs/']]},
 {id:'dna-protein',chapter:15,title:'From DNA to Protein',kind:'expression',question:'What evidence links a DNA template and translation to production of a fluorescent protein?',
 inlineLimit: "Fluorescence provides evidence about the reporter protein. RNA needs a separate measurement. Compare virtual numbers on their own scale and classroom brightness on its own scale.",
 studentProcedure: [
   "Use the approved cell-free kit and its supplied directions. Keep reaction volumes and conditions matched.",
   "Prepare the DNA reaction, no-DNA control, and assigned translation-blocked reaction. Follow the kit's timing and handling instructions.",
   "Use the correct light and viewer. Record the signal on the scale available to your class. Keep the controls, source, and scale with every observation."
  ],
 intro: "A cell-free mixture contains cell parts that can make protein outside whole cells. A reporter protein gives a signal that can be detected. Fluorescence is light released after a substance absorbs certain light. Compare the no-DNA control and a reaction with translation blocked.",
 conditions:['Reporter DNA','No DNA control','Reporter DNA + translation inhibitor'],repeats:1,workflowVersion:2,duration:8,interval:2,timeUnit:'hours',unit:'relative fluorescence',steps:['Pipette cell-free mix','Add assigned template or control','Place in incubation rack'],
 setup: "Use the same volume and reaction conditions for all three tubes. Translation is the step that builds an amino acid chain. The blocked reaction contains an inhibitor, a substance that stops or slows that step. Turn on the viewer to inspect the signal.",
 materials:'Educational cell-free expression kit with reporter DNA, negative control and an approved translation-blocking condition, appropriate micropipette and tips, tubes and racks, kit-compatible fluorescence viewer and prescribed incubation/storage equipment.',
 physical:['Select a teaching kit that supports these comparisons; verify its controls, storage and viewer requirements before ordering. Follow the official kit protocol for quantities and preparation rather than substituting model settings.','Prepare one reaction for each available condition for the core comparison, holding volume and incubation conditions constant. Add independent reactions when evaluating reproducibility. If the kit does not supply an approved inhibitor condition, run the two supported conditions and record the difference from the virtual plan.','Observe under consistent lighting and camera/viewer settings at the kit-specified intervals. Use instrument readings if available; otherwise record a defined ordinal brightness score and label it as such.'],
 time:'Kit-dependent: a setup class plus observations after incubation.',analysis: [
   "What background signal appears in the no-DNA control? Use your recorded values.",
   "How does the reaction with translation blocked help you judge the DNA reaction?",
   "The viewer measures a protein signal. What other evidence would you need to measure mRNA directly?"
  ],
 limits: "The main comparison uses one reaction per condition. Extra trials are available in exploration. The brightness values are arbitrary units, a scale for this model. Real signals also depend on protein folding and time. Transcription and translation need separate tests to measure each step. Classroom brightness categories use a different scale from the virtual numbers.",
 sources:[['Optional cell-free classroom kit','https://www.minipcr.com/product/biobits-central-dogma/']]},
 {id:'lac-operon',chapter:16,title:'Switching Gene Expression On and Off',kind:'regulation',question:'How can cells carry a reporter gene without visibly expressing it?',
 inlineLimit: "This is an arabinose-controlled reporter. The cells are supplied already prepared. Check growth and fluorescence as two separate observations.",
 studentProcedure: [
   "Use the approved classroom kit and the prepared cells supplied by your teacher. Read the plate labels, including DNA, antibiotic, and sugar conditions.",
   "Apply the assigned cells and spread them using the approved method. Keep the lids and plate identities with the samples. Follow the kit's handling and incubation directions.",
   "Observe growth, then fluorescence with the approved viewer. Keep both observations. Compare only plates that test the question you are answering."
  ],
 intro: "Selection and induction ask different questions. Selection tests which cells can grow under the plate conditions. Induction is a signal turning on gene activity. This activity uses an arabinose-controlled reporter. Arabinose is a sugar signal. Compare growth and the reporter's light signal.",
 conditions:['No plasmid / nutrient agar','No plasmid / antibiotic','Reporter plasmid / antibiotic','Reporter plasmid / antibiotic + arabinose'],repeats:1,duration:24,interval:6,timeUnit:'hours',unit:'visible colonies',steps:['Label assigned plate','Transfer prepared cells','Spread and close plate','Place in incubator'],
 setup: "Use the prepared cells. Read each plate label before adding or spreading cells. Incubate the plate, then use the viewer. Record growth and fluorescence separately. Fluorescence is light released under the viewer's light.",
 materials:'Educational arabinose-controlled fluorescent reporter kit or teacher-prepared approved reporter cultures, appropriate agar plates and controls, sterile loops and pipettes, incubator or kit-approved room-temperature schedule, compatible viewer, approved culture disposal supplies.',
 physical:['Use only a school-approved educational strain and kit protocol. Teacher prepares cultures/plates and follows the supplier\'s incubation and disposal requirements. If transforming cells, use the official transformation protocol and include its controls.','Compare no-plasmid cells on nonselective and antibiotic plates with reporter-bearing cells on antibiotic plates with and without arabinose. Match inoculum and handling; replicate plates when supplies allow.','Observe growth and fluorescence separately after the specified incubation. Keep plates closed during student observation; use the viewer\'s protective shield. Document confluent growth rather than inventing a colony count.'],
 time:'Setup class and observations after incubation, commonly on a following day.',analysis: [
   "Which plate comparison tests growth with the antibiotic? Which tests the arabinose signal? Use your growth and light observations.",
   "A plate has growth but little light. What other explanations should you check before deciding whether a reporter gene is present?",
   "How would a wrong plate label affect your claim? Give one example using these conditions."
  ],
 limits: "This reporter responds to arabinose. The activity starts with prepared cells. DNA uptake and transformation need other procedures. Colony visibility is simplified and uses a faster clock. One plate per condition shows a comparison. More separate plates are needed to study variation.",
 sources:[['Optional pGLO protocol and equipment','https://commerce.bio-rad.com/webroot/web/pdf/lse/literature/1660033_EDU.pdf']]},
 {id:'gel-electrophoresis',chapter:17,title:'Separating DNA Fragments',kind:'gel',question:'How can migration distance help estimate DNA fragment size and compare samples?',
 inlineLimit: "Use the ladder in this gel. Size changes follow a curved scale, so halfway in distance need not mean halfway in base pairs. A similar pattern supports a comparison. Sample identity needs more evidence.",
 studentProcedure: [
   "Use the approved DNA samples, ladder, gel, buffer, stain, and power supply. Follow the equipment instructions and eye-protection rules.",
   "Label every lane and load each assigned sample into its own well. Confirm the electrode directions before switching on power.",
   "Switch off and disconnect power before handling the gel. Stain and view it using the approved method. Compare unknown bands with the ladder and record uncertainty in the size estimates."
  ],
 intro: "An electric field moves DNA fragments through a gel. In this model, shorter fragments travel farther. A DNA ladder contains fragments of known sizes. Compare each unknown band with the ladder on the same gel. Fragment size is measured in base pairs, or bp.",
 conditions:['Comparison gel'],repeats:1,workflowVersion:2,duration:30,interval:5,timeUnit:'minutes',unit:'base pairs',steps:['Cast gel and cover with buffer','Load ladder and three samples','Connect red lead beyond the wells'],
 setup: "Load the ladder, reference A, reference B, and unknown into their labeled wells. Connect the positive lead and run the gel. Switch off the power and stain the gel. Use the ruler and ladder to estimate all three unknown fragment sizes.",
 materials:'Gel chamber and power supply, casting tray and comb, agarose, buffer, prepared DNA fragments and ladder, loading dye, micropipette and tips, approved stain, heating equipment, ruler, and viewer if required by the stain.',
 physical:['Use prepared DNA and the supplier-recommended agarose percentage, buffer, voltage and stain. A visible stain avoids a fluorescence viewer. Teacher prepares hot agarose and allows it to set before use.','Load ladder, two references and an unknown in separate wells. Keep wells at the negative end so DNA travels toward the positive electrode. Close the lid before energizing. Never touch buffer or open the chamber with power connected.','Stop and disconnect power before staining or handling the gel. Measure distance from each well to its bands. Plot ladder distance against log10(base pairs) and interpolate unknown sizes within its calibrated range. Repeat if supplies allow.'],
 time:'One to two class periods, depending on casting and staining method.',analysis: [
   "Estimate the three unknown sizes from the ladder. Which reference pattern is most similar? Give the evidence for your comparison.",
   "Why should each gel include a ladder? How could run conditions affect a band's position?",
   "What further evidence would you need before using a similar band pattern to identify a sample?"
  ],
 limits: "This model uses example band patterns and a simplified size-distance rule. Smaller fragments travel farther within the modeled range. Real bands are affected by DNA shape, spreading, and sample amount. One gel gives a comparison. The voltage and faster clock are teaching settings. Follow the equipment protocol for a physical gel.",
 sources:[['Classroom electrophoresis reference','https://www.bio-rad.com/webroot/web/pdf/lse/literature/4006096G.pdf']]}
].map(c=>({...c,learningPlan:learningDesign[c.id],version:c.workflowVersion||(c.kind==='meiosis'?3:1),repeats:c.repeats||1,timeUnit:c.timeUnit||'',interval:c.interval||1}));
export const sordariaExtension={...{id:'sordaria-crossing-over',chapter:11,title:'Observing Crossing Over',kind:'asci',question:'What can ordered spore patterns reveal about crossing over?',
 inlineLimit: "Use complete rows with eight visible spores. This estimate concerns a gene and its centromere. Two fields sample one prepared cross.",
 studentProcedure: [
   "Find complete ordered asci on the prepared slide. Use enough magnification to see all eight spores.",
   "Choose fields using a consistent rule. Count complete rows with four spores of each color. Record unclear or excluded rows separately.",
   "Keep the spore order when classifying 4:4, 2:4:2, and 2:2:2:2 patterns. Count two fields, then combine them. Use half the second-division percentage for the simple map estimate."
  ],
 intro: "An ascus is a sac holding an ordered row of spores. Asci is the plural. In this Sordaria cross, each complete ascus has eight spores, four of each color. Read their color order from one end to the other.",
 conditions:['Field A','Field B'],repeats:1,duration:0,unit:'asci',steps:['Load prepared cross slide','Illuminate specimen','Focus ordered asci'],categories:['4:4','2:4:2','2:2:2:2'],count:12,
 setup: "Classify every numbered ascus once. Keep the spore order. Reversing the whole row leaves the same pattern type. Review the classifications before collecting each field. Two fields let you compare samples before combining counts.",
 materials:'Prepared Sordaria cross slide with intact ordered asci or suitable educational cross kit, compound microscope, scoring sheet. Use prepared material for the basic route.',
 physical:['Inspect the prepared cross at low power, then use sufficient magnification to distinguish the eight spores. Follow supplier preparation instructions if using a kit.','Choose fields without selecting for an interesting pattern. Count intact eight-spore asci containing four spores of each color; record excluded or ambiguous asci separately.','Classify 4:4, 2:4:2 and 2:2:2:2 arrangements in at least two non-overlapping fields. Aim for a larger pooled sample than the virtual demonstration. Estimate gene-to-centromere distance as 0.5 x percent second-division segregation.'],
 time:'One class with prepared specimens; live culture preparation is an optional advanced route.',analysis: [
   "The 2:4:2 and 2:2:2:2 rows are second-division patterns. Compare their percentages in the two fields and the combined sample. Explain one source of variation.",
   "For this cross, map distance equals half the second-division percentage. Why does the calculation include one-half?",
   "How could leaving out unclear asci or missing multiple exchanges affect the estimate?"
  ],
 limits: "The drawings show ordered eight-spore rows. The calculation estimates distance from a gene to the centromere, the chromosome region that holds sister copies together. The simple estimate can miss multiple exchanges. Two fields on one slide sample the same cross.",
 sources:[['Suitable Sordaria specimens','https://www.carolina.com/fungi/sordaria-genetics-class-biokit/FAM_155847.pr']]},learningPlan:learningDesign['sordaria-crossing-over'],version:1,timeUnit:'',interval:1};
export const extendedById=Object.fromEntries([...extendedLabs,sordariaExtension].map(c=>[c.id,c]));
