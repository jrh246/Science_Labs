export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function random(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
export function sequence(c){return c.conditions.flatMap((condition,conditionIndex)=>Array.from({length:c.repeats},(_,i)=>({condition,conditionIndex,repeat:i+1})));}
export function newRun(c,index,seed=12345,conditionOverride){const job=sequence(c)[index]||sequence(c)[0];const ci=conditionOverride??job.conditionIndex;
 return {conditionIndex:ci,repeat:job.repeat,seed:(seed+index*7919)>>>0,prepared:0,time:0,readings:[],scores:[],selected:0,reviewed:false,focus:50,objective:10,ruler:20,light:false,viewer:false,stained:false,setting:c.settings?.[ci]??(c.kind==='gel'?80:1),estimates:['','',''],note:''};}
export function specimens(c,r){const rng=random(r.seed);return Array.from({length:c.count||0},()=>{const p=rng();if(c.kind==='corn')return p<.75?0:1;if(c.kind==='flies')return p<.41?0:p<.82?1:p<.91?2:3;return p<.58?0:p<.8?1:2;});}
export function cellLength(r){return Math.round(([130,65,35][r.conditionIndex])*(.85+random(r.seed)()*.3));}
export function valueAt(c,r,t){const v=.90+random(r.seed)()*.20,ci=r.conditionIndex;
 switch(c.kind){
 case 'enzyme':return 24*v*(1-Math.exp(-t/170*2**((r.setting-22)/12)));
 case 'plant':return (3+random(r.seed+1)()*1.2)+(ci===0?.30:.78)*v*t;
 case 'extraction':return clamp(Math.floor(t/5*([3,1,0][ci])*v+.25),0,3);
 case 'expression':return 2+v*(ci===0?90*(1-Math.exp(-Math.max(0,t-1)/3)):ci===2?2*(1-Math.exp(-t/3)):0);
 case 'regulation':return ci===1?0:Math.round(36*v*clamp((t-8)/16,0,1));
 default:return 0;
 }}
export function advance(c,r,delta){const end=Math.min(c.duration,r.time+Math.max(0,delta));const out={...r,time:end,readings:[...r.readings]};
 if(!out.readings.length)out.readings.push([0,+valueAt(c,r,0).toFixed(2)]);
 for(let t=(Math.floor((r.time+1e-8)/c.interval)+1)*c.interval;t<=end+1e-8;t+=c.interval)out.readings.push([t,+valueAt(c,r,t).toFixed(2)]);
 return out;
}
export function counts(scores,n){return Array.from({length:n},(_,i)=>scores.filter(x=>x===i).length);}
export function mapping(kind,totals){const n=totals.reduce((a,b)=>a+b,0);if(!n)return null;return (kind==='asci'?50:100)*(totals[2]+(kind==='asci'?totals[1]:totals[3]))/n;}
export function chiSquare(totals){const n=totals.reduce((a,b)=>a+b,0);return n?totals.reduce((sum,o,i)=>{const e=n*[.75,.25][i];return sum+(o-e)**2/e;},0):null;}
export const ladder=[4000,2000,1000,500];
export const bands=[[4000,2000,1000,500],[3000,1500,700],[2500,1200,600],[3000,1500,700]];
export function bandDistance(bp,progress=1,voltage=80){return (88-20*Math.log10(bp))*progress*(voltage/80);}
export function bandSize(distance,progress=1,voltage=80){return 10**((88-distance/progress/(voltage/80))/20);}
export function ready(c,r){if(r.prepared<c.steps.length)return false;
 if(c.categories)return r.scores.length===c.count&&r.scores.every(x=>Number.isInteger(x)&&x>=0&&x<c.categories.length)&&r.reviewed;
 if(c.kind==='microscope')return r.objective===40&&Math.abs(r.focus-50)<=12&&Number.isFinite(r.ruler)&&r.ruler>0;
 if(r.time<c.duration)return false;
 if(c.kind==='gel')return r.stained&&r.estimates.every(x=>String(x).trim()!==''&&Number.isFinite(Number(x))&&Number(x)>0&&Number(x)<=100000);
 if(['expression','regulation'].includes(c.kind))return r.viewer;
 return true;
}
export function result(c,r){if(c.categories)return counts(r.scores,c.categories.length);if(c.kind==='microscope')return [r.ruler*2];if(c.kind==='gel')return r.estimates.map(Number);if(c.kind==='regulation')return [valueAt(c,r,r.time),r.conditionIndex===3?1:0];return [+valueAt(c,r,r.time).toFixed(2)];}
export function record(c,r,source='virtual',values=result(c,r),note=''){return {condition:c.conditions[r.conditionIndex],conditionIndex:r.conditionIndex,repeat:r.repeat,source,values,unit:c.unit,note,readings:source==='virtual'?r.readings:[],modelVersion:source==='virtual'?c.version:null,settings:source==='virtual'?{setting:r.setting,seed:r.seed}:null};}
export function freshState(c,seed=Date.now()>>>0){return {version:1,seed,step:0,records:[],exploration:[],run:newRun(c,0,seed),prediction:'',design:'',answers:['','',''],complete:false};}
export function restoreState(c,raw){try{const s=JSON.parse(raw);if(!s||s.version!==1||!Array.isArray(s.records)||s.records.length>sequence(c).length)throw Error();
 const validRecord=x=>x&&['virtual','classroom'].includes(x.source)&&Number.isInteger(x.conditionIndex)&&x.conditionIndex>=0&&x.conditionIndex<c.conditions.length&&Array.isArray(x.values)&&x.values.every(Number.isFinite);
 if(!s.records.every(validRecord)||!s.run||!Number.isFinite(s.run.time)||!Array.isArray(s.run.scores)||!Array.isArray(s.run.readings))throw Error();
 const r=s.run;
 if(!Number.isInteger(r.conditionIndex)||r.conditionIndex<0||r.conditionIndex>=c.conditions.length||!Number.isInteger(r.prepared)||r.prepared<0||r.prepared>c.steps.length||r.time<0||r.time>c.duration||!Number.isInteger(r.selected)||r.selected<0||r.selected>=(c.count||1))throw Error();
 if(![r.seed,r.focus,r.objective,r.ruler,r.setting].every(Number.isFinite)||!Array.isArray(r.estimates)||r.estimates.length!==3||!r.readings.every(x=>Array.isArray(x)&&x.length===2&&x.every(Number.isFinite)))throw Error();
 if(c.categories&&r.scores.some(x=>x!==null&&(!Number.isInteger(x)||x<0||x>=c.categories.length)))throw Error();
 if(!Array.isArray(s.answers)||s.answers.length!==3||!s.answers.every(x=>typeof x==='string')||typeof s.prediction!=='string'||typeof s.design!=='string'||typeof r.note!=='string')throw Error();
 return {...freshState(c,s.seed),...s,step:clamp(Number(s.step)||0,0,2),exploration:Array.isArray(s.exploration)?s.exploration.filter(validRecord):[]};
 }catch{return freshState(c);}}
export function csv(rows){return rows.map(row=>row.map(x=>{let v=String(x??'');if(/^[=+@\-]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
