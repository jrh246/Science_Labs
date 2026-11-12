import {investigations} from '../../src/investigations/content.js';
import {fresh,times} from '../../src/investigations/model.js';
import {extendedById} from '../../src/investigations/extended-content.js';
import {freshState,newRun,sequence,record,advance,result} from '../../src/investigations/extended-model.js';
import {freshState as freshOsmosis,ids,difference} from '../../src/state.js';

export const reportLabIds=['osmosis-homeostasis',...Object.keys(investigations),...Object.values(extendedById).filter(c=>c.kind!=='extraction').map(c=>c.id)];
export function reportAttempt(id,complete=false){
 let state,key,url;
 const c=investigations[id]||extendedById[id];
 if(id==='osmosis-homeostasis'){
  state=freshOsmosis();key='cell-lab';url='/lab.html';
  if(complete){for(const field of ['prepared','initial','placed','final','valid'])state[field]=Object.fromEntries(ids.map(id=>[id,true]));state.elapsed=true;state.step=6;state.answers=Object.fromEntries(state.run.map(t=>[t.id,String(difference(t))]));}
 }else if(investigations[id]){
  state=fresh(c);state.step=2;state.notes.prediction='My prediction for '+id;state.notes.design='Keep conditions matched; compare the assigned samples.';state.notes.observations='Recorded observation: '+id;
  key=`science-labs:/:${id}:v1:${c.conditions.map(()=>'virtual').join(',')}`;url='/investigation.html?lab='+id;
  if(complete){
   state.sources[1]='classroom';
   if(c.kind==='mitosis'){state.classifications['field-a']=[...Array(16).fill(0),1,2,3,4];state.reviewed['field-a']=true;state.counts['field-b']=[14,2,2,1,1];}
   else c.conditions.forEach((cond,i)=>{for(let trial=1;trial<=3;trial++)state.runs[cond.id+'-'+trial]=times(c).map(time=>({time,value:c.kind==='leaf'?Math.min(10,Math.floor(time*i*.4)):Number((time*(i+.1)*.3+trial*.02).toFixed(2))}));});
   state.notes.answers=c.questions.map((_,i)=>`Written explanation ${i+1} for ${id}. Evidence remains my own response.`);state.complete=true;
  }
 }else{
  state=freshState(c,12345);state.prediction='My prediction for '+id;state.design='Use distinct controls and keep sources separate.';
  key=`science-labs:/:${c.kind==='asci'?'meiosis-variation':id}:${c.workflowVersion?'streamlined-v'+c.workflowVersion:c.kind==='meiosis'?'gametogenesis-v1':'original-v1'}`;url='/investigation.html?lab='+id;
  if(complete){
   state.records=sequence(c).map((job,i)=>{let r=newRun(c,i,state.seed);r.prepared=c.steps.length;if(c.duration>0)r=advance(c,r,c.duration);r.note='Sample note '+(i+1);r.ruler=35;r.rulerMeasured=true;r.estimates=['3100','1510','690'];r.chromatids=[0,2];r.cut=1;r.placed=[0,1,2,3];r.eggActivated=true;r.spermMature=true;if(c.kind==='corn')r.tallies=[35,13];if(c.kind==='flies')r.tallies=[12,14,3,3];if(c.kind==='asci')r.scores=[...Array(7).fill(0),0,1,1,2,2];return record(c,r,i%2?'classroom':'virtual',result(c,r),r.note);});
   state.run=newRun(c,state.records.length,state.seed);state.step=2;state.answers=c.analysis.map((_,i)=>`Written explanation ${i+1} for ${id}. Evidence remains my own response.`);state.complete=true;
  }
 }
 return {id,c,state,key,url,storageValue:id==='osmosis-homeostasis'?{version:2,state}:state};
}
