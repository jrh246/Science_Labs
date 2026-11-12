import test from 'node:test';
import assert from 'node:assert/strict';
import { reportAttempt, reportLabIds } from './fixtures/report-attempts.js';
import { coreStudentReport, extendedStudentReport } from '../src/investigations/investigation-report.js';
import { osmosisStudentReport } from '../src/osmosis-report.js';
import { studentReportText, studentReportHtml, studentReportPdf, reportFilename } from '../src/investigations/student-report.js';
import { recordFeedback, feedbackSummaries } from '../src/investigations/report-feedback.js';
import { freshExtraction, answerCheckpoint, restoreExtraction } from '../src/investigations/extraction-model.js';
import { extractionReport, extractionReportFilename, reportHtml, reportDefinition } from '../src/investigations/extraction-report.js';

const clock = { exportedAt: '2026-11-11T21:30:00Z', timeZone: 'America/Los_Angeles' };
function build(attempt) {
  if (attempt.id === 'osmosis-homeostasis') return osmosisStudentReport(attempt.state, clock);
  return ['leaf', 'yeast', 'mitosis'].includes(attempt.c.kind)
    ? coreStudentReport(attempt.c, attempt.state, clock)
    : extendedStudentReport(attempt.c, attempt.state, clock);
}

test('all 14 report pathways group actual evidence by learning goal across PDF, print, text and response data', () => {
  for (const id of reportLabIds) {
    const attempt = reportAttempt(id, true);
    attempt.state.studentName = 'Zoë García';
    const before = structuredClone(attempt.state);
    const report = build(attempt);
    const text = studentReportText(report);
    assert.equal(report.schemaVersion, 2);
    assert.ok(report.evidence.length >= 3, id);
    assert.match(text, /Evidence by learning goal/);
    assert.match(text, /Revisions and feedback/);
    assert.match(text, /Nov 11, 2026, 1:30 PM PST/);
    assert.ok(!text.includes('"comparison":'));
    assert.ok(!text.includes('"modelVersion":'));
    for (const goal of report.evidence) {
      assert.ok(studentReportHtml(report).includes(goal.goal), id);
      assert.ok(JSON.stringify(studentReportPdf(report)).includes(goal.goal), id);
    }
    assert.equal(reportFilename(report, 'txt'), `${id}-Zoë-García-lab-report.txt`);
    assert.equal(reportFilename(report, 'json'), `${id}-Zoë-García-responses.json`);
    assert.ok(report.data);
    assert.deepEqual(attempt.state, before);
  }
});

test('feedback summaries describe actual revisions, retain raw checks and deduplicate repeat reviews', () => {
  const state = {};
  const check = { topic: 'cell-stages', sample: 'field-a', label: 'Field A', responses: [0, 2, 3], expected: [0, 1, 3] };
  recordFeedback(state, check);
  recordFeedback(state, check);
  assert.equal(state.feedbackHistory.length, 1);
  recordFeedback(state, { ...check, responses: [0, 1, 3] });
  const [summary] = feedbackSummaries(state);
  assert.equal(summary.corrected, 1);
  assert.equal(summary.revised, 1);
  assert.equal(summary.remaining, 0);
  assert.equal(summary.status, 'Correct after feedback');
  assert.deepEqual(state.feedbackHistory[0].responses, [0, 2, 3]);
  recordFeedback(state, { ...check, scope: 'exploration', sample: 'practice' });
  assert.equal(feedbackSummaries(state).length, 1);
  recordFeedback(state, { ...check, responses: [0] });
  assert.equal(state.feedbackHistory.length, 3);
});

test('calculation summaries respect the actual tolerance check and older attempts expose unavailable history', () => {
  const attempt = reportAttempt('osmosis-homeostasis', true);
  const check = { topic: 'mass-change', sample: 'A', label: 'Tube A', expected: ['0.10'] };
  recordFeedback(attempt.state, { ...check, responses: ['99'], matches: [false] });
  recordFeedback(attempt.state, { ...check, responses: ['0.11'], matches: [true] });
  assert.equal(feedbackSummaries(attempt.state)[0].corrected, 1);
  assert.equal(build(attempt).feedback[0].status, 'Correct after feedback');
  const legacy = reportAttempt('mitosis', true);
  assert.deepEqual(build(legacy).feedback, []);
  assert.match(studentReportText(build(legacy)), /Feedback history is unavailable/);
  assert.ok(!studentReportText(build(legacy)).includes('Correct after feedback'));
  legacy.state.feedbackHistory = [{ responses: null }];
  assert.doesNotThrow(() => build(legacy));
});

test('incomplete learning evidence retains missing responses and never claims explanations were demonstrated', () => {
  for (const id of reportLabIds) {
    const report = build(reportAttempt(id));
    assert.equal(report.status, 'In progress');
    assert.ok(report.evidence.every(item => item.status !== 'Evidence and explanation recorded'));
    assert.ok(!studentReportText(report).includes('Correct after feedback'));
  }
});

test('extraction reports summarize concepts and revisions while preserving attempts in structured data', () => {
  let state = { ...freshExtraction(17), stage: 1, step: 4, passes: 3 };
  state = answerCheckpoint(state, 2);
  state = answerCheckpoint(state, 0);
  state = restoreExtraction(JSON.stringify(state));
  state.studentName = 'Zoë García';
  state.claim = 'My evidence stays exactly as written. α β';
  const report = extractionReport({ id: 'dna-replication', title: 'Extracting DNA from Fruit' }, state, clock.exportedAt, clock.timeZone);
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.evidence[0].status, 'Checkpoint correct after feedback');
  assert.match(reportHtml(report), /Revisited this concept after feedback/);
  assert.ok(!reportHtml(report).includes('Responses in order'));
  assert.ok(!reportHtml(report).includes('mashing passes'));
  assert.ok(!JSON.stringify(reportDefinition(report).content).includes('preparation actions'));
  assert.deepEqual(report.checkpoints[0].attempts.map(item => item.choice), [2, 0]);
  assert.equal(extractionReportFilename(report), 'dna-replication-Zoë-García-lab-report.pdf');
  assert.equal(extractionReportFilename(report, 'json'), 'dna-replication-Zoë-García-responses.json');
  assert.match(reportHtml(report), /Nov 11, 2026, 1:30 PM PST/);
  const attachment = JSON.parse(Buffer.from(reportDefinition(report).files.responses.src.split(',')[1], 'base64').toString('utf8'));
  assert.deepEqual(attachment, report);
  assert.equal(report.explanations[0].response, state.claim);
});

test('classroom extraction evidence refers to the recorded claim and observations', () => {
  const state = { ...freshExtraction(), route: 'classroom', claim: 'Detergent disrupts membranes.',
    notes: ['Pale strands', 'A faint thread', 'Clear'], scores: [2, 1, 0] };
  const report = extractionReport({ id: 'dna-replication', title: 'Extracting DNA from Fruit' }, state);
  assert.equal(report.evidence[0].status, 'Explanation recorded');
  assert.equal(report.evidence[1].status, 'Observations recorded');
  assert.equal(report.evidence[3].status, 'Awaiting response');
  assert.match(report.evidence[0].summary, /written claim/);
  assert.ok(!report.evidence[0].summary.includes('saved membrane-check answer'));
  assert.ok(report.checkpoints.every(item => item.status === 'Not required for classroom route'));
});
