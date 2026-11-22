import {labConfig as c} from './data/labConfig.js';
import {reasoningQuestions} from './data/osmosis-learning.js';
export const measurementNoise=(random=Math.random)=>((random()+random())-1)*c.measurementVariation;
export const trendValid=(t)=>{const external=c.beakers.find(b=>b.id===t.id).sugarPercent;const change=difference(t);return external===t.sugarPercent?Math.abs(change)<c.isotonicMaxChange:external<t.sugarPercent?change>0:change<0;};
export function createExperimentRun(random=Math.random){return c.tubes.map(t=>{for(let attempt=0;attempt<100;attempt++){const measured={...t,initialMass:Number((t.initialMass+measurementNoise(random)).toFixed(2)),finalMass:Number((t.baselineFinalMass+measurementNoise(random)).toFixed(2))};if(trendValid(measured))return measured;}throw new Error('Experimental configuration cannot produce the required biological trend.');});}
export const freshState=()=>({studentName:'',studentClass:'',run:createExperimentRun(),step:0,prepared:{},initial:{},placed:{},elapsed:false,final:{},answers:{},attempts:{},valid:{},learningVersion:1,prediction:'',initialPrediction:null,predictionUnrecorded:false,reasoning:Object.fromEntries(reasoningQuestions.map(question=>[question.id,''])),complete:false});
export const ids=c.beakers.map(b=>b.id);
export const all=(record)=>ids.every(id=>record[id]);
export const difference=t=>Number((t.finalMass-t.initialMass).toFixed(2));
export const correct=(run,id,value)=>String(value).trim()!=='' && Number.isFinite(Number(value)) && Math.abs(Number(value)-difference(run.find(t=>t.id===id)))<=c.tolerance;
export function predictionRecord(s){
 const record=s.initialPrediction;
 return record&&typeof record.text==='string'&&record.text.trim()
  &&typeof record.recordedAt==='string'&&Number.isFinite(Date.parse(record.recordedAt))
  &&['before-experiment','after-results'].includes(record.timing)?record:null;
}

export function recordPrediction(s,recordedAt=new Date().toISOString()){
 if(!s.prediction.trim())return false;
 if(!predictionRecord(s))s.initialPrediction={text:s.prediction,recordedAt,timing:s.elapsed?'after-results':'before-experiment'};
 return true;
}

export function predictionReady(s){
 return Boolean(s.prediction?.trim()&&predictionRecord(s))||s.predictionUnrecorded===true&&s.elapsed;
}

export function procedureComplete(s){
 return s.elapsed&&all(s.initial)&&all(s.final)&&ids.every(id=>correct(s.run,id,s.answers[id]));
}

export function canComplete(s){
 return procedureComplete(s)&&predictionReady(s)
  &&reasoningQuestions.every(question=>typeof s.reasoning?.[question.id]==='string'&&s.reasoning[question.id].trim());
}

export function advance(s){
 if(!all(s.placed)||!predictionReady(s))return false;
 s.elapsed=true;
 return true;
}

export function restore(raw){
 try{
  const saved=JSON.parse(raw);
  if(![1,2].includes(saved?.version)||!saved.state||!Number.isInteger(saved.state.step)||saved.state.step<0||saved.state.step>6)return freshState();
  const state={...saved.state};
  if(saved.version===1)state.run=c.tubes.map(tube=>({...tube,finalMass:tube.baselineFinalMass}));
  if(!Array.isArray(state.run)||state.run.length!==ids.length||!ids.every(id=>state.run.filter(tube=>tube.id===id).length===1)
    ||!state.run.every(tube=>Number.isFinite(tube.initialMass)&&Number.isFinite(tube.finalMass)&&tube.initialMass>0&&tube.finalMass>0&&trendValid(tube)))return freshState();
  for(const field of ['prepared','initial','placed','final','answers','attempts','valid']){
   if(!state[field]||typeof state[field]!=='object'||Array.isArray(state[field]))return freshState();
  }
  if(state.step>1&&!all(state.prepared)||state.step>2&&!all(state.initial)||state.step>3&&!all(state.placed)
    ||state.step>4&&!state.elapsed||state.step>5&&(!all(state.final)||!ids.every(id=>correct(state.run,id,state.answers[id]))))return freshState();
  for(const field of ['studentName','studentClass','prediction'])if(typeof state[field]!=='string')state[field]='';
  state.predictionUnrecorded=state.predictionUnrecorded===true||state.learningVersion!==1&&state.elapsed===true&&!state.prediction.trim();
  state.learningVersion=1;
  state.initialPrediction=predictionRecord(state);
  state.reasoning=Object.fromEntries(reasoningQuestions.map(question=>[question.id,
   typeof state.reasoning?.[question.id]==='string'?state.reasoning[question.id]:'']));
  state.complete=state.complete===true&&canComplete(state);
  if(state.step>0&&!state.elapsed&&!predictionReady(state))state.step=0;
  return state;
 }catch{return freshState();}
}
