import {random} from './model.js';
export const fuels={none:'No added sugar',glucose:'Glucose',sucrose:'Sucrose'};
export function newYeastRun(condition,trial,seed){
 const rng=random(seed+trial*101+Object.keys(fuels).indexOf(condition)*1009);
 return {version:1,condition,fuel:'none',prepared:false,connected:false,yeast:true,bath:30,temperature:30,ticks:0,volume:0,lag:1+rng()*3,variation:.88+rng()*.24,points:[]};
}
export function restoreYeastRun(value,condition,trial,seed){
 const fresh=()=>newYeastRun(condition,trial,seed);
 if(!value)return fresh();
 const r=structuredClone(value);
 if(r.version!==1||r.condition!==condition||!Object.hasOwn(fuels,r.fuel)||!['prepared','connected','yeast'].every(k=>typeof r[k]==='boolean')||!Number.isInteger(r.ticks)||r.ticks<0||r.ticks>480||!Number.isFinite(r.volume)||r.volume<0||r.volume>100||!Number.isFinite(r.lag)||r.lag<1||r.lag>4||!Number.isFinite(r.variation)||r.variation<.88||r.variation>1.12||![r.bath,r.temperature].every(v=>Number.isFinite(v)&&v>=15&&v<=40))return fresh();
 if((r.connected&&!r.prepared)||(r.ticks>0&&(!r.prepared||!r.connected))||!Array.isArray(r.points)||r.points.length!==(r.ticks?Math.floor(r.ticks/20)+1:0)||r.points.some((p,i)=>p.time!==i*5||!Number.isFinite(p.value)||p.value<0||p.value>100||!Number.isFinite(p.temperature)||p.temperature<15||p.temperature>40))return fresh();
 return r;
}
export const yeastReady=r=>r.prepared&&r.connected;
export function advanceYeast(r,minutes=.25){
 if(!yeastReady(r))return;
 if(!r.points.length)r.points.push({time:0,value:0,temperature:r.temperature});
 for(let i=0,n=Math.min(Math.round(minutes*4),480-r.ticks);i<n&&r.volume<100;i++){
  r.temperature+=(r.bath-r.temperature)*(1-Math.exp(-.25/3));
  const rate=({none:.03,glucose:.94,sucrose:.91}[r.fuel])*r.variation;
  // Illustrative model in a limited temperature range, not a calibrated yeast response.
  if(r.ticks/4>=r.lag&&r.yeast)r.volume=Math.min(100,r.volume+rate*Math.pow(2,(r.temperature-30)/10)*.25);
  r.ticks++;
  if(r.ticks%20===0)r.points.push({time:r.ticks/4,value:Math.round(r.volume*10)/10,temperature:Math.round(r.temperature*10)/10});
 }
}
export function yeastReadings(r){return r.ticks===120&&r.fuel===r.condition&&r.yeast&&r.bath===30&&r.points.length===7?r.points.map(({time,value})=>({time,value})):[];}
