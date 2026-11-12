import test from 'node:test';
import assert from 'node:assert/strict';
import { planReady, enterInvestigationStage, recordedPlan, coreHasWork, extendedHasWork } from '../src/investigations/planning.js';
import { coreStudentReport, extendedStudentReport } from '../src/investigations/investigation-report.js';
import { fresh, restored } from '../src/investigations/model.js';
import { restoreState } from '../src/investigations/extended-model.js';
import { reportAttempt, reportLabIds } from './fixtures/report-attempts.js';

const time = '2026-11-12T03:00:00.000Z';

test('all shared investigations require prediction and design through stage transitions', () => {
  for (const id of reportLabIds.filter(id => id !== 'osmosis-homeostasis')) {
    const { state, c } = reportAttempt(id);
    const writing = state.notes || state;
    state.step = 0;
    writing.prediction = '';
    writing.design = '';
    assert.equal(enterInvestigationStage(state, 1, false, time), false, id);
    assert.equal(enterInvestigationStage(state, 2, false, time), false, id);
    writing.prediction = 'An initial prediction that may be wrong.';
    assert.equal(planReady(state), false, id);
    writing.design = 'Keep the other conditions matched.';
    assert.equal(enterInvestigationStage(state, 1, false, time), true, id);
    assert.equal(state.initialPlan.timing, 'before-observations', id);
    assert.equal(enterInvestigationStage(state, 9, false, time), false, id);
    assert.equal(state.step, 1, id);
    assert.equal(c.id, id);
  }
});

test('first predictions survive revisions, reports, and older state readers', () => {
  for (const id of ['mitosis', 'enzyme-activity']) {
    const { state, c } = reportAttempt(id);
    state.step = 0;
    const writing = state.notes || state;
    const original = writing.prediction;
    enterInvestigationStage(state, 1, false, time);
    const unchanged = state.notes ? coreStudentReport(c, state) : extendedStudentReport(c, state);
    assert.equal(unchanged.sections[0].blocks.filter(block => block.text === original).length, 1);
    assert.equal(unchanged.sections[0].blocks.filter(block => block.text === writing.design).length, 1);
    writing.prediction = 'I revised my prediction after seeing evidence.';
    enterInvestigationStage(state, 2, true, time);
    const restoredState = state.notes ? restored(c, JSON.stringify(state)) : restoreState(c, JSON.stringify(state));
    assert.equal(recordedPlan(restoredState).prediction, original);
    const report = state.notes ? coreStudentReport(c, restoredState) : extendedStudentReport(c, restoredState);
    assert.equal(report.planning.initial.prediction, original);
    assert.equal(report.planning.prediction, writing.prediction);
    assert.match(JSON.stringify(report.sections[0]), /before observations began/);
  }
});

test('existing observations remain intact and prediction timing stays unrecorded for earlier work', () => {
  for (const id of ['mitosis', 'enzyme-activity']) {
    const { state, c } = reportAttempt(id, true);
    const work = structuredClone(state.notes ? state.classifications : state.records);
    const hasWork = state.notes ? coreHasWork(state) : extendedHasWork(state);
    assert.equal(hasWork, true);
    const writing = state.notes || state;
    writing.prediction = '';
    assert.equal(enterInvestigationStage(state, 1, hasWork, time), false);
    writing.prediction = 'A later prediction.';
    enterInvestigationStage(state, 1, hasWork, time);
    assert.equal(recordedPlan(state).timing, 'timing-unrecorded');
    assert.deepEqual(state.notes ? state.classifications : state.records, work);
    const malformed = structuredClone(state);
    malformed.initialPlan.recordedAt = { toString: 'Invalid optional metadata' };
    assert.equal(recordedPlan(malformed), null);
    assert.equal(enterInvestigationStage(malformed, 1, hasWork, time), true);
    assert.deepEqual(malformed.notes ? malformed.classifications : malformed.records, work);
    assert.equal(malformed.initialPlan.timing, 'timing-unrecorded');
    const report = state.notes ? coreStudentReport(c, state) : extendedStudentReport(c, state);
    assert.match(JSON.stringify(report.sections[0]), /timing of the original prediction and design was not recorded/);
  }
  assert.equal(coreHasWork(fresh(reportAttempt('mitosis').c)), false);
});
