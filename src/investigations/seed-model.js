import {seedContent as c} from './seed-content.js';
export const dishIds=['a','b'];
export const days=[2,5];
export const observationKeys=days.flatMap(day=>dishIds.map(id=>`${id}-${day}`));
export function shuffled(items,seed){
 const out=[...items];let x=seed>>>0;
 for(let i=out.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;
}
export function freshSeed(seed=Date.now()>>>0){return {schemaVersion:1,activityVersion:1,labId:c.id,attemptId:`seed-${seed}-${Date.now()}`,seed:seed>>>0,locale:'en',stage:0,studentName:'',studentClass:'',prediction:'',design:'',initialPlan:null,dishes:{a:{water:null,loaded:false,waterApplied:false},b:{water:null,loaded:false,waterApplied:false}},day:0,observations:{},checks:{},answers:{},complete:false};}
export function restoreSeed(raw){
 let saved;try{saved=typeof raw==='string'?JSON.parse(raw):raw;}catch{return freshSeed();}
 if(!saved||saved.schemaVersion!==1||saved.labId!==c.id)return freshSeed();
 const s={...freshSeed(saved.seed),...saved};
 s.dishes=Object.fromEntries(dishIds.map(id=>[id,{loaded:false,water:null,waterApplied:false,...saved.dishes?.[id]}]));
 s.observations=saved.observations||{};s.checks=saved.checks||{};s.answers=saved.answers||{};
 if(!s.initialPlan)s.stage=0;
 if(![0,2,5].includes(s.day))s.day=0;
 if(!canCompleteSeed(s))s.complete=false;
 return s;
}
export const planReadySeed=s=>Boolean(s.prediction.trim()&&s.design.trim()&&dishIds.every(id=>[0,5].includes(s.dishes[id].water))&&s.dishes.a.water!==s.dishes.b.water);
export function recordSeedPlan(s){
 if(!planReadySeed(s))return false;
 s.initialPlan??={prediction:s.prediction,design:s.design,water:Object.fromEntries(dishIds.map(id=>[id,s.dishes[id].water])),recordedAt:new Date().toISOString(),timing:'Before setup and observations'};
 s.stage=1;s.complete=false;return true;
}
export const setupReadySeed=s=>Boolean(s.initialPlan&&dishIds.every(id=>s.dishes[id].loaded&&(s.dishes[id].water===0||s.dishes[id].waterApplied)));
export function applySeedTool(s,tool,id){
 if(!s.initialPlan||s.stage!==1||!dishIds.includes(id))return {ok:false,message:'Record your plan before using the tools.'};
 const dish=s.dishes[id];
 if(tool==='seeds'){
  if(dish.loaded)return {ok:false,message:'This dish already has 10 seeds. Keep both samples the same size.'};
  dish.loaded=true;return {ok:true,message:`Placed 10 seeds in dish ${id.toUpperCase()}. These are one sample, not 10 independent dishes.`};
 }
 if(tool==='water'){
  if(dish.water===0)return {ok:false,message:'Keep this dish dry. Adding water would remove your control.'};
  if(!dish.loaded)return {ok:false,message:'Place the seed sample before adding water.'};
  if(dish.waterApplied)return {ok:false,message:'The planned 5 mL is already in this dish.'};
  dish.waterApplied=true;return {ok:true,message:`Added 5 mL to dish ${id.toUpperCase()}. The paper is damp; the seeds are not underwater.`};
 }
 return {ok:false,message:'Select the seed packet or measured water tool.'};
}
export function seedSpecimens(s,id){
 const order=shuffled([...Array(10).keys()],s.seed+(id==='a'?13:73));
 // Synthetic distribution, stable for this attempt: 2-4 roots by day 2, 7-9 by day 5.
 const early=2+s.seed%3,late=7+(s.seed>>>4)%3;
 return [...Array(10)].map((_,i)=>({id:i+1,rank:order.indexOf(i),rootDay:order.indexOf(i)<early?2:order.indexOf(i)<late?5:null}));
}
export const hasRoot=(s,id,seed,day=s.day)=>s.dishes[id].water===5&&seed.rootDay!==null&&seed.rootDay<=day;
export function advanceSeedDay(s){
 if(!setupReadySeed(s)||![0,2].includes(s.day))return false;
 if(s.day===2&&!dishIds.every(id=>s.observations[`${id}-2`]?.correct))return false;
 const hadLaterData=observationKeys.some(key=>key.endsWith('-5')&&s.observations[key]);s.day=s.day===0?2:5;s.stage=2;if(!hadLaterData)s.complete=false;return true;
}
export function toggleSeedObservation(s,id,seedId){
 if(s.stage!==2||!days.includes(s.day)||!dishIds.includes(id)||!Number.isInteger(seedId)||seedId<1||seedId>10)return false;
 const key=`${id}-${s.day}`,o=s.observations[key]??={selected:[],attempts:[],correct:false};
 const index=o.selected.indexOf(seedId);if(index<0)o.selected.push(seedId);else o.selected.splice(index,1);
 o.correct=false;o.pendingCheck=true;s.complete=false;return true;
}
export function checkSeedObservation(s,id){
 if(!s.initialPlan||s.stage!==2||!days.includes(s.day)||!dishIds.includes(id))return false;
 const key=`${id}-${s.day}`,o=s.observations[key]??={selected:[],attempts:[],correct:false};
 const expected=seedSpecimens(s,id).filter(seed=>hasRoot(s,id,seed)).map(seed=>seed.id);
 const correct=o.selected.length===expected.length&&o.selected.every(x=>expected.includes(x));
 o.pendingCheck=false;o.attempts.push({selected:[...o.selected],correct,recordedAt:new Date().toISOString()});o.correct=correct;s.complete=false;return correct;
}
export const observationsReadySeed=s=>observationKeys.every(key=>s.observations[key]?.correct);
export function answerSeedCheck(s,id,value){
 const q=c.checks.find(x=>x.id===id);if(!q||!observationsReadySeed(s)||!q.choices.some(([key])=>key===value))return false;
 const check=s.checks[id]??={value:null,attempts:[]};check.value=value;check.correct=value===q.correct;check.attempts.push({value,correct:check.correct});s.complete=false;return check.correct;
}
export function canCompleteSeed(s){return Boolean(s.initialPlan&&setupReadySeed(s)&&observationsReadySeed(s)&&c.checks.every(q=>s.checks[q.id]?.correct)&&c.explanations.every(q=>s.answers[q.id]?.trim()));}
