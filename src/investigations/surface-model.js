import {surfaceContent as c} from './surface-content.js';
export const surfaceIds=['water','detergent'];
export function surfaceOrder(items,seed){let n=seed>>>0;const a=[...items];for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function freshSurface(seed=Date.now()>>>0){return {schemaVersion:1,activityVersion:1,labId:c.id,attemptId:`surface-${seed}-${Date.now()}`,seed:seed>>>0,locale:'en',stage:0,studentName:'',studentClass:'',prediction:'',design:'',initialPlan:null,active:'water',runs:Object.fromEntries(surfaceIds.map(id=>[id,{clean:false,mounted:false,drops:0,manualDrops:0,automaticDrops:0,spilled:false,enteredCount:'',enteredVolume:'',measurement:null,attempts:[]}])),checks:{},answers:{},complete:false};}
export const maxSurfaceDrops=(s,id)=>id==='water'?22+s.seed%7:9+(s.seed>>>3)%4;
export const surfacePlanReady=s=>Boolean(s.prediction.trim()&&s.design.trim());
export function startSurface(s){if(!surfacePlanReady(s))return false;s.initialPlan??={prediction:s.prediction,design:s.design,recordedAt:new Date().toISOString(),timing:'Before setup and observations'};s.stage=1;return true;}
export function restoreSurface(raw){let x;try{x=typeof raw==='string'?JSON.parse(raw):raw;}catch{return freshSurface();}if(!x||x.schemaVersion!==1||x.labId!==c.id)return freshSurface();const s={...freshSurface(x.seed),...x};s.runs=Object.fromEntries(surfaceIds.map(id=>[id,{...freshSurface(x.seed).runs[id],...x.runs?.[id]}]));s.checks=x.checks||{};s.answers=x.answers||{};if(!s.initialPlan)s.stage=0;else if(![1,2].includes(s.stage)||s.stage===2&&!surfaceDataReady(s))s.stage=1;if(!surfaceIds.includes(s.active))s.active='water';if(!canCompleteSurface(s))s.complete=false;return s;}
export function placeSurfaceTool(s,tool){
 if(!s.initialPlan||s.stage!==1)return {ok:false,message:'Record your prediction and plan before setup.'};const r=s.runs[s.active];
 if(tool==='cloth'){if(r.drops)return {ok:false,message:'Finish this run before changing its coin.'};r.clean=true;return {ok:true,message:'The coin is clean and dry. The comparison uses the same coin face and size.'};}
 if(tool!==s.active)return {ok:false,message:`Use the dedicated ${s.active==='water'?'water':'detergent-solution'} dropper for this condition.`};
 if(!r.clean)return {ok:false,message:'Use the cloth on the coin first. Residue could change the comparison.'};
 r.mounted=true;return {ok:true,message:'Dropper placed above the center of the coin at the matched height. Add a single drop.'};
}
export function addSurfaceDrops(s,count=1){
 if(!s.initialPlan||s.stage!==1||![1,5].includes(count))return false;const r=s.runs[s.active];if(!r.clean||!r.mounted||r.spilled||count===5&&r.manualDrops<3)return false;
 const n=Math.min(count,maxSurfaceDrops(s,s.active)+1-r.drops);r.drops+=n;if(count===1)r.manualDrops+=n;else r.automaticDrops+=n;r.spilled=r.drops>maxSurfaceDrops(s,s.active);r.measurement=null;s.complete=false;return true;
}
export function recordSurfaceMeasurement(s){
 if(!s.initialPlan||s.stage!==1)return false;const r=s.runs[s.active];if(!r.spilled)return false;
 const count=Number(r.enteredCount),volume=Number(r.enteredVolume),expected=maxSurfaceDrops(s,s.active);
 const correct=r.enteredCount.trim()!==''&&r.enteredVolume.trim()!==''&&Number.isInteger(count)&&count===expected&&Number.isFinite(volume)&&Math.abs(volume-count*.05)<.005;
 r.attempts.push({count:r.enteredCount,volume:r.enteredVolume,correct});r.measurement=correct?{count,volume,source:'Student interpretation of model drop counter',correctAfterFeedback:r.attempts.some(a=>!a.correct)}:null;s.complete=false;return correct;
}
export const surfaceDataReady=s=>surfaceIds.every(id=>Boolean(s.runs[id].measurement));
export function switchSurface(s,id){if(!s.initialPlan||s.stage!==1||!surfaceIds.includes(id)||!s.runs[s.active].measurement)return false;s.active=id;return true;}
export function checkSurface(s,id,value){const q=c.checks.find(q=>q.id===id);if(!q||!surfaceDataReady(s)||!q.choices.some(([key])=>key===value))return false;const r=s.checks[id]??={value:null,attempts:[]};r.value=value;r.correct=value===q.correct;r.attempts.push({value,correct:r.correct});s.complete=false;return r.correct;}
export function canCompleteSurface(s){return Boolean(s.initialPlan&&surfaceDataReady(s)&&c.checks.every(q=>s.checks[q.id]?.correct)&&c.explanations.every(q=>s.answers[q.id]?.trim()));}
