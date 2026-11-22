import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {labs as catalog} from '../src/catalog.js';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const queueFile='data/development-tracker/biology-build-queue.json';
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const artifactGroups=['workflow','visuals','pdfReports','nativePrint','tests','resources'];
export function evidenceExists(ref,root=repo){
  if(!nonempty(ref))return false;
  if(ref.startsWith('https://')){try{return Boolean(new URL(ref).hostname);}catch{return false;}}
  const path=ref.split('#')[0].replace(/:\d+$/,'');if(isAbsolute(path))return false;
  const target=resolve(root,path),back=relative(root,target);return !back.startsWith('..')&&!isAbsolute(back)&&existsSync(target);
}
export function validateReview(record,lab,checklist,{fileExists=evidenceExists}={}){
  assert(record&&record.schemaVersion===1&&record.labId===lab.labId&&record.taskId===lab.review.id,`Review identity does not match ${lab.review.id}.`);
  assert.equal(record.decision,'pass',`${lab.review.id}: decision is not pass.`);
  assert(nonempty(record.reviewedBy)&&nonempty(record.sourceSnapshot)&&nonempty(record.summary),`${lab.review.id}: reviewer, source snapshot, and summary are required.`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(record.reviewedOn)&&new Date(record.reviewedOn).toISOString().slice(0,10)===record.reviewedOn,`${lab.review.id}: record an actual review date.`);
  assert(Array.isArray(record.blockers)&&record.blockers.length===0,`${lab.review.id}: unresolved blockers prevent the next lab.`);
  assert(record.checks&&typeof record.checks==='object',`${lab.review.id}: missing checklist.`);
  for(const item of checklist){
    const check=record.checks[item.id];assert(check?.status==='pass',`${lab.review.id}: ${item.id} has not passed.`);
    assert(nonempty(check.notes)&&Array.isArray(check.evidence)&&check.evidence.length>0,`${lab.review.id}: ${item.id} needs findings and evidence.`);
    for(const ref of check.evidence)assert(fileExists(ref),`${lab.review.id}: missing or invalid evidence ${ref}.`);
  }
  for(const group of artifactGroups){const refs=record.artifacts?.[group];assert(Array.isArray(refs)&&refs.length>0,`${lab.review.id}: missing ${group} artifacts.`);for(const ref of refs)assert(fileExists(ref),`${lab.review.id}: missing artifact ${ref}.`);}
  for(const type of ['teacherStudentComprehension','physicalDevices','classroomProtocol']){
    const external=record.externalValidation?.[type];assert(external&&['pending','passed','not-applicable'].includes(external.status)&&nonempty(external.notes),`${lab.review.id}: record ${type} separately.`);
    if(external.status==='passed'){assert(nonempty(external.reviewedBy)&&nonempty(external.reviewedOn)&&Array.isArray(external.evidence)&&external.evidence.length>0,`${lab.review.id}: external acceptance needs actual reviewer/evidence.`);for(const ref of external.evidence)assert(fileExists(ref),`${lab.review.id}: missing external evidence ${ref}.`);}
  }
}
export function validateQueue(plan,{labs=catalog,records={},fileExists=evidenceExists,guideIds=Array.from({length:18},(_,i)=>'G'+String(i+1).padStart(2,'0'))}={}){
  assert(plan.schemaVersion===1&&plan.concurrencyLimit===1,'The Biology queue requires schema 1 and one lab at a time.');
  assert(Array.isArray(plan.labs)&&plan.labs.length>0,'The Biology queue is empty.');
  assert.equal(plan.catalogSnapshot.planned,plan.labs.length,'The original planned-lab snapshot and queue length differ.');
  const checks=plan.checklist||[],checkIds=checks.map(item=>item.id);assert.equal(new Set(checkIds).size,checkIds.length,'Duplicate review criterion.');
  for(const id of [...guideIds,'RESOURCES','ACCESS','TRACKING'])assert(checkIds.includes(id),'Missing review criterion '+id+'.');
  const ids=plan.labs.map(lab=>lab.labId);assert.equal(new Set(ids).size,ids.length,'A lab occurs more than once in the queue.');
  for(const current of labs.filter(lab=>lab.subjectId==='biology'&&lab.status==='planned'))assert(ids.includes(current.id),'Planned Biology lab is missing from the queue: '+current.id);
  let previousPassed=true,nextTask=null,accepted=0,activeLab=null;
  for(const [index,lab] of plan.labs.entries()){
    const prefix='BIO-'+String(index+1).padStart(2,'0'),current=labs.find(item=>item.id===lab.labId);
    assert(current&&current.subjectId==='biology',`Unknown Biology lab ${lab.labId}.`);assert.equal(lab.sourceStatusOnPlan,'planned','Only the original planned scope belongs in this queue.');
    assert.equal(lab.sequence,index+1,'Sequence is out of order.');assert.equal(lab.build.id,prefix+'-BUILD','Build task ID is out of order.');assert.equal(lab.review.id,prefix+'-REVIEW','Review task ID is out of order.');
    assert.deepEqual(lab.build.dependsOn,index?[`BIO-${String(index).padStart(2,'0')}-REVIEW`]:[],`${prefix}: build must depend on the previous review.`);
    assert.deepEqual(lab.review.dependsOn,[lab.build.id],`${prefix}: review must depend on its own build.`);
    assert.equal(lab.review.record,`data/development-tracker/biology-reviews/${lab.labId}.json`,'Unexpected review record path.');
    assert(['queued','in-progress','done'].includes(lab.build.status),'Invalid build status.');assert(['queued','in-progress','changes-required','passed'].includes(lab.review.status),'Invalid review status.');
    if(!previousPassed)assert(lab.build.status==='queued'&&lab.review.status==='queued',`${prefix}: previous lab review has not passed; do not start this lab.`);
    if(lab.build.status==='queued')assert.equal(lab.review.status,'queued',`${prefix}: review cannot precede a build.`);
    if(['in-progress','passed'].includes(lab.review.status))assert.equal(lab.build.status,'done',`${prefix}: finish the build before its review.`);
    if(lab.review.status==='changes-required')assert.equal(lab.build.status,'in-progress',`${prefix}: reopen this build to fix its failed review.`);
    if(lab.review.status==='passed'){
      validateReview(records[lab.labId],lab,checks,{fileExists});assert.equal(current.status,'available',`${prefix}: reviewed build is not available in the catalog.`);accepted++;
    }else if(previousPassed){
      const build=lab.build.status!=='done';nextTask={id:build?lab.build.id:lab.review.id,type:build?'build':'review',labId:lab.labId,title:lab.title,status:build?lab.build.status:lab.review.status};
      if(lab.build.status==='in-progress'||lab.review.status==='in-progress')activeLab=lab.labId;
    }
    previousPassed=lab.review.status==='passed';
  }
  return {labs:plan.labs.length,tasks:plan.labs.length*2,accepted,remaining:plan.labs.length-accepted,nextTask,activeLab};
}
export function renderQueue(plan,state){
  const next=state.nextTask,rows=plan.labs.map(lab=>{
    const gate=lab.sequence===1?'Start':lab.build.dependsOn[0];const mark=status=>['done','passed'].includes(status)?'[x]':'[ ]';
    return `| ${lab.sequence} | ${lab.title} | ${lab.unitTitle} · ${lab.chapter} | ${mark(lab.build.status)} ${lab.build.id} (${lab.build.status}) | ${mark(lab.review.status)} ${lab.review.id} (${lab.review.status}) | ${gate} |`;
  });
  return `# Remaining Biology build tasks

Generated from [biology-build-queue.json](data/development-tracker/biology-build-queue.json). Edit queue/review sources and run \`npm run biology:queue:render\`; do not hand-check this generated table.

Initial scope (2026-11-14): **33 planned labs**, **66 linked build/review tasks**, and one lab at a time. The original 15 available catalog labs and supplementary pathways are outside this new-build queue. Order follows the existing chapter/unit catalog; chapter numbers are developer reading references, not student-facing lab names.

**Current next task:** ${next?`\`${next.id}\` — ${next.title} (${next.type}; ${next.status==='queued'?'ready':next.status}).`:'None; all development reviews passed.'}
**Development reviews passed:** ${state.accepted}/${state.labs}. This is not whole-course, translation, classroom, or production-release approval.

## Your one-at-a-time review

The build/review marks below are development checks. Your lab reviews are tracked separately in [BIOLOGY_USER_REVIEW.md](BIOLOGY_USER_REVIEW.md); only your stated reviews are checked off there.

## Required sequence

1. Run \`npm run biology:queue\` and read the current [design guide](LAB_DESIGN_GUIDE.md), [audit](LAB_DESIGN_AUDIT.md), [architecture](ARCHITECTURE.md), and [resource plan](LAB_RESOURCES_PLAN.md). Resume the current lab rather than starting another.
2. Mark only the ready build \`in-progress\`. Confirm the learning question and two to four goals, research the science, plan meaningful interactions and realistic visuals, justify controls/repetition, choose modes, and define the evidence/report before implementation. Add only the shared scaffolding needed for this lab.
3. Build its model, interface, feedback/gates, accessible interactions, persistence, completed PDF/native print, and matching student/teacher materials. Preserve existing attempts and other labs. Prepare authored content for future translation; do not claim Spanish support without reviewed app and print coverage.
4. Run applicable checks and capture evidence. When the implementation is ready for review, set its build to \`done\`; its review becomes the next ready task. Copy [the review template](data/development-tracker/biology-reviews/template.json) to the exact lab-specific path listed in the queue.
5. Perform a **separate development-review pass** against every requirement below. Record source/build identity, reviewer/date, findings, actual test results, screenshots, rendered PDFs/native-print evidence, and resource checks. A successful build, a catalog label, or test results alone do not pass this review.
6. If any applicable requirement fails, record the blocker, set review to \`changes-required\` and reopen the same build as \`in-progress\`. Fix it and rerun the affected review checks before returning to review. Keep initial failures and their corrections in the review record's history. Do not start the next lab.
7. Set review to \`passed\` only after its evidence record has decision \`pass\`, every required development check passes, and blockers are empty. Run \`npm run biology:queue:check\` and render the updated task list. Only then may the following lab start. The validator checks record/dependency integrity; it does not independently judge teaching quality.

Update actual catalog/resource/dataset records as implementation becomes real. When dataset sources change, regenerate and sync their outputs using the existing development-tracker instructions. Do not award standards approval or whole-course completion from task completion. Keep production publication off until its separate release decision; development review does not publish a course/unit/lab.

This workflow does not require a new user-confirmation pause after every lab. Required expert input or unresolved scientific/content questions are blockers. Teacher/student comprehension, physical devices, and classroom protocol validation remain explicitly recorded as pending unless actually performed; development acceptance must not claim those outcomes. If a specific external review is necessary to resolve a scientific or procedural uncertainty, it must be resolved before the development gate passes.

G18 is a **localization-readiness** check for these builds. Full native language selection and Spanish/other-language printable delivery remain future [AUD-10](LAB_DESIGN_AUDIT.md#aud-10) work unless explicitly implemented and validated. English acceptance does not establish translated readiness.

## Ordered build and review tasks

| Order | Lab | Unit · reading chapter | Build task | Required review | Build dependency |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

## Required review checklist

${plan.checklist.map(item=>`- **${item.id} — ${item.title}:** ${item.requirement}`).join('\n')}

Review evidence must identify the actual lab/review task, source snapshot, reviewer and date. Each check needs findings and existing artifact/source references. Keep separate workflow, visual, PDF, native-print, test, and resource artifacts. Use synthetic student identities/work for retained evidence; do not commit real student records. Use stable/versioned artifact locations or review records with retained supporting files, rather than an unrecorded live preview.

## Per-lab build briefs

${plan.labs.map(lab=>`### ${lab.build.id} / ${lab.review.id} — ${lab.title}\n\nStable ID: \`${lab.labId}\`. Unit: ${lab.unitTitle}. Reading reference: ${lab.chapter} — ${lab.chapterTitle}.\n\nStarting purpose from the current catalog: ${lab.purpose} Refine this into the learning/evidence plan before coding. Apply the complete build/review sequence above; this brief is not scientific or classroom acceptance.\n`).join('\n')}
`;
}
function main(){
  const plan=JSON.parse(readFileSync(resolve(repo,queueFile),'utf8')),records={};
  for(const lab of plan.labs)if(lab.review.status==='passed')records[lab.labId]=JSON.parse(readFileSync(resolve(repo,lab.review.record),'utf8'));
  const guideIds=[...readFileSync(resolve(repo,'LAB_DESIGN_GUIDE.md'),'utf8').matchAll(/^\*\*(G\d+) /gm)].map(match=>match[1]);
  const state=validateQueue(plan,{records,guideIds});
  if(process.argv.includes('--render')){writeFileSync(resolve(repo,'BIOLOGY_BUILD_TASKS.md'),renderQueue(plan,state));console.log('Regenerated BIOLOGY_BUILD_TASKS.md.');}
  console.log(`${state.labs} labs; ${state.tasks} dependent tasks; ${state.accepted} development reviews passed.`);
  console.log(state.nextTask?`Next: ${state.nextTask.id} — ${state.nextTask.title} (${state.nextTask.type}).`:'No remaining build tasks. External/release acceptance remains separate.');
  if(state.nextTask)console.log('Later labs remain blocked until this lab passes its documented development review.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main();}catch(error){console.error('Biology queue check failed:',error.message);process.exitCode=1;}}
