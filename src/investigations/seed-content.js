// Authored English bundle. IDs, observations, and student writing never depend on display text.
export const seedContent = {
 id:'seed-germination',version:1,locale:'en',availableLocales:['en'],title:'Seed Germination',
 question:'How does water affect the start of seed growth?',
 intro:'Germination is the start of growth from a seed. In this investigation, count a seed as germinated when its first root has come out of the seed coat. Swelling alone does not count.',
 goals:[
  {id:'controlled-comparison',text:'Design a fair test of water.',evidence:'Choose one damp dish and one dry control. Explain what stays the same.'},
  {id:'observe-growth',text:'Identify germination and compare observations over time.',evidence:'Select seeds with roots on days 2 and 5. Compare the counts and percentages.'},
  {id:'evidence-limits',text:'Use evidence without overstating what the test shows.',evidence:'Support a conclusion with your data and explain why more dishes would be needed.'}
 ],
 prediction:'Required before setup: Which dish do you think will have more germinated seeds by day 5? Explain why.',
 design:'Required before setup: What will you change, what will you count, and what will you keep the same?',
 sharedConditions:'Both dishes use 10 bean seeds from the same model seed batch, the same paper, air, light, and a temperature of 22 °C. Only the added water differs.',
 sampleNote:'Ten seeds help you see differences among seeds in one dish. They are not ten independent dishes. Days 2 and 5 are observations of the same seeds, not new trials.',
 limits:'This is a teaching model, not data from a real seed test. Time is shortened. The damp paper stays moist; drying, mold, and changes in oxygen are not modeled. Root sizes are enlarged so you can count them. Real seed batches can differ. One dish per condition cannot show how repeatable the result is or prove a rule for all seeds.',
 explanations:[
  {id:'conclusion',prompt:'Compare your prediction with the results. Use the day 5 counts or percentages from both dishes to explain your conclusion.'},
  {id:'fair-test',prompt:'Why did you keep the seed batch, temperature, light, and air the same? Explain what the dry control helps you test.'},
  {id:'limits',prompt:'Do these two dishes prove that all seeds will give the same result? Explain one limit and how you would improve the investigation.'}
 ],
 checks:[
  {id:'root-evidence',prompt:'Which observation counts as germination in this investigation?',correct:'root',choices:[['swelling','The seed looks larger, but no root is visible.'],['root','A root has come out of the seed coat.'],['green','The seed coat has changed color.']],feedback:'A visible root is the sign used here. Water uptake may cause swelling before a root appears.'},
  {id:'control',prompt:'What does the dry dish help you investigate?',correct:'water',choices:[['all','Whether every kind of seed needs exactly 5 mL of water.'],['water','How added water affects this batch under the conditions kept the same.'],['light','Whether light is needed, even though both dishes receive the same light.']],feedback:'The dishes differ in added water. This comparison does not test light, every species, or an exact water requirement.'}
 ],
 sources:[
  {title:'University of Illinois Extension: Germination',url:'https://web.extension.illinois.edu/gpe/case3/c3facts3.html'},
  {title:'University of Florida / Kentucky / Texas A&M: Seed germination',url:'https://propg.ifas.ufl.edu/04-seeds/03-germination/04-seedsgermination-germination.html'}
 ],
 teacher:{
  purpose:'Students distinguish water uptake from visible root emergence, construct a one-variable comparison, and support a limited conclusion with observations.',
  rationale:'Use two dishes, not three repeated setups. Ten seeds within a dish illustrate variation among seeds; they are subsamples. Two days reveal change over time without pretending that they are independent trials.',
  mode:'Virtual only. The water doses, five-day clock, and roots are illustrative model choices, not a validated classroom growing protocol.',
  guidance:'Accept any reasoned prediction. Assess written explanations separately from checked selections. Do not turn a corrected count into an independent correct first attempt. Ask students why swelling alone is insufficient evidence, why matching conditions matters, and why another independent dish would add information.',
  extension:'For a later physical investigation, select a seed-specific protocol with teacher supervision. Plan independent dishes per condition and sufficient time. Do not eat laboratory seeds; wash hands and follow school guidance for mold and allergies. Physical protocol and student comprehension review remain pending.'
 }
};
