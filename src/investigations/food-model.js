import {foodContent as c} from './food-content.js';
export const foodIds=c.assays.map(a=>a.id);
const profiles=[[true,false,true,false],[false,true,false,true],[true,true,false,true],[false,false,true,true]];
export const foodProfile=s=>Object.fromEntries(foodIds.map((id,i)=>[id,profiles[s.seed%profiles.length][i]]));
export function foodShuffle(items,seed){const a=[...items];let n=seed>>>0;for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function freshFood(seed=Date.now()>>>0){return {schemaVersion:1,activityVersion:1,labId:c.id,attemptId:`food-${seed}-${Date.now()}`,seed:seed>>>0,locale:'en',stage:0,active:'sugar',studentName:'',studentClass:'',prediction:'',design:'',initialPlan:null,runs:Object.fromEntries(foodIds.map(id=>[id,{prepared:false,preparationSource:null,preparationSourceId:null,reagent:false,held:false,heated:false,stained:false,rinsed:false,observation:'',claim:'',record:null,attempts:[]}])),checks:{},answers:{},complete:false};}
export const foodPlanReady=s=>Boolean(s.prediction.trim()&&s.design.trim());
export function startFood(s){if(!foodPlanReady(s))return false;s.initialPlan??={prediction:s.prediction,design:s.design,recordedAt:new Date().toISOString(),timing:'Before setup and observations'};s.stage=1;return true;}
export function foodReady(s,id=s.active){const r=s.runs[id];return Boolean(s.initialPlan&&r.prepared&&(id==='lipid'?r.stained&&r.rinsed:r.reagent&&(id!=='sugar'||r.heated)));}
export function useFoodTool(s,tool,target='unknown'){
 if(!s.initialPlan||s.stage!==1)return {ok:false,message:'Record your prediction and plan before using the materials.'};
 const r=s.runs[s.active],a=c.assays.find(a=>a.id===s.active);
 if(r.record)return {ok:false,message:'This result is recorded. Continue to the next different test.'};
 if(tool==='sample'&&target==='unknown'){
  if(r.prepared)return {ok:false,message:'This portion is already placed. Use a separate fresh portion for each test.'};
  r.prepared=true;r.preparationSourceId='student-placed';r.preparationSource='Student-placed fresh portion of U';return {ok:true,message:a.kind==='paper'?'A fresh sample spot is on the filter paper.':'A fresh 1 mL portion of U is in the test tube.'};
 }
 if(!r.prepared)return {ok:false,message:'Place a fresh portion of sample U before treating it.'};
 if(tool===s.active&&a.kind==='tube'&&target==='unknown'){
  if(r.reagent)return {ok:false,message:'The indicator is already added. Finish the test before interpreting it.'};
  r.reagent=true;return {ok:true,message:a.needHeat?'Benedict’s reagent is mixed in. The test is not ready until the tube has been heated.':`${a.reagent} is added and mixed. Compare the completed appearance with the controls.`};
 }
 if(s.active==='sugar'&&tool==='tongs'&&target==='unknown'&&r.reagent&&!r.heated){r.held=true;return {ok:true,message:'The tongs hold the unknown tube. Place it in the model water bath.'};}
 if(s.active==='sugar'&&tool==='tongs'&&target==='bath'&&r.held&&!r.heated){r.heated=true;r.held=false;return {ok:true,message:'The tube moved into the hot-water bath. The model shows the completed heating result with time shortened. Compare the heated controls.'};}
 if(s.active==='lipid'&&tool==='paper'&&target==='stain'&&!r.stained){r.stained=true;return {ok:true,message:'The spotted paper is treated with Sudan IV dye. Do not interpret it until it has been rinsed.'};}
 if(s.active==='lipid'&&tool==='paper'&&target==='rinse'&&r.stained&&!r.rinsed){r.rinsed=true;return {ok:true,message:'The paper is rinsed and model-dried for inspection. Compare any retained spot with both controls.'};}
 return {ok:false,message:'Use the correct material at its work site. Keep portions and indicators separate.'};
}
export function matchedFoodPortion(s){if(!s.initialPlan||s.stage!==1||s.runs[s.active].prepared||!foodIds.some(id=>s.runs[id].prepared))return false;s.runs[s.active].prepared=true;s.runs[s.active].preparationSourceId='model-matched';s.runs[s.active].preparationSource='Model-prepared matched fresh portion of U';return true;}
export function recordFoodResult(s){
 if(!foodReady(s)||s.stage!==1)return false;const r=s.runs[s.active],positive=foodProfile(s)[s.active];
 const correct=r.observation===(positive?'positive-appearance':'negative-appearance')&&r.claim===(positive?'detected':'not-detected');
 r.attempts.push({observation:r.observation,claim:r.claim,correct});r.record=correct?{observation:r.observation,claim:r.claim,source:'Student interpretation of model unknown against supplied controls',correctAfterFeedback:r.attempts.some(a=>!a.correct)}:null;s.complete=false;return correct;
}
export const foodDataReady=s=>foodIds.every(id=>Boolean(s.runs[id].record));
export function nextFood(s){if(!s.initialPlan||s.stage!==1||!s.runs[s.active].record)return false;const i=foodIds.indexOf(s.active);if(i<foodIds.length-1)s.active=foodIds[i+1];else if(foodDataReady(s))s.stage=2;return true;}
export function checkFood(s,id,value){const q=c.checks.find(q=>q.id===id);if(!q||!foodDataReady(s)||!q.choices.some(([key])=>key===value))return false;const a=s.checks[id]??={value:null,attempts:[]};a.value=value;a.correct=value===q.correct;a.attempts.push({value,correct:a.correct});s.complete=false;return a.correct;}
export function canCompleteFood(s){return Boolean(s.initialPlan&&foodDataReady(s)&&c.checks.every(q=>s.checks[q.id]?.correct)&&c.explanations.every(q=>s.answers[q.id]?.trim()));}
export function restoreFood(raw){let x;try{x=typeof raw==='string'?JSON.parse(raw):raw;}catch{return freshFood();}if(!x||x.schemaVersion!==1||x.labId!==c.id)return freshFood();const base=freshFood(x.seed),s={...base,...x};s.runs=Object.fromEntries(foodIds.map(id=>[id,{...base.runs[id],...x.runs?.[id]}]));s.checks=x.checks||{};s.answers=x.answers||{};if(!foodIds.includes(s.active))s.active=foodIds.find(id=>!s.runs[id].record)||'sugar';if(!s.initialPlan)s.stage=0;else if(![1,2].includes(s.stage)||s.stage===2&&!foodDataReady(s))s.stage=1;if(!canCompleteFood(s))s.complete=false;return s;}
