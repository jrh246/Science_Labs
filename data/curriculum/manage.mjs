import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const d=JSON.parse(fs.readFileSync(path.join(dir,'dataset.json'),'utf8'));
export function validate(data){
  assert.equal(data.schemaVersion,'1.1.0');
  const tables=['languages','providers','courses','courseResources','courseActivities','activities','resources','resourceNodes','resourceAlignments','frameworks','standards','standardAlignments','reviewQueue'];
  for(const name of tables){assert.ok(Array.isArray(data[name]),name);const ids=data[name].map(r=>r.id);assert.ok(ids.every(id=>typeof id==='string'&&id.length),`${name}: missing ID`);assert.equal(new Set(ids).size,ids.length,`${name}: duplicate ID`);}
  const has=(table,id)=>data[table].some(r=>r.id===id);
  const ref=(table,field,target,nullable=false)=>{for(const r of data[table])assert.ok(nullable&&r[field]===null||has(target,r[field]),`${table}.${r.id}: unknown ${field} ${r[field]}`);};
  ref('resources','providerId','providers');ref('resourceNodes','resourceId','resources');ref('resourceNodes','parentId','resourceNodes',true);
  for(const t of ['courseResources','courseActivities','resourceAlignments','standardAlignments'])ref(t,'courseId','courses');
  ref('courseResources','resourceId','resources');
  for(const t of ['courseActivities','resourceAlignments','standardAlignments'])ref(t,'activityId','activities');
  ref('resourceAlignments','nodeId','resourceNodes');ref('standards','frameworkId','frameworks');ref('standardAlignments','standardId','standards');
  const enums={activities:{status:['available','planned']},courses:{status:['active','expansion-planned']},resourceNodes:{metadataStatus:['source-confirmed','catalog-transcribed']},resourceAlignments:{status:['catalog-association','candidate','approved'],coverage:['supplemental']},standardAlignments:{status:['candidate','approved'],coverage:['partial-support','full-performance-expectation']}};
  for(const [table,fields] of Object.entries(enums))for(const row of data[table])for(const [field,values] of Object.entries(fields))assert.ok(values.includes(row[field]),`${table}.${row.id}: invalid ${field}`);
  for(const t of ['courses','activities','standards'])for(const r of data[t])assert.ok(r.grades.length&&r.grades.every(g=>Number.isInteger(g)&&g>=0&&g<=12),`${r.id}: invalid grades`);
  for(const t of ['providers','resources','resourceNodes','frameworks','standards'])for(const r of data[t])assert.equal(new URL(r.url).protocol,'https:',`${r.id}: invalid source URL`);
  for(const r of data.resourceNodes){const seen=new Set([r.id]);let p=r;while(p.parentId){assert.ok(!seen.has(p.parentId),'Resource hierarchy cycle');seen.add(p.parentId);p=data.resourceNodes.find(x=>x.id===p.parentId);assert.equal(p.resourceId,r.resourceId,'Cross-resource parent');}}
  for(const t of ['resourceAlignments','standardAlignments'])for(const r of data[t]){
    assert.ok(data.courseActivities.some(x=>x.courseId===r.courseId&&x.activityId===r.activityId),`${r.id}: missing course placement`);
    assert.ok(r.rationale?.length,`${r.id}: rationale required`);
    if(r.status==='approved')assert.ok(r.approvedBy&&r.approvedOn,`${r.id}: approval evidence required`);
  }
  for(const r of data.standardAlignments){assert.ok(r.remainingEvidence?.length,`${r.id}: missing coverage note`);const standard=data.standards.find(s=>s.id===r.standardId);const c=data.courses.find(c=>c.id===r.courseId);assert.ok(c.grades.some(g=>standard.grades.includes(g)),`${r.id}: grade mismatch`);}
  for(const table of ['resources','resourceNodes','activities'])for(const row of data[table]){
    assert.ok(Array.isArray(row.languageOptions)&&row.languageOptions.length, row.id+': missing language options');
    const codes=row.languageOptions.map(o=>o.language);
    assert.equal(new Set(codes).size,codes.length,row.id+': duplicate language');
    for(const o of row.languageOptions){
      assert.ok(has('languages',o.language),row.id+': unknown language');
      assert.ok(['available','partial','unverified','planned','draft','retired'].includes(o.status),row.id+': invalid language status');
      assert.ok(o.scope&&o.notes,row.id+': language scope required');
      if(o.status==='available')assert.ok(o.url,row.id+': available language requires a link');
      if(['available','partial'].includes(o.status))assert.ok(o.evidenceUrl&&o.checkedOn,row.id+': language evidence required');
      if(table!=='activities'&&o.url)assert.equal(new URL(o.url).protocol,'https:');
      if(table==='activities'&&o.language!==row.sourceLanguage&&o.status==='available')assert.ok(o.reviewedBy&&o.reviewedOn,row.id+': translated release needs review');
      if(table==='activities'&&row.status==='planned')assert.notEqual(o.status,'available',row.id+': planned activity cannot have a published language');
    }
  }
  return true;
}
validate(d);
if(process.argv.includes('--self-test')){
  const fails=mutate=>{const x=structuredClone(d);mutate(x);assert.throws(()=>validate(x));};
  fails(x=>x.activities.push({...x.activities[0]}));
  fails(x=>x.resourceAlignments[0].nodeId='missing');
  fails(x=>x.standardAlignments[0].status='approved');
  fails(x=>x.courses[0].grades=[99]);
  fails(x=>x.resourceNodes[0].parentId=x.resourceNodes[0].id);
  fails(x=>x.standardAlignments[0].courseId='math-7');
  fails(x=>x.activities[0].languageOptions[0].language='unknown');
  fails(x=>x.resources[0].languageOptions.push({...x.resources[0].languageOptions[0]}));
  fails(x=>x.resources[0].languageOptions[0].url=null);
  fails(x=>{const a=x.activities.find(a=>a.status==='available');Object.assign(a.languageOptions[1],{status:'available',url:'./es/lab.html',evidenceUrl:'local-review'});});
  console.log('Ten negative integrity tests passed.');
}
if(process.argv.includes('--export')){
  const csvDir=path.join(dir,'csv');fs.mkdirSync(csvDir,{recursive:true});
  const cell=v=>'"'+String(v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):v).replaceAll('"','""')+'"';
  const csv=(name,rows)=>{const keys=[...new Set(rows.flatMap(Object.keys))];fs.writeFileSync(path.join(csvDir,name+'.csv'),'\uFEFF'+[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n')+'\r\n');};
  for(const [name,rows] of Object.entries(d))if(Array.isArray(rows))csv(name,rows);
  const find=(table,id)=>d[table].find(r=>r.id===id);
  const languageSummary=row=>(row?.languageOptions??[]).map(o=>o.language+' ('+o.status+'; '+o.scope+')').join('; ');
  const languageLinks=row=>(row?.languageOptions??[]).filter(o=>o.url&&['available','partial'].includes(o.status)).map(o=>o.language+': '+o.url).join('; ');
  const languageRows=['resources','resourceNodes','activities'].flatMap(table=>d[table].flatMap(row=>row.languageOptions.map(o=>({entity_type:table,entity_id:row.id,title:row.title,...o}))));
  csv('language-options',languageRows);
  const rows=[];
  for(const c of d.courses){const placements=d.courseActivities.filter(r=>r.courseId===c.id);if(!placements.length)rows.push({course:c.title,course_id:c.id,grades:c.grades.join(';'),course_status:c.status,activity:'',notes:'No local activities assigned yet.',resource_options:d.courseResources.filter(r=>r.courseId===c.id).map(r=>{const resource=find('resources',r.resourceId);return resource.title+' ['+languageSummary(resource)+']';}).join('; ')});
    for(const p of placements){const a=find('activities',p.activityId);const matches=d.resourceAlignments.filter(r=>r.courseId===c.id&&r.activityId===a.id);for(const m of matches.length?matches:[null]){const n=m&&find('resourceNodes',m.nodeId),r=n&&find('resources',n.resourceId);const standards=d.standardAlignments.filter(s=>s.courseId===c.id&&s.activityId===a.id);rows.push({course:c.title,course_id:c.id,grades:c.grades.join(';'),course_status:c.status,activity:a.title,activity_languages:languageSummary(a),activity_language_links:languageLinks(a),teacher_translation:a.translationWorkflow.teacherTranslation,activity_id:a.id,activity_status:a.status,placement_status:p.status,provider:r?find('providers',r.providerId).name:'',resource:r?.title??'',edition:r?.edition??'',node_type:n?.type??'',chapter_or_unit:n?.number??'',chapter_or_unit_title:n?.title??'',source_url:n?.url??'',source_languages:languageSummary(n),source_language_links:languageLinks(n),resource_metadata_status:n?.metadataStatus??'',alignment_status:m?.status??'unmapped',standards:standards.map(s=>find('standards',s.standardId).code).join(';'),standards_status:standards.length?[...new Set(standards.map(s=>s.status+' — '+s.coverage))].join(';'):'not mapped',remaining_evidence:standards.map(s=>s.remainingEvidence).join(' | '),notes:m?.rationale??'',adaptation:p.adaptation});}}
  }
  csv('alignment-view',rows);
  console.log(`Exported ${rows.length} readable alignment rows and normalized CSV tables.`);
}
console.log(`Valid dataset: ${d.courses.length} courses; ${d.activities.length} activities; ${d.resourceAlignments.length} resource mappings; ${d.standardAlignments.length} standards mappings.`);
