import {platformReport} from '../platform/runtime-bridge.js';
import {attachInvestigationEvidence} from './report-evidence.js';
import {stages} from './content.js';
import {times,tally,stageStats,et50,mean,completedData} from './model.js';
import {sequence,mapping,chiSquare} from './extended-model.js';
import {reportSnapshot,section,paragraph,response,table} from './student-report.js';

const fixed=(value,digits=2)=>Number.isFinite(value)?value.toFixed(digits):null;
const source=value=>value==='classroom'?'Classroom observation':'Virtual model';
const timedObservation=c=>['enzyme','plant','expression','regulation'].includes(c.kind);
const writing=(prediction,design,questions,answers)=>[
 section('Prediction and investigation design',response('Prediction',prediction),response('Investigation design',design)),
 section('Your explanations',...questions.map((q,i)=>response(`${i+1}. ${q}`,answers[i])))
];

export function coreStudentReport(c,s,options={}){
 const [plan,explanations]=writing(s.notes.prediction,s.notes.design,c.questions,s.notes.answers),observations=[];
 if(c.kind==='mitosis'){
  const counts=c.conditions.map((cond,i)=>s.sources[i]==='classroom'?(s.counts[cond.id]||stages.map(()=>0)):tally(s.classifications[cond.id]||[]));
  const totals=stages.map((_,i)=>counts.reduce((n,a)=>n+a[i],0)),n=totals.reduce((a,b)=>a+b,0);
  observations.push(section('Cell-stage counts',paragraph(`Counts retain your classifications. ${n} cells classified. Cycle duration is assumed to be ${s.cycleHours} hours; it was not measured in this lab.`),
   paragraph('Totals include only classifications and counts recorded so far.'),table(['Stage',...c.conditions.map((cond,i)=>`${cond.label} (${s.sources[i]})`),'Total','Percent','Estimated hours'],stageStats(totals,s.cycleHours).map((row,i)=>[row.stage,...counts.map((a,j)=>(s.sources[j]==='classroom'?Boolean(s.counts[c.conditions[j].id]):s.classifications[c.conditions[j].id]?.some(Number.isInteger))?a[i]:null),n?row.count:null,n?fixed(row.percent,1)+'%':null,n?fixed(row.hours):null]))));
  c.conditions.forEach((cond,i)=>{
   const answers=s.classifications[cond.id]||[];
   observations.push(section(cond.label+' - '+source(s.sources[i]),paragraph(s.sources[i]==='classroom'?(s.counts[cond.id]?'Classroom counts recorded.':'No classroom counts recorded.'):(s.reviewed[cond.id]?'Field reviewed.':'Field not yet collected; classifications may be incomplete.')),
    ...(s.sources[i]==='virtual'&&answers.some(Number.isInteger)?[table(['Cell','Your classification'],answers.flatMap((answer,index)=>Number.isInteger(answer)?[[index+1,stages[answer]]]:[]))]:[])));
  });
 }else{
  const summary=[],series=[];
  c.conditions.forEach((cond,i)=>{
   const values=[];
   for(let trial=1;trial<=3;trial++){
    const key=cond.id+'-'+trial,points=s.runs[key]||[],done=points.length===times(c).length,excluded=Boolean(s.leafRuns?.[key]?.altered);
    const value=done?(c.kind==='leaf'?et50(points):(points.at(-1).value-points[0].value)/c.end):undefined;
    values.push(done&&!excluded?value:undefined);
    summary.push([cond.label,trial,s.sources[i],excluded?'Exploration - excluded':done?'Collected':'In progress',excluded?null:!done?null:value===null?`Not reached by ${c.end} min`:fixed(value)]);
   }
   const average=values.every(x=>typeof x==='number')?mean(values):null;
   summary.push([cond.label,'Mean',s.sources[i],average===null?'Not available':'Calculated from 3 trials',fixed(average)]);
   const runs=[1,2,3].map(trial=>s.runs[cond.id+'-'+trial]||[]),observedTimes=[...new Set(runs.flatMap(points=>points.map(p=>p.time)))].sort((a,b)=>a-b);
   if(observedTimes.length)series.push(section(`${cond.label} - recorded ${s.sources[i]} readings`,paragraph(c.yLabel),table(['Time (minutes)',...[1,2,3].map(trial=>`Trial ${trial}${s.leafRuns?.[cond.id+'-'+trial]?.altered?' (exploration)':''}`)],observedTimes.map(time=>[time,...runs.map(points=>points.find(p=>p.time===time)?.value??null)]))));
  });
  observations.push(section('Comparison results',paragraph(c.kind==='leaf'?'ET50 is the time when 5 of 10 disks float. A threshold not reached is not a zero rate. The mean is shown only when all three trials reach it.':'Average gas accumulation rate is (final - initial volume) / elapsed minutes. The mean is shown only for three complete trials.'),table(['Treatment','Trial','Source','Collection status',c.kind==='leaf'?'ET50 (minutes)':'Rate (mL/min)'],summary)),...series);
 }
 const exploration=[];
 for(const [key,r] of Object.entries(c.kind==='leaf'?s.leafRuns||{}:c.kind==='yeast'?s.yeastRuns||{}:{})){
  if(!s.runs[key]?.length&&r.points?.length)observations.push(section(key+' - virtual observations not yet collected',paragraph('These readings are excluded from the collected comparison until you collect the trial.'),table(['Time (minutes)',c.yLabel],r.points.map(p=>[p.time,p.value]))));
 }
 if(c.kind==='leaf'&&s.leafExploration?.points?.length)exploration.push(section('Optional exploration - excluded from comparison',paragraph('Light and preparation may differ from the required comparison.'),table(['Time (minutes)','Floating disks','Relative light (%)'],s.leafExploration.points.map(p=>[p.time,p.value,p.light]))));
 if(c.kind==='yeast'&&s.yeastExploration?.points?.length)exploration.push(section('Optional exploration - excluded from comparison',paragraph(`Fuel: ${s.yeastExploration.fuel}; yeast present: ${s.yeastExploration.yeast?'yes':'no'}.`),table(['Time (minutes)','Collected gas (mL)','Bath temperature (°C)'],s.yeastExploration.points.map(p=>[p.time,p.value,p.temperature]))));
 if(c.kind==='mitosis'&&s.microscopeExploration?.answers?.some(Number.isInteger))exploration.push(section('Optional microscope exploration - excluded from comparison',table(['Stage','Practice count'],tally(s.microscopeExploration.answers).map((n,i)=>[stages[i],n]))));
 const revision=c.kind==='yeast'?`Recorded fermentation model: ${s.fermentationModelVersion===1?'1 (earlier constant-rate model)':'2 (gradual substrate availability)'}.`:c.kind==='mitosis'?`Recorded cell-field model: ${s.mitosisModelVersion===1?'1 (earlier fields)':'2 (interphase-dominant fields)'}.`:'';
 const report = reportSnapshot(c,s,[plan,section('Observation notes',paragraph(s.notes.observations)),...observations,...exploration,explanations,{...section('Model and evidence limits',...(revision?[paragraph(revision)]:[]),paragraph(c.model)),keepFirst:revision?2:1}],{complete:Boolean(s.complete)&&completedData(c,s),...options});
 return platformReport(attachInvestigationEvidence(report,c,s,true));
}

function measurementLabels(c){
 if(c.kind==='meiosis')return ['Unchanged chromosome products','Recombined chromosome products'];
 return c.categories||(c.kind==='gel'?['Largest band','Middle band','Smallest band']:c.kind==='regulation'?['Visible colonies','Fluorescence']:[c.kind==='microscope'?'Cell length':'Final observation']);
}
function measurementUnit(c,index){return c.categories||c.kind==='meiosis'?'count':c.kind==='regulation'?(index===0?'colonies':'0 absent / 1 present'):c.unit;}
function recordedSample(c,row,index){
 const blocks=[paragraph(`Source: ${source(row.source)}. Repeat: ${row.repeat}. ${row.modelVersion?'Model revision: '+row.modelVersion+'.':''}`),table(['Measurement','Your result','Unit'],row.values.map((value,i)=>[measurementLabels(c)[i],value,measurementUnit(c,i)])),paragraph('Observation notes'),paragraph(row.note)];
 if(row.settings&&['enzyme','gel'].includes(c.kind))blocks.push(paragraph((c.kind==='gel'?'Applied voltage: ':'Bath temperature: ')+row.settings.setting+(c.kind==='gel'?' V.':' °C.')));
 if(timedObservation(c)&&row.readings?.length)blocks.push(table([`Time (${c.timeUnit})`,c.unit],row.readings.map(([t,value])=>[t,value])));
 if(c.kind==='plant'&&row.readings?.length)blocks.push(paragraph('Growth from starting height: '+fixed(row.values[0]-row.readings[0][1])+' cm.'));
 if(c.kind==='enzyme'&&row.readings?.length>1)blocks.push(paragraph('Initial gas collection rate: '+fixed((row.readings[1][1]-row.readings[0][1])/(row.readings[1][0]-row.readings[0][0]),3)+' mL/s.'));
 if(c.kind==='microscope'&&row.source==='virtual'){const calibration=row.settings?.calibration;blocks.push(paragraph(calibration?`40× scale calibration was ${calibration.source==='student'?'calculated by the student':calibration.source==='matched'?'reused for this new cell':'supplied with the earlier attempt'}. Each division represents ${calibration.unitsPerDivision} µm.${calibration.answer?' Recorded answer '+calibration.answer+' µm per division.':''}`:'The scale was supplied with this earlier attempt. Each division represents 2 µm at 40×.'));}
 if(row.settings?.products?.length)blocks.push(table(['Cell product','Allele combination'],row.settings.products.map(p=>[p.role,p.alleles])));
 return {...section(`${index+1}. ${row.condition}`, ...blocks),keepFirst:2};
}
export function extendedStudentReport(c,s,options={}){
 const [plan,explanations]=writing(s.prediction,s.design,c.analysis,s.answers),sections=[plan];
 if(c.kind==='corn'&&s.punnett){const p=s.punnett;sections.push(section('Your inheritance prediction',paragraph('Parent cross: Pp × Pp'),table(['Parent alleles','P','p'],[['P',p.cells[0],p.cells[1]],['p',p.cells[2],p.cells[3]]]),paragraph('Purple outcomes out of 4: '+(p.purple||'Not recorded')),paragraph('Yellow outcomes out of 4: '+(p.yellow||'Not recorded'))));}
 sections.push(section('Collected comparison',paragraph(`${s.records.length} of ${sequence(c).length} required samples or pathways collected. Sources are labeled for each sample. Uncollected results are not filled in.`)),...s.records.map((row,i)=>recordedSample(c,row,i)));
 if(c.categories&&s.records.length){
  sections.push(section('Compare samples before pooling',table(['Sample','Source','Total',c.kind==='corn'?'Purple (%)':c.kind==='flies'?'Recombinant (%)':'Second-division patterns (%)'],s.records.map(row=>{const total=row.values.reduce((a,b)=>a+b,0),num=c.kind==='corn'?row.values[0]:c.kind==='flies'?row.values[2]+row.values[3]:row.values[1]+row.values[2];return [row.condition,row.source,total,total?fixed(100*num/total):null];}))));
  const blocks=[];
  for(const kind of ['virtual','classroom']){const rows=s.records.filter(row=>row.source===kind);if(!rows.length)continue;const totals=c.categories.map((_,i)=>rows.reduce((n,row)=>n+row.values[i],0));blocks.push(paragraph(`${source(kind)} pooled counts: ${c.categories.map((label,i)=>label+': '+totals[i]).join('; ')}.`),paragraph(c.kind==='corn'?'Chi-square discrepancy statistic: '+fixed(chiSquare(totals))+'. This is not a p-value or an automatic conclusion.':(c.kind==='asci'?'Approximate gene-to-centromere distance':'Pooled recombinant percentage (approximate map units for a short interval)')+': '+fixed(mapping(c.kind,totals))+'.'));}
  sections.push(section('Pooled calculations',...blocks));
 }
 const r=s.run,draft=[];
 if(r.note)draft.push(paragraph('Sample notes: '+r.note));
 if(timedObservation(c)&&r.readings?.length)draft.push(table([`Time (${c.timeUnit})`,c.unit],r.readings.map(([t,value])=>[t,value])));
 if(c.categories&&r.tallies?.some(n=>n>0))draft.push(table(['Category','Draft count'],r.tallies.map((n,i)=>[c.categories[i],n])));
 if(c.categories&&r.scores?.some(Number.isInteger))draft.push(table(['Specimen','Draft classification'],r.scores.flatMap((value,i)=>Number.isInteger(value)?[[i+1,c.categories[value]]]:[])));
 if(c.kind==='gel'&&r.estimates.some(value=>String(value).trim()))draft.push(table(['Unknown band','Draft estimate (bp)'],r.estimates.map((value,i)=>[i+1,value])));
 if(c.kind==='microscope'&&r.rulerMeasured)draft.push(paragraph(`Draft cell-length measurement: ${r.ruler*(r.objective===40?2:8)} ${c.unit}.`));
 if(draft.length)sections.push(section('Current virtual sample - not collected; excluded from comparison',...draft));
 if(s.exploration.length)sections.push(section('Optional exploration - excluded from comparison',paragraph('These samples are kept separate from the required comparison.')),...s.exploration.map((row,i)=>recordedSample(c,row,i)));
 sections.push(explanations,section('Model and evidence limits',paragraph(c.limits)));
 const report = reportSnapshot(c,s,sections,{complete:Boolean(s.complete)&&s.records.length===sequence(c).length,...options});
 return platformReport(attachInvestigationEvidence(report,c,s,false));
}
