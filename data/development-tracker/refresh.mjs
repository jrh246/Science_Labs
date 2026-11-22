import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const plan=JSON.parse(fs.readFileSync(path.join(dir,'course-plan.json')));
const data=JSON.parse(fs.readFileSync(path.join(dir,'../curriculum/dataset.json')));
assert.equal(new Set(plan.courses.map(c=>c.id)).size,plan.courses.length);
const csv=(name,rows)=>{const keys=[...new Set(rows.flatMap(Object.keys))];const cell=v=>'"'+String(v==null?'':Array.isArray(v)?v.join('; '):v).replaceAll('"','""')+'"';fs.writeFileSync(path.join(dir,name), '\uFEFF'+[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n')+'\r\n');};
const records=plan.courses.map(c=>{
 const matches=data.resourceAlignments.filter(m=>m.courseId===c.appCourseId&&data.resourceNodes.some(n=>n.id===m.nodeId&&n.resourceId===c.resourceId));
 const ids=[...new Set(matches.map(m=>m.activityId))];
 const built=ids.filter(id=>data.activities.some(a=>a.id===id&&a.status==='available'));
 const planned=ids.filter(id=>data.activities.some(a=>a.id===id&&a.status==='planned'));
 const ready=built.filter(id=>matches.some(m=>m.activityId===id&&['catalog-association','approved'].includes(m.status))&&data.courseActivities.some(p=>p.courseId===c.appCourseId&&p.activityId===id&&p.status==='current'));
 const reviewed=built.filter(id=>matches.some(m=>m.activityId===id&&m.status==='approved'));
 assert.ok(ready.length<=built.length&&reviewed.length<=built.length);
 return {...c,hasBuiltActivity:ready.length>0,existingCourseActivities:ready.length,builtReuseCandidates:built.filter(id=>!ready.includes(id)).length,plannedActivities:planned.length,reviewedAlignments:reviewed.length,wholeCourseComplete:false,status:ready.length?'in-progress':built.length?'adaptation-review-needed':'not-started',nextStep:ready.length?'Review existing alignments and finish planned activities.':built.length?'Adapt existing activities for this grade and verify source/standards alignment.':'Define course units, select resource edition, and plan original activities.',activityIds:ids};
});
const state={schemaVersion:'1.0.0',generatedOn:new Date().toISOString(),alignmentSnapshotDate:data.snapshotDate,scope:plan.scope,completionPolicy:'hasBuiltActivity means at least one available activity has an existing catalog association or approved alignment and a current course placement. It does not mean full-course coverage, reviewed standards, or a deployed release. Whole-course completion remains false until a defined scope and completion evidence are recorded.',courses:records};
fs.writeFileSync(path.join(dir,'tracker.json'),JSON.stringify(state,null,2)+'\n');
csv('course-checklist.csv',records);
csv('activity-checklist.csv',data.activities.map(a=>({id:a.id,title:a.title,built:a.status==='available',status:a.status,unit:a.unitId,kind:a.kind,sourceFile:a.catalogSource,englishStatus:a.languageOptions?.find(o=>o.language==='en')?.status,spanishStatus:a.languageOptions?.find(o=>o.language==='es')?.status,reviewedStandardMatches:data.standardAlignments.filter(s=>s.activityId===a.id&&s.status==='approved').length})));
let md='# Course development checklist\n\nGenerated from course-plan.json and ../curriculum/dataset.json. Edit those sources, then run refresh.mjs; do not hand-edit this generated checklist.\n\n[x] = at least one built activity currently associated with this course. It does not mean the course is finished or its standards alignment is approved. Existing reuse candidates remain unchecked until adapted/reviewed. No course is marked complete.\n\n'+plan.scope+'\n\n';
for(const provider of ['openstax','core-knowledge']){md+=`## ${provider==='openstax'?'OpenStax':'Core Knowledge'}\n\n`;for(const c of records.filter(r=>r.provider===provider))md+=`- [${c.hasBuiltActivity?'x':' '}] **${c.title}** — ${c.status}; ${c.existingCourseActivities} current built, ${c.builtReuseCandidates} reuse candidates, ${c.plannedActivities} planned; ${c.reviewedAlignments} reviewed alignments. [Source](${c.sourceUrl})\n`;md+='\n';}
fs.writeFileSync(path.join(dir,'COURSE_CHECKLIST.md'),md);
assert.equal(records.filter(c=>c.provider==='core-knowledge').length,37);
assert.ok(records.every(c=>c.hasBuiltActivity===(c.existingCourseActivities>0)));
console.log(`Generated ${records.length} courses and ${data.activities.length} activity checks. ${records.filter(c=>c.hasBuiltActivity).length} course has current built activities; ${records.filter(c=>c.status==='adaptation-review-needed').length} courses have reuse candidates.`);
