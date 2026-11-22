import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateQueue} from '../scripts/biology-build-queue.mjs';
const source=JSON.parse(readFileSync(new URL('../data/development-tracker/biology-build-queue.json',import.meta.url),'utf8'));
function fixture(){
  const plan=structuredClone(source);plan.labs=plan.labs.slice(0,2);plan.catalogSnapshot={total:2,available:0,planned:2};
  for(const lab of plan.labs){lab.build.status='queued';lab.review.status='queued';}
  const labs=plan.labs.map(lab=>({id:lab.labId,subjectId:'biology',status:'planned'}));
  return {plan,options:{labs,records:{},fileExists:()=>true}};
}
function reviewFixture(plan,lab){
  return {schemaVersion:1,labId:lab.labId,taskId:lab.review.id,decision:'pass',reviewedBy:'TEST FIXTURE — not a real lab review',reviewedOn:'2026-11-14',sourceSnapshot:'TEST ONLY',summary:'Synthetic validator evidence; no Biology implementation is certified.',blockers:[],
    checks:Object.fromEntries(plan.checklist.map(item=>[item.id,{status:'pass',notes:'Synthetic validator finding.',evidence:['fixture-proof.md']}])),
    artifacts:Object.fromEntries(['workflow','visuals','pdfReports','nativePrint','tests','resources'].map(key=>[key,['fixture-proof.md']])),
    externalValidation:Object.fromEntries(['teacherStudentComprehension','physicalDevices','classroomProtocol'].map(key=>[key,{status:'pending',notes:'Not performed; never inferred from this validator test.'}]))};
}
function passFirst(data){const lab=data.plan.labs[0];lab.build.status='done';lab.review.status='passed';data.options.labs[0].status='available';data.options.records[lab.labId]=reviewFixture(data.plan,lab);return data.options.records[lab.labId];}
test('only the first build is ready in an untouched queue',()=>{
  const data=fixture(),state=validateQueue(data.plan,data.options);assert.equal(state.nextTask.id,'BIO-01-BUILD');assert.equal(state.accepted,0);assert.equal(state.tasks,4);
});
test('a later lab cannot start before the previous development review passes',()=>{
  const data=fixture();data.plan.labs[1].build.status='in-progress';assert.throws(()=>validateQueue(data.plan,data.options),/previous lab review has not passed/);
  data.plan.labs[0].build.status='done';assert.throws(()=>validateQueue(data.plan,data.options),/previous lab review has not passed/);
});
test('a completed build unlocks its review, not the next lab',()=>{
  const data=fixture();data.plan.labs[0].build.status='done';const state=validateQueue(data.plan,data.options);assert.equal(state.nextTask.id,'BIO-01-REVIEW');assert.equal(state.accepted,0);
});
test('checking passed without a real evidence record is rejected',()=>{
  const data=fixture();data.plan.labs[0].build.status='done';data.plan.labs[0].review.status='passed';assert.throws(()=>validateQueue(data.plan,data.options),/Review identity/);
});
test('a complete passing development record unlocks exactly the next build while external reviews stay pending',()=>{
  const data=fixture(),record=passFirst(data),state=validateQueue(data.plan,data.options);assert.equal(state.accepted,1);assert.equal(state.nextTask.id,'BIO-02-BUILD');assert.equal(record.externalValidation.physicalDevices.status,'pending');
});
test('scientific failures and unresolved blockers prevent advancement',()=>{
  const data=fixture(),record=passFirst(data);record.checks.G03.status='fail';assert.throws(()=>validateQueue(data.plan,data.options),/G03 has not passed/);
  record.checks.G03.status='pass';record.blockers.push('Scientific interpretation remains unresolved.');assert.throws(()=>validateQueue(data.plan,data.options),/unresolved blockers/);
});
test('a failed review reopens the current build and keeps the following lab locked',()=>{
  const data=fixture(),first=data.plan.labs[0];first.build.status='in-progress';first.review.status='changes-required';const state=validateQueue(data.plan,data.options);assert.equal(state.nextTask.id,'BIO-01-BUILD');assert.equal(state.activeLab,first.labId);assert.equal(state.accepted,0);
});
test('missing artifacts or unsupported claims of external acceptance cannot pass',()=>{
  const data=fixture(),record=passFirst(data);data.options.fileExists=()=>false;assert.throws(()=>validateQueue(data.plan,data.options),/missing or invalid evidence/);
  data.options.fileExists=()=>true;record.artifacts.pdfReports=[];assert.throws(()=>validateQueue(data.plan,data.options),/missing pdfReports artifacts/);
  record.artifacts.pdfReports=['fixture-proof.md'];record.externalValidation.physicalDevices.status='passed';assert.throws(()=>validateQueue(data.plan,data.options),/external acceptance needs actual reviewer/);
});
test('catalog omissions, duplicated labs, and bypassed dependencies are detected',()=>{
  const data=fixture();data.options.labs.push({id:'untracked-lab',subjectId:'biology',status:'planned'});assert.throws(()=>validateQueue(data.plan,data.options),/missing from the queue/);
  data.options.labs.pop();data.plan.labs[1].build.dependsOn=[];assert.throws(()=>validateQueue(data.plan,data.options),/previous review/);
  data.plan.labs[1].labId=data.plan.labs[0].labId;assert.throws(()=>validateQueue(data.plan,data.options),/more than once/);
});
test('new guide requirements cannot be silently omitted from the review checklist',()=>{
  const data=fixture();data.options.guideIds=['G01','G19'];assert.throws(()=>validateQueue(data.plan,data.options),/Missing review criterion G19/);
});
