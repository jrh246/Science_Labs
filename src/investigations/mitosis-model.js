export function newMicroscope(){return {version:1,loaded:false,light:false,brightness:65,objective:10,focus:25,located:false,selected:0,answers:Array(20).fill(null),checked:false,practiceField:'field-a',hours:24};}
export function focused(r){return r.loaded&&r.light&&r.brightness>=25&&r.brightness<=90&&Math.abs(r.focus-50)<=5;}
export function canClassify(r){return focused(r)&&r.objective===40&&r.located;}
export function restoreMicroscope(value,answers){
 const fresh=newMicroscope();if(Array.isArray(answers)&&answers.length===20&&answers.every(a=>a===null||Number.isInteger(a)&&a>=0&&a<5))fresh.answers=[...answers];
 if(!value)return fresh;
 const r=structuredClone(value);
 if(r.version!==1||!['loaded','light','located','checked'].every(k=>typeof r[k]==='boolean')||![10,40].includes(r.objective)||!Number.isInteger(r.selected)||r.selected<0||r.selected>=20||![r.focus,r.brightness].every(n=>Number.isFinite(n)&&n>=0&&n<=100)||!Array.isArray(r.answers)||r.answers.length!==20||!r.answers.every(a=>a===null||Number.isInteger(a)&&a>=0&&a<5)||!['field-a','field-b'].includes(r.practiceField)||!Number.isFinite(r.hours)||r.hours<1||r.hours>48)return fresh;
 if(answers)r.answers=fresh.answers;
 if(r.answers.some(a=>a===null))r.checked=false;
 return r;
}
