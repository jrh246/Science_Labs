// Repetition needs an explicit instructional purpose; three trials are not a default.
export const learningDesign = {
 'genetic-information':{note:'Practice one short window on each DNA template, one RNA codon and three distinct amino-acid codons. The model completes repetitive sequence extension. Every step distinguishes purpose, molecule or location.'},
 'osmosis-homeostasis': {note:'Keep all five conditions: they compare concentration gradients, including equal concentrations at both zero and nonzero sugar levels.'},
 'cell-microscopy': {reuseSetup:true,note:'Measure two cells from each of three specimen types. Their sizes can differ; two cells do not establish a tissue-wide average. After the first measurement, reuse the calibrated microscope and measure each new cell yourself.'},
 'light-photosynthesis': {reuseSetup:true,note:'Keep three independent cups per light level to compare ET50 variation. The ten disks within one cup are not ten independent trials. After your first completed trial, use a fresh sample prepared by the same procedure instead of repeating every syringe movement.'},
 'yeast-fermentation': {reuseSetup:true,note:'Keep three fresh mixtures per sugar treatment: overlapping rates help test whether a single apparent winning sugar is convincing. After your first trial, reuse the setup procedure; still select the assigned fuel and observe every new mixture.'},
 'mitosis': {reuseSetup:true,note:'Keep two non-overlapping fields and classify all 40 cells. A rare stage may be absent from one small field. Move to the second field using the same microscope settings instead of repeating instrument setup.'},
 'enzyme-activity': {reuseSetup:true,note:'The core comparison uses one reaction at each of three temperatures. Use the time series to compare initial rates. One reaction per temperature cannot estimate variation; collect additional trials in exploration or pool classroom repeats when studying reliability.'},
 'cell-signaling': {reuseSetup:true,note:'The core model follows one control plant and one treated plant over time. Compare growth from each starting height. Daily readings are repeated measures, not independent plants. Use independent classroom plants or extra exploration for claims about variability.'},
 'meiosis-variation': {note:'Complete one egg pathway and one sperm pathway. These are distinct biological outcomes, not duplicate trials. Follow the exchanged segments and cell boundaries in each.'},
 'inheritance-ratios': {note:'Keep three ears, with 48 kernels per sampled region. Compare each ear with the pooled ratio to examine chance variation; do not expect every small sample to equal exactly 3:1.'},
 'linked-genes': {reuseSetup:true,note:'Keep three offspring samples, with 32 flies each. Compare sample recombination percentages with the pooled estimate. More counted offspring improve precision; extra repetitions of loading and focusing do not add new evidence.'},
 'dna-replication': {note:'Prepare one extraction and compare its observations with two matched controls. Repeating the same recipe three times is not required for the core lesson about release, separation, and evidence limits.'},
 'dna-protein': {reuseSetup:true,note:'Compare one reporter reaction with one no-DNA control and one translation-blocked reaction. Each tests a different explanation. Repeating each reaction three times is optional when the question concerns reproducibility.'},
 'lac-operon': {reuseSetup:true,note:'Keep all four plates: selection and induction require different controls. Spread each plate once in the model. After the first completed plate, prepare subsequent plates with the matched procedure; still inspect growth and fluorescence separately.'},
 'gel-electrophoresis': {note:'One gel contains the ladder, two references, and the unknown. Estimate all three unknown bands. An identical second gel is optional; use exploration to test a changed voltage or revisit measurement uncertainty.'},
 'sordaria-crossing-over': {reuseSetup:true,note:'Keep two non-overlapping fields and classify all 24 asci. Compare field estimates before pooling. Reuse the microscope setup, but inspect every spore pattern; fields from one slide are not independent biological crosses.'},
 'matter-cycle': {note:'Repeated molecule cards represent coefficients and conservation of atoms. Keep the required copies; placing them is the evidence for balancing the equations.'},
};

export function canReuseSetup(c,s){
 return Boolean(learningDesign[c.id]?.reuseSetup&&s.run.prepared===0&&s.run.time===0&&s.records.some(row=>row.source==='virtual'));
}
export function matchedSetup(c,r){
 if(r.prepared!==0||r.time!==0)return r;
 return {...r,prepared:c.steps.length,preparation:'matched',...(c.kind==='microscope'?{objective:40,focus:50,rulerMeasured:false}:{} )};
}
export function samplingSummaries(c,rows){
 if(!['corn','flies','asci'].includes(c.kind))return [];
 return rows.map(row=>{
  const total=row.values.reduce((a,b)=>a+b,0);
  const numerator=c.kind==='corn'?row.values[0]:c.kind==='flies'?row.values[2]+row.values[3]:row.values[1]+row.values[2];
  return {condition:row.condition,source:row.source,total,percent:total?100*numerator/total:null,label:c.kind==='corn'?'purple':c.kind==='flies'?'recombinant':'second-division patterns'};
 });
}
