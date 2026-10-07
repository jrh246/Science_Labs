import {random} from './model.js';
export const plannedLight=id=>id==='bright'?100:id==='low'?25:0;
export function newLeafRun(condition,trial,seed){
 const rng=random(seed+trial*101+['dark','low','bright'].indexOf(condition)*1009);
 return {version:1,ticks:0,light:plannedLight(condition),planned:plannedLight(condition),cycles:0,vacuum:false,altered:false,inCup:false,
  disks:Array.from({length:10},()=>({gas:1.35,threshold:.7+rng()*.4,rate:.88+rng()*.24})),points:[],events:[]};
}
export const floating=r=>r.disks.filter(d=>d.gas>=d.threshold).length;
export function infiltrate(r){
 if(r.ticks)return;
 r.vacuum=!r.vacuum;
 if(!r.vacuum){r.cycles=Math.min(3,r.cycles+1);r.disks.forEach(d=>d.gas=Math.max(0,1.35-r.cycles*.45));}
}
export function setLeafLight(r,value){
 r.light=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
 if(r.events.at(-1)?.light!==r.light)r.events.push({time:r.ticks/4,light:r.light});
}
// Illustrative gas balance, not a calibrated physiological rate or oxygen concentration.
// Respiration and gas loss continue in darkness; accumulated gas gives a delayed response.
export function advanceLeaf(r,minutes=.25){
 const steps=Math.min(Math.round(minutes*4),480-r.ticks);
 if(!r.points.length){r.points.push({time:0,value:floating(r),light:r.light});r.events.push({time:0,light:r.light});}
 for(let i=0;i<steps;i++){
  if(r.light!==r.planned||r.cycles<3)r.altered=true;
  const production=.185*Math.sqrt(r.light/100);
  r.disks.forEach(d=>{d.gas=Math.max(0,Math.min(1.7,d.gas+(production*d.rate-.035-.025*d.gas)*.25));});
  r.ticks++;
  if(r.ticks%8===0)r.points.push({time:r.ticks/4,value:floating(r),light:r.light});
 }
}
export function comparisonReadings(r){return !r.altered&&r.cycles===3?r.points.filter(p=>p.time<=20).map(({time,value})=>({time,value})):[];}
export function restoreLeafRun(value,condition,trial,seed){
 const fallback=()=>newLeafRun(condition,trial,seed);
 if(!value)return fallback();
 const r=structuredClone(value);
 // Older saved runs already underway had their disks in the cup.
 if(r.inCup===undefined)r.inCup=r.ticks>0;
 if(typeof r.inCup!=='boolean')return fallback();
 if(r.version!==1||!Number.isInteger(r.ticks)||r.ticks<0||r.ticks>480||!Number.isInteger(r.cycles)||r.cycles<0||r.cycles>3||typeof r.vacuum!=='boolean'||typeof r.altered!=='boolean'||!Number.isInteger(r.light)||r.light<0||r.light>100||r.planned!==plannedLight(condition))return fallback();
 if(!Array.isArray(r.disks)||r.disks.length!==10||r.disks.some(d=>!Number.isFinite(d.gas)||d.gas<0||d.gas>1.7||!Number.isFinite(d.threshold)||d.threshold<.7||d.threshold>1.1||!Number.isFinite(d.rate)||d.rate<.88||d.rate>1.12))return fallback();
 if(!Array.isArray(r.points)||(r.ticks>0&&r.points.length!==Math.floor(r.ticks/8)+1)||r.points.length>61||r.points.some((p,i)=>p.time!==i*2||p.time>r.ticks/4||!Number.isInteger(p.value)||p.value<0||p.value>10||!Number.isInteger(p.light)||p.light<0||p.light>100))return fallback();
 if(!Array.isArray(r.events)||r.events.some(e=>!Number.isFinite(e.time)||e.time<0||e.time>r.ticks/4||!Number.isInteger(e.light)||e.light<0||e.light>100))return fallback();
 return r;
}
