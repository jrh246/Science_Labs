import {extendedById} from './investigations/extended-content.js';
// Stable IDs are independent of titles, textbook editions, and future assignment IDs.
export const units = [
  ['chemistry-of-life','The Chemistry of Life','Explore the molecules and interactions that make life possible.',1,3],
  ['the-cell','The Cell','Investigate the structures, energy, and processes inside living cells.',4,10],
  ['genetics','Genetics','Follow information from DNA to traits and explore how it is inherited.',11,17],
  ['evolution','Evolutionary Processes','Use evidence to investigate how populations change over time.',18,20],
  ['biological-diversity','Biological Diversity','Explore the remarkable variety of life and its shared patterns.',21,29],
  ['plant-structure-function','Plant Structure and Function','Discover how plants grow, transport materials, and reproduce.',30,32],
  ['animal-structure-function','Animal Structure and Function','Connect animal structures with the systems that sustain life.',33,43],
  ['ecology','Ecology','Investigate populations, ecosystems, and biodiversity.',44,47],
].map(([id,title,description,start,end],i)=>({id,title,description,start,end,number:i+1,subjectId:'biology'}));
const proposals = [
['seed-germination','Seed Germination','Design a controlled investigation of the conditions seeds need to germinate.','The Study of Life'],
['water-surface-tension','Water and Surface Tension','Compare water droplets and investigate cohesion and molecular interactions.','The Chemical Foundation of Life'],
['food-macromolecules','Identify an Unknown Food Sample','Use indicator tests and controls to investigate biological macromolecules.','Biological Macromolecules'],
['cell-microscopy','Cells Under the Microscope','Compare cell structures and estimate size using microscopy.','Cell Structure'],
['osmosis-homeostasis','Osmosis and Cell Homeostasis','Use dialysis tubing as a model cell to investigate water movement across membranes.','Structure and Function of Plasma Membranes'],
['enzyme-activity','What Affects Enzyme Activity?','Investigate how environmental conditions change enzyme reaction rates.','Metabolism'],
['yeast-fermentation','Yeast Fermentation and Fuel Sources','Compare carbon dioxide production as yeast uses different sugars.','Cellular Respiration'],
['light-photosynthesis','Light and Photosynthesis','Investigate photosynthetic activity using floating leaf disks.','Photosynthesis'],
['cell-signaling','When Does a Cell Respond?','Model receptors, signal amplification, and blocked signaling pathways.','Cell Communication'],
['mitosis','Measuring Mitosis','Count cell-cycle stages and estimate their relative durations.','Cell Reproduction'],
['meiosis-variation','How Meiosis Generates Variation','Track chromosomes through crossing over and independent assortment.','Meiosis and Sexual Reproduction'],
['inheritance-ratios','Investigating Inheritance Ratios','Compare observed offspring traits with genetic predictions.','Mendel’s Experiments and Heredity'],
['linked-genes','Mapping Linked Genes','Use recombination frequencies to estimate gene order and distances.','Modern Understandings of Inheritance'],
['dna-replication','How Does DNA Replicate?','Evaluate evidence for competing models of DNA replication.','DNA Structure and Function'],
['dna-protein','From DNA to Protein','Trace transcription, translation, and the effects of mutations.','Genes and Proteins'],
['lac-operon','Investigating the Lac Operon','Model how nutrient availability influences gene regulation.','Gene Expression'],
['gel-electrophoresis','Identify a Sample with Gel Electrophoresis','Compare DNA band patterns and estimate fragment sizes.','Biotechnology and Genomics'],
['natural-selection','Natural Selection in Changing Habitats','Investigate how food availability affects inherited traits across generations.','Evolution and the Origin of Species'],
['genetic-drift','Genetic Drift and Natural Selection','Compare allele frequencies in populations of different sizes.','The Evolution of Populations'],
['phylogenetic-trees','Build a Phylogenetic Tree','Use morphological and sequence evidence to infer evolutionary relationships.','Phylogenies and the History of Life'],
['viral-spread','Modeling Viral Spread','Investigate contact networks and transmission using a model outbreak.','Viruses'],
['unknown-prokaryote','Investigate an Unknown Prokaryote','Combine microscopy and metabolic evidence to classify unknown samples.','Prokaryotes: Bacteria and Archaea'],
['protist-movement','Protist Structure and Movement','Compare locomotion and cellular structures in microscopic organisms.','Protists'],
['fungal-structures','Fungal Structures and Reproduction','Examine fungi and compare their reproductive structures.','Fungi'],
['moss-fern','Moss and Fern Life Cycles','Trace gametophyte and sporophyte stages in seedless plants.','Seedless Plants'],
['seed-dispersal','Seed Dispersal Designs','Test how seed structures and wind affect dispersal distance.','Seed Plants'],
['animal-body-plans','Classifying Animal Body Plans','Compare symmetry, tissues, and body cavities using evidence.','Introduction to Animal Diversity'],
['invertebrate-key','Build an Invertebrate Identification Key','Create and test a branching key using observable traits.','Invertebrates'],
['vertebrate-limbs','Vertebrate Limb Adaptations','Measure homologous structures and investigate form and function.','Vertebrates'],
['transpiration','What Affects Transpiration?','Compare plant water loss under different environmental conditions.','Plant Form and Physiology'],
['soil-water','Which Soils Retain Water?','Compare drainage and water retention across soil compositions.','Soil and Plant Nutrition'],
['flower-pollination','Flower Structure and Pollination','Explore reproductive structures and trace pollination through fertilization.','Plant Reproduction'],
['body-heat','Body Size and Heat Exchange','Use physical models to relate surface area and volume to cooling.','The Animal Body: Basic Form and Function'],
['starch-digestion','Investigating Starch Digestion','Explore how digestive conditions affect starch breakdown.','Animal Nutrition and the Digestive System'],
['reaction-time','Investigating Reaction Time','Analyze repeated measurements of response time and variability.','The Nervous System'],
['blind-spot','Map Your Visual Blind Spot','Use visual targets to investigate sensory perception.','Sensory Systems'],
['glucose-feedback','Modeling Blood Glucose Feedback','Track glucose and hormone responses in a feedback model.','The Endocrine System'],
['muscle-levers','Muscles, Levers, and Movement','Investigate how attachment points change the force needed to lift a load.','The Musculoskeletal System'],
['breathing','Pressure, Volume, and Breathing','Use a lung model to connect pressure changes with airflow.','The Respiratory System'],
['blood-flow','Vessel Diameter and Flow','Investigate how vessel size and pressure affect fluid flow.','The Circulatory System'],
['nephron','Modeling the Nephron','Track filtration, reabsorption, and secretion to explain urine composition.','Osmotic Regulation and Excretion'],
['immune-memory','Investigating Immune Memory','Compare primary and secondary immune responses.','The Immune System'],
['embryonic-development','Early Embryonic Development','Identify cleavage, gastrulation, and germ-layer formation.','Animal Reproduction and Development'],
['microhabitats','Investigating Microhabitats','Compare environmental conditions and organism distributions.','Ecology and the Biosphere'],
['population-estimates','Estimating Population Size','Test mark–recapture estimates and their sampling assumptions.','Population and Community Ecology'],
['food-web-energy','Energy Through a Food Web','Track energy budgets and compare transfer between trophic levels.','Ecosystems'],
['reserve-design','Design a Biodiversity Reserve','Compare habitat protection and connectivity under a fixed budget.','Conservation Biology and Biodiversity'],
];
export const labs = proposals.map(([id,title,summary,chapterTitle],i)=>({
  id,title,summary:summary+([6,7].includes(i)?' Includes a photosynthesis and cellular respiration equation-building cutout activity.':''),chapter:i+1,chapterTitle,subjectId:'biology',
  unitId:units.find(u=>i+1>=u.start&&i+1<=u.end).id,
  type:'lab',status:[4,6,7,9].includes(i)?'available':'planned',modes:[6,7,9].includes(i)?['Virtual','Classroom']:i===4?['Virtual']:[],
  version:1, launchUrl:i===4?'./lab.html':[6,7,9].includes(i)?`./investigation.html?lab=${id}`:null,
  resources:[4,6,7,9].includes(i)?[{label:'Student worksheet (PDF)',url:`./resources/${id}-worksheet.pdf`},{label:'Teacher guide (PDF)',url:`./resources/${id}-teacher-guide.pdf`}]:[],
})).map(lab=>{
 if(lab.id==='embryonic-development')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=embryonic-development',resources:[{label:'Student worksheet (PDF)',url:'./resources/embryonic-development-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/embryonic-development-teacher-guide.pdf'}]};
 if(lab.id==='microhabitats')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=microhabitats',resources:[{label:'Student worksheet (PDF)',url:'./resources/microhabitats-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/microhabitats-teacher-guide.pdf'}]};
 if(lab.id==='population-estimates')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=population-estimates',resources:[{label:'Student worksheet (PDF)',url:'./resources/population-estimates-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/population-estimates-teacher-guide.pdf'}]};
 if(lab.id==='food-web-energy')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=food-web-energy',resources:[{label:'Student worksheet (PDF)',url:'./resources/food-web-energy-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/food-web-energy-teacher-guide.pdf'}]};
 if(lab.id==='reserve-design')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=reserve-design',resources:[{label:'Student worksheet (PDF)',url:'./resources/reserve-design-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/reserve-design-teacher-guide.pdf'}]};
 if(lab.id==='immune-memory')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=immune-memory',resources:[{label:'Student worksheet (PDF)',url:'./resources/immune-memory-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/immune-memory-teacher-guide.pdf'}]};
 if(lab.id==='nephron')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=nephron',resources:[{label:'Student worksheet (PDF)',url:'./resources/nephron-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/nephron-teacher-guide.pdf'}]};
 if(lab.id==='blood-flow')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=blood-flow',resources:[{label:'Student worksheet (PDF)',url:'./resources/blood-flow-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/blood-flow-teacher-guide.pdf'}]};
 if(lab.id==='breathing')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=breathing',resources:[{label:'Student worksheet (PDF)',url:'./resources/breathing-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/breathing-teacher-guide.pdf'}]};
 if(lab.id==='muscle-levers')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=muscle-levers',resources:[{label:'Student worksheet (PDF)',url:'./resources/muscle-levers-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/muscle-levers-teacher-guide.pdf'}]};
 if(lab.id==='glucose-feedback')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=glucose-feedback',resources:[{label:'Student worksheet (PDF)',url:'./resources/glucose-feedback-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/glucose-feedback-teacher-guide.pdf'}]};
 if(lab.id==='blind-spot')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=blind-spot',resources:[{label:'Student worksheet (PDF)',url:'./resources/blind-spot-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/blind-spot-teacher-guide.pdf'}]};
 if(lab.id==='reaction-time')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=reaction-time',resources:[{label:'Student worksheet (PDF)',url:'./resources/reaction-time-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/reaction-time-teacher-guide.pdf'}]};
 if(lab.id==='starch-digestion')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=starch-digestion',resources:[{label:'Student worksheet (PDF)',url:'./resources/starch-digestion-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/starch-digestion-teacher-guide.pdf'}]};
 if(lab.id==='body-heat')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=body-heat',resources:[{label:'Student worksheet (PDF)',url:'./resources/body-heat-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/body-heat-teacher-guide.pdf'}]};
 if(lab.id==='flower-pollination')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=flower-pollination',resources:[{label:'Student worksheet (PDF)',url:'./resources/flower-pollination-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/flower-pollination-teacher-guide.pdf'}]};
 if(lab.id==='soil-water')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=soil-water',resources:[{label:'Student worksheet (PDF)',url:'./resources/soil-water-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/soil-water-teacher-guide.pdf'}]};
 if(lab.id==='transpiration')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=transpiration',resources:[{label:'Student worksheet (PDF)',url:'./resources/transpiration-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/transpiration-teacher-guide.pdf'}]};
 if(lab.id==='vertebrate-limbs')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=vertebrate-limbs',resources:[{label:'Student worksheet (PDF)',url:'./resources/vertebrate-limbs-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/vertebrate-limbs-teacher-guide.pdf'}]};
 if(lab.id==='invertebrate-key')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=invertebrate-key',resources:[{label:'Student worksheet (PDF)',url:'./resources/invertebrate-key-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/invertebrate-key-teacher-guide.pdf'}]};
 if(lab.id==='animal-body-plans')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=animal-body-plans',resources:[{label:'Student worksheet (PDF)',url:'./resources/animal-body-plans-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/animal-body-plans-teacher-guide.pdf'}]};
 if(lab.id==='seed-dispersal')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=seed-dispersal',resources:[{label:'Student worksheet (PDF)',url:'./resources/seed-dispersal-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/seed-dispersal-teacher-guide.pdf'}]};
 if(lab.id==='moss-fern')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=moss-fern',resources:[{label:'Student worksheet (PDF)',url:'./resources/moss-fern-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/moss-fern-teacher-guide.pdf'}]};
 if(lab.id==='fungal-structures')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=fungal-structures',resources:[{label:'Student worksheet (PDF)',url:'./resources/fungal-structures-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/fungal-structures-teacher-guide.pdf'}]};
 if(lab.id==='protist-movement')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=protist-movement',resources:[{label:'Student worksheet (PDF)',url:'./resources/protist-movement-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/protist-movement-teacher-guide.pdf'}]};
 if(lab.id==='unknown-prokaryote')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=unknown-prokaryote',resources:[{label:'Student worksheet (PDF)',url:'./resources/unknown-prokaryote-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/unknown-prokaryote-teacher-guide.pdf'}]};
 if(lab.id==='viral-spread')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=viral-spread',resources:[{label:'Student worksheet (PDF)',url:'./resources/viral-spread-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/viral-spread-teacher-guide.pdf'}]};
 if(lab.id==='phylogenetic-trees')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=phylogenetic-trees',resources:[{label:'Student worksheet (PDF)',url:'./resources/phylogenetic-trees-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/phylogenetic-trees-teacher-guide.pdf'}]};
 if(lab.id==='genetic-drift')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=genetic-drift',resources:[{label:'Student worksheet (PDF)',url:'./resources/genetic-drift-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/genetic-drift-teacher-guide.pdf'}]};
 if(lab.id==='natural-selection')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=natural-selection',resources:[{label:'Student worksheet (PDF)',url:'./resources/natural-selection-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/natural-selection-teacher-guide.pdf'}]};
 if(lab.id==='food-macromolecules')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=food-macromolecules',resources:[{label:'Student worksheet (PDF)',url:'./resources/food-macromolecules-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/food-macromolecules-teacher-guide.pdf'}]};
 if(lab.id==='water-surface-tension')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=water-surface-tension',resources:[{label:'Student worksheet (PDF)',url:'./resources/water-surface-tension-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/water-surface-tension-teacher-guide.pdf'}]};
 if(lab.id==='seed-germination')return {...lab,status:'available',modes:['Virtual'],virtualOnly:true,launchUrl:'./investigation.html?lab=seed-germination',resources:[{label:'Student worksheet (PDF)',url:'./resources/seed-germination-worksheet.pdf'},{label:'Teacher guide (PDF)',url:'./resources/seed-germination-teacher-guide.pdf'}]};
 const c=extendedById[lab.id];
 return c?{...lab,title:c.title,summary:c.question,status:'available',modes:['Virtual','Classroom'],launchUrl:`./investigation.html?lab=${lab.id}`,resources:[{label:'Student worksheet (PDF)',url:`./resources/${lab.id}-worksheet.pdf`},{label:'Teacher guide (PDF)',url:`./resources/${lab.id}-teacher-guide.pdf`}]}:lab;
});
labs.push({id:'genetic-information',title:'DNA to RNA to Protein',summary:'Work inside a eukaryotic cell: replicate DNA, transcribe and process RNA, then translate codons into an amino-acid chain. Track where each process happens.',chapter:15,chapterTitle:'Genes and Proteins',subjectId:'biology',unitId:'genetics',type:'lab',status:'available',modes:['Virtual'],virtualOnly:true,version:1,launchUrl:'./investigation.html?lab=genetic-information',resources:[{label:'Teacher guide (PDF)',url:'./resources/genetic-information-teacher-guide.pdf'}]});
export const labPath = lab => `/science/biology/${lab.unitId}/${lab.id}`;
export function searchCatalog(query,{availableOnly=false}={}) {
  const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return labs.filter(lab=>(!availableOnly||lab.status==='available')&&terms.every(term=>
    `${lab.title} ${lab.summary} biology science chapter ${lab.chapter} ${lab.chapterTitle} ${units.find(u=>u.id===lab.unitId).title}`.toLowerCase().includes(term)));
}
