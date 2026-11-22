import {test} from 'node:test';
import assert from 'node:assert/strict';
import {teacherReport} from '../src/platform/teacher-report.js';
import {reportAttempt} from './fixtures/report-attempts.js';
import {coreStudentReport,extendedStudentReport} from '../src/investigations/investigation-report.js';
import {investigations} from '../src/investigations/content.js';
import {extendedById} from '../src/investigations/extended-content.js';
import {freshExtraction} from '../src/investigations/extraction-model.js';
import {extractionReport} from '../src/investigations/extraction-report.js';
import {freshGenetics} from '../src/investigations/genetics-model.js';
import {geneticsReport} from '../src/investigations/genetics-report.js';
const spec={teacherLabId:'private-copy',revisionId:'version-one',revision:1,contentHash:'hash',content:{title:'Teacher evidence lab',directions:'Use observations as evidence.',learningGoals:['Explain a comparison.','Explain a limit.'],questions:[{id:'q_evidence',prompt:'What supports your claim?',required:true}]}};
for(const id of ['light-photosynthesis','enzyme-activity'])test('teacher report preserves '+id+' evidence and required writing',()=>{
  const fixture=reportAttempt(id,true),base=investigations[id]?coreStudentReport(investigations[id],fixture.state):extendedStudentReport(extendedById[id],fixture.state);
  const pending=teacherReport(base,spec,{});assert.equal(pending.status,'In progress');
  const completed=teacherReport(base,spec,{q_evidence:'My exact response: α β & DNA'});assert.equal(completed.status,'Complete');assert.equal(completed.title,spec.content.title);assert.equal(completed.teacherLab.responses[0].response,'My exact response: α β & DNA');
  assert.deepEqual(completed.sections.slice(0,base.sections.length),base.sections);assert.equal(base.teacherLab,undefined);
});
for(const [name,build] of [
  ['extraction',()=>extractionReport(extendedById['dna-replication'],freshExtraction())],
  ['genetics',()=>geneticsReport(freshGenetics())],
])test('teacher '+name+' report retains the original title and cannot complete an unfinished investigation',()=>{
  const original=build(),report=teacherReport(original,spec,{q_evidence:'My own explanation.'});
  assert.equal(report.status,'In progress');assert.ok(report.teacherLab.baseTitle);assert.notEqual(report.teacherLab.baseTitle,spec.content.title);
  assert.ok(!JSON.stringify(report.document).includes('Original investigation: undefined'));
  assert.equal(report.teacherLab.responses[0].response,'My own explanation.');
});
