import {conditions,rubric,steps,checkpoints} from './extraction-model.js';

export const recipes=[
 '10 g fruit + 9 mL water + 0.1 g salt + 1 mL detergent; filter, then layer 5 mL cold alcohol over 5 mL filtrate.',
 'Same fruit, mashing, salt, filtration, alcohol and observation time; replace 1 mL detergent with 1 mL water.',
 'Same extraction ingredients and handling, with no fruit.'
];
export const explanationQuestions=[
 'What does the detergent comparison support? Use your observations and explain the role of membranes, including how mashing can release some DNA without detergent.',
 'Someone says: “Twice as much white material means twice as much DNA.” Explain why our observations cannot establish that.'
];
export const evidenceLimits='Visibility scores are ordered categories, not DNA concentrations. The precipitate is a crude mixture; appearance alone does not establish DNA identity or purity. One sample per condition cannot estimate variability. Virtual observations are illustrative. Differences between virtual and classroom samples cannot be attributed to detergent alone.';

import { reportFilename, formatReportDateTime, reportSnapshot, section, paragraph, response,
  studentReportHtml, studentReportPdf } from './student-report.js';
import { evidenceSection } from './report-evidence.js';

export function extractionReport(c, s, exportedAt = new Date().toISOString(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC') {
  const report = {
    schemaVersion: 2, labId: c.id, labTitle: c.title, activityVersion: 3, attemptId: s.attemptId ?? null,
    exportedAt, exportTimeZone: timeZone, exportedAtDisplay: formatReportDateTime(exportedAt, timeZone),
    status: s.complete ? 'Complete' : 'In progress', grading: { status: 'not_graded' },
    student: { name: s.studentName || '', class: s.studentClass || '' },
    question: 'What does it take to get DNA out of a cell, and what can the controls tell us?',
    route: s.route, modelVersion: s.modelVersion ?? 2,
    preparation: { completedActions: s.step, totalActions: steps.length, mashingPasses: s.passes, settlingSeconds: s.elapsed },
    prediction: { id: 'detergent-prediction', prompt: 'How will leaving out detergent affect visible material, and why?', response: s.prediction },
    checkpoints: Object.entries(checkpoints).map(([step, question]) => {
      const choice = s.checks[step];
      const attempts = s.checkAttempts?.[step] || [];
      const answered = Number.isInteger(choice);
      const correct = answered && choice === question.correct;
      const revised = correct && attempts.some(value => value !== question.correct);
      let status = answered ? 'Review needed' : 'Awaiting response';
      if (correct) status = revised ? 'Correct after feedback' : 'Correct';
      if (s.route === 'classroom') status = 'Not required for classroom route';
      return { id: question.id, prompt: question.question, choices: [...question.choices],
        selectedChoice: answered ? choice : null, response: answered ? question.choices[choice] : '',
        status, correct: answered ? correct : null, revised,
        attempts: attempts.map(value => ({ choice: value, response: question.choices[value] })),
        attemptHistory: attempts.length ? 'recorded' : 'unavailable' };
    }),
    observations: conditions.map((condition, index) => ({
      id: ['complete', 'no-detergent', 'no-fruit'][index], condition, source: s.sources[index],
      score: s.scores[index], category: Number.isInteger(s.scores[index]) ? rubric[s.scores[index]] : 'Not recorded',
      description: s.notes[index], recipe: recipes[index]
    })),
    explanations: [
      { id: 'membrane-evidence', prompt: explanationQuestions[0], response: s.claim },
      { id: 'evidence-limits', prompt: explanationQuestions[1], response: s.limit }
    ],
    limits: evidenceLimits
  };
  const observations = report.observations.filter(item => item.score !== null && item.description.trim()).length;
  const checkpointStatus = index => report.checkpoints[index].response
    ? 'Checkpoint ' + report.checkpoints[index].status.toLowerCase() : 'Awaiting checkpoint response';
  report.evidence = [
    { id: 'membranes', goal: 'Explain DNA release', purpose: 'Connect mashing and detergent with the cell membranes.',
      status: s.route === 'classroom' ? (s.claim.trim() ? 'Explanation recorded' : 'Awaiting response') : checkpointStatus(0),
      summary: s.route === 'classroom' ? 'Use the written claim to review the membrane explanation.'
        : report.checkpoints[0].response ? 'The saved membrane-check answer is shown in the concept-check section. Review the written claim alongside it.'
          : 'The membrane-check answer is awaiting a response.' },
    { id: 'precipitation', goal: 'Explain visible strands', purpose: 'Explain how dissolved DNA can collect as a precipitate after alcohol is added.',
      status: s.route === 'classroom' ? (observations ? 'Observations recorded' : 'Awaiting observations') : checkpointStatus(1),
      summary: s.route === 'classroom' ? 'Use the sample observations and written explanations to review this concept.'
        : report.checkpoints[1].response ? 'The saved dissolved-DNA answer is shown in the concept-check section.'
          : 'The dissolved-DNA check is awaiting a response.' },
    { id: 'controls', goal: 'Compare the controls', purpose: 'Use the no-detergent and no-fruit comparisons to support a claim.',
      status: observations === 3 && s.claim.trim() ? 'Evidence and explanation recorded' : 'In progress',
      summary: `${observations} of 3 observations include a score and description. ${s.claim.trim() ? 'The written claim is available for teacher review.' : 'A written claim is awaiting a response.'}` },
    { id: 'limits', goal: 'Evaluate the evidence', purpose: 'Explain what visible material can establish about DNA.',
      status: s.limit.trim() ? 'Explanation recorded' : 'Awaiting response',
      summary: s.limit.trim() ? 'Your response about evidence limits is included verbatim.' : 'The evidence-limit explanation is awaiting a response.' }
  ];
  report.feedback = report.checkpoints.map(item => ({
    id: item.id, status: item.status,
    summary: s.route === 'classroom' ? 'The classroom route records the observations and written explanations.'
      : item.revised ? 'Revisited this concept after feedback and recorded a correct response.'
        : item.attempts.length ? 'The saved checkpoint response is shown with its current result.'
          : 'Earlier feedback history is unavailable. The saved response is shown.'
  }));
  return structuredClone(report);
}

export function extractionReportFilename(report, format = 'pdf') {
  return reportFilename(report, format);
}

export function extractionReportDocument(report) {
  const sections = [
    section('Investigation and prediction', response(report.prediction.prompt, report.prediction.response)),
    evidenceSection(report.evidence),
    section('Your explanations', ...report.explanations.map(item => response(item.prompt, item.response))),
    section('Revisions and feedback', ...report.feedback.map(item => {
      const checkpoint = report.checkpoints.find(check => check.id === item.id);
      return response(checkpoint.prompt, `${item.status}. ${item.summary}`);
    })),
    section('Concept-check responses', ...report.checkpoints.map(item => response(item.prompt, `${item.status}\n${item.response || 'Not recorded'}`))),
    section('Recorded observations', paragraph('Visibility categories are 0 None, 1 Faint, 2 Clear, and 3 Abundant.')),
    ...report.observations.map(item => section(item.condition,
      paragraph(`Source ${item.source}. Visibility ${item.score === null ? 'not recorded' : item.score + ' / 3 (' + item.category + ')'}.`),
      paragraph(item.recipe), response('Your observation', item.description))),
    section('Model and evidence limits', paragraph(report.limits))
  ];
  return reportSnapshot({ id: report.labId, title: report.labTitle, question: report.question },
    { studentName: report.student.name, studentClass: report.student.class, complete: report.status === 'Complete' },
    sections, { exportedAt: report.exportedAt, timeZone: report.exportTimeZone || 'UTC' });
}

export function reportHtml(report) {
  return studentReportHtml(extractionReportDocument(report)).replace('class="student-report-print"', 'class="student-report-print dna-print-report"');
}

export function reportDefinition(report) {
  const definition = studentReportPdf(extractionReportDocument(report));
  const bytes = new TextEncoder().encode(JSON.stringify(report, null, 2));
  let binary = '';
  for (const value of bytes) binary += String.fromCharCode(value);
  definition.files = { responses: { src: 'data:application/json;base64,' + btoa(binary),
    name: 'dna-extraction-responses.json', description: 'Recorded student responses, report schema 2' } };
  return definition;
}
