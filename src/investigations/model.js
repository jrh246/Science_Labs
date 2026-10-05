import {stages} from './content.js';
export function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
export const times = c => Array.from({length:c.end/c.interval+1},(_,i)=>i*c.interval);
export function makeSeries(c,condition,trial,seed){
 const rng=random(seed+trial*101+c.conditions.findIndex(x=>x.id===condition)*1009);
 if(c.kind==='leaf'){
  const midpoint=condition==='bright'?8:condition==='low'?16:40;
  const shift=(rng()-.5)*3;
  const thresholds=Array.from({length:10},()=>midpoint+shift+(rng()-.5)*8);
  return times(c).map(time=>({time,value:thresholds.filter(t=>t<=time).length}));
 }
 const rate=condition==='none'?.015+rng()*.025:condition==='glucose'?.78+rng()*.3:.73+rng()*.36;
 const lag=condition==='none'?0:1+rng()*3;
 return times(c).map(time=>({time,value:Math.round(Math.max(0,time-lag)*rate*10)/10}));
}
export function fieldCells(field,seed){
 const counts=field==='field-a'?[14,3,1,1,1]:[13,3,2,1,1];
 const cells=counts.flatMap((count,stage)=>Array(count).fill(stage));const rng=random(seed+(field==='field-a'?10:20));
 for(let i=cells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 return cells;
}
export function et50(points){
 if(!points.length)return null;
 if(points[0].value>=5)return points[0].time;
 for(let i=1;i<points.length;i++)if(points[i].value>=5&&points[i-1].value<5){const a=points[i-1],b=points[i];return a.time+(5-a.value)/(b.value-a.value)*(b.time-a.time);}
 return null;
}
export function mean(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:null;}
export function tally(answers){return stages.map((_,s)=>answers.filter(a=>a===s).length);}
export function stageStats(counts,hours){const total=counts.reduce((a,b)=>a+b,0);return counts.map((count,i)=>({stage:stages[i],count,percent:total?count/total*100:0,hours:total?count/total*hours:0}));}
export function validateReadings(c,values){return values.length===times(c).length&&values.every(v=>v!==''&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=c.max&&(c.kind!=='leaf'||Number.isInteger(Number(v))));}
export function fresh(c,sources){return {version:1,seed:Math.floor(Math.random()*1e9),step:0,sources:c.conditions.map((_,i)=>sources?.[i]==='classroom'?'classroom':'virtual'),notes:{prediction:'',design:'',observations:'',answers:['','','','']},runs:{},classifications:{},counts:{},reviewed:{},cycleHours:24,complete:false};}
export function restored(c,raw,sources){
 try{
  const s=JSON.parse(raw);if(s.version!==1||!Number.isInteger(s.seed)||!Number.isInteger(s.step)||s.step<0||s.step>2||s.sources.length!==c.conditions.length||!s.sources.every(x=>['classroom','virtual'].includes(x)))throw Error();
  if(!s.notes||typeof s.notes.prediction!=='string'||typeof s.notes.design!=='string'||typeof s.notes.observations!=='string'||!Array.isArray(s.notes.answers)||s.notes.answers.length!==4||!s.notes.answers.every(a=>typeof a==='string'))throw Error();
  for(const key of ['runs','classifications','counts','reviewed'])if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))throw Error();
  if(!Number.isFinite(s.cycleHours)||s.cycleHours<1||s.cycleHours>100)throw Error();
  for(const condition of c.conditions){
   if(c.kind==='mitosis'){
    const a=s.classifications[condition.id];if(a&&(!Array.isArray(a)||a.length!==20||!a.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<5)))throw Error();
    const counts=s.counts[condition.id];if(counts&&(!Array.isArray(counts)||counts.length!==5||!counts.every(x=>Number.isInteger(x)&&x>=0&&x<=1000)))throw Error();
   }else for(let t=1;t<=3;t++){
    const run=s.runs[condition.id+'-'+t];if(run&&(!Array.isArray(run)||run.length>times(c).length||run.some((x,i)=>!x||x.time!==times(c)[i]||!Number.isFinite(x.value)||x.value<0||x.value>c.max||(c.kind==='leaf'&&!Number.isInteger(x.value)))))throw Error();
   }
  }
  return s;
 }catch{return fresh(c,sources);}
}
export function completedData(c,s){return c.conditions.every(condition=>{
 if(c.kind==='mitosis')return s.sources[c.conditions.indexOf(condition)]==='classroom'?!!s.counts[condition.id]?.some(x=>x>0):s.classifications[condition.id]?.length===20&&s.classifications[condition.id].every(x=>Number.isInteger(x))&&!!s.reviewed[condition.id];
 return [1,2,3].every(t=>s.runs[condition.id+'-'+t]?.length===times(c).length);
});}
