import {recordedPlan} from './planning.js';
import { section, paragraph, response } from './student-report.js';
import { feedbackSummaries, recordedFeedback } from './report-feedback.js';
import { times } from './model.js';
import { sequence } from './extended-model.js';

const goals = {
  'light-photosynthesis': [
    ['compare-light', 'Compare light conditions', 'Use flotation times and differences among cups to explain the light comparison.'],
    ['controls', 'Explain the controls', 'Explain the dark control and matched leaf preparation.'],
    ['buoyancy', 'Explain why disks float', 'Connect oxygen buildup with flotation and the activity of the leaf.'],
    ['uncertainty', 'Evaluate the evidence', 'Use uncertainty to suggest a better investigation.']
  ],
  'yeast-fermentation': [
    ['compare-fuels', 'Compare fuel sources', 'Use gas measurements and variation among mixtures to compare the fuels.'],
    ['controls', 'Explain the controls', 'Explain what the control comparisons can show.'],
    ['energy', 'Connect fermentation and energy', 'Explain how fermentation supports glycolysis and how gas relates to the process.'],
    ['uncertainty', 'Evaluate the comparison', 'Explain a limit of the sugar comparison or gas measurement.']
  ],
  mitosis: [
    ['stage-patterns', 'Use cell-stage counts', 'Use counts and percentages to describe the sampled cells.'],
    ['chromosome-features', 'Classify cells using chromosomes', 'Explain the visible features used to identify cell stages.'],
    ['duration', 'Explain the time estimate', 'Connect stage frequency with an assumed cell-cycle length.'],
    ['sampling', 'Compare the fields', 'Explain differences between fields and limits of the sample.']
  ],
  'cell-microscopy': [
    ['size-structure', 'Compare cell size and structure', 'Use measured lengths and visible boundaries to compare specimens.'],
    ['calibration', 'Explain microscope calibration', 'Explain how the scale depends on the chosen objective.'],
    ['sampling', 'Evaluate the cell sample', 'Explain what two selected cells can show about a tissue.']
  ],
  'enzyme-activity': [
    ['rate', 'Compare initial reaction rates', 'Use the first 30 seconds of gas measurements for each temperature.'],
    ['measurement', 'Evaluate gas collection', 'Explain how equipment or setup can affect a measurement.'],
    ['temperature', 'Explain the temperature comparison', 'Use the tested temperature range to describe the evidence.']
  ],
  'cell-signaling': [
    ['growth', 'Compare plant growth', 'Use change from starting height to compare the two plants.'],
    ['control', 'Explain the carrier control', 'Explain why the control receives the same carrier.'],
    ['mechanism', 'Evaluate the signal evidence', 'Explain what stem growth can show about a plant response.']
  ],
  'meiosis-variation': [
    ['crossing-over', 'Locate crossing over', 'Explain the exchange between homologs in one precursor cell.'],
    ['products', 'Trace the chromosome products', 'Follow exchanged DNA into the egg and sperm pathways.'],
    ['gametes', 'Explain different cell products', 'Explain egg, sperm, and polar-body outcomes in this model.']
  ],
  'inheritance-ratios': [
    ['ratios', 'Compare observed and predicted traits', 'Use each ear and the pooled sample to discuss the predicted ratio.'],
    ['discrepancy', 'Explain the difference from prediction', 'Use chi-square to describe the difference between observed and expected counts.'],
    ['variation', 'Explain chance variation', 'Explain why small samples can differ from a genetic prediction.']
  ],
  'linked-genes': [
    ['recombination', 'Estimate recombination', 'Use trait counts from each sample and the pooled sample.'],
    ['distance', 'Explain the map estimate', 'Explain a limit of using recombination to estimate gene distance.'],
    ['cross', 'Interpret the cross record', 'Explain why the parent used in this cross matters.']
  ],
  'dna-protein': [
    ['background', 'Use the no-DNA control', 'Use the control to describe background fluorescence.'],
    ['translation', 'Use the translation-blocked comparison', 'Explain how the inhibitor comparison supports the claim.'],
    ['evidence-limits', 'Interpret fluorescence', 'Explain what the measured fluorescence supports.']
  ],
  'lac-operon': [
    ['selection-induction', 'Distinguish selection and induction', 'Use the plate comparisons to explain survival and reporter activity.'],
    ['gene-expression', 'Interpret growth and fluorescence', 'Use both observations to explain the reporter evidence.'],
    ['labels', 'Explain why labels matter', 'Connect each plate label with the comparison it supports.']
  ],
  'gel-electrophoresis': [
    ['sizes', 'Estimate fragment sizes', 'Use the ladder and your three band estimates to compare samples.'],
    ['calibration', 'Explain the ladder', 'Explain how the ladder supports size estimates in this gel.'],
    ['matching', 'Evaluate a matching pattern', 'Explain the limits of a matching band pattern.']
  ],
  'sordaria-crossing-over': [
    ['patterns', 'Compare spore patterns', 'Use both fields to estimate second-division patterns and map distance.'],
    ['mapping', 'Explain the mapping calculation', 'Explain the factor of one-half in the map estimate.'],
    ['sampling', 'Evaluate the sample', 'Explain how excluded asci and multiple crossovers affect the estimate.']
  ]
};

function collectionSummary(lab, state, core) {
  if (!core) {
    return { count: state.records.length, total: sequence(lab).length,
      description: `${state.records.length} of ${sequence(lab).length} comparison samples or pathways are saved.` };
  }
  if (lab.kind === 'mitosis') {
    let cells = 0;
    let fields = 0;
    for (const [index, condition] of lab.conditions.entries()) {
      if (state.sources[index] === 'classroom') {
        const counts = state.counts[condition.id] || [];
        cells += counts.reduce((sum, value) => sum + value, 0);
        if (counts.some(value => value > 0)) fields++;
      } else {
        cells += (state.classifications[condition.id] || []).filter(Number.isInteger).length;
        if (state.reviewed[condition.id]) fields++;
      }
    }
    return { count: fields, total: lab.conditions.length,
      description: `${cells} cell classifications or counts are recorded across ${fields} collected fields.` };
  }
  const count = lab.conditions.reduce((sum, condition) => sum + [1, 2, 3].filter(trial => {
    const key = `${condition.id}-${trial}`;
    return state.runs[key]?.length === times(lab).length && !state.leafRuns?.[key]?.altered;
  }).length, 0);
  return { count, total: lab.conditions.length * 3,
    description: `${count} of ${lab.conditions.length * 3} complete comparison time series are recorded.` };
}

export function investigationEvidence(lab, state, core) {
  const collection = collectionSummary(lab, state, core);
  const answers = core ? state.notes.answers : state.answers;
  return goals[lab.id].map(([id, goal, purpose], index) => {
    const answered = Boolean(answers[index]?.trim());
    let status = collection.count ? 'Results recorded' : 'Awaiting collected results';
    if (answered) status = collection.count === collection.total ? 'Evidence and explanation recorded' : 'Explanation recorded';
    return { id, goal, purpose, status, responseId: `analysis-${index + 1}`,
      summary: `${index === 0 ? collection.description + ' ' : ''}Explanation ${index + 1} ${answered ? 'is included for teacher review' : 'is awaiting a response'}.` };
  });
}

export function evidenceSection(evidence) {
  return section('Evidence by learning goal',
    paragraph('Review the recorded results alongside the written explanations for each goal.'),
    ...evidence.map(item => response(item.goal, `${item.status}. ${item.purpose} ${item.summary}`)));
}

export function revisionSection(state) {
  const reviews = feedbackSummaries(state);
  if (!reviews.length) return section('Revisions and feedback', paragraph('Feedback history is unavailable for this attempt. The report includes the saved responses and results.'));
  return section('Revisions and feedback', ...reviews.map(review => response(review.label, `${review.status}. ${review.summary}`)));
}

function recordedTrialData(run) {
  if (!run) return null;
  const fields = ['condition', 'version', 'fuel', 'yeast', 'prepared', 'connected', 'bath',
    'temperature', 'points', 'events', 'light', 'planned', 'cycles', 'altered', 'inCup', 'preparation',
    'conditionIndex', 'repeat', 'note', 'readings', 'tallies', 'scores', 'estimates',
    'rulerMeasured', 'ruler', 'objective', 'focus', 'region', 'chromatids', 'cut', 'placed',
    'eggActivated', 'spermMature', 'answers', 'checked', 'practiceField', 'hours'];
  return Object.fromEntries(fields.filter(field => Object.hasOwn(run, field)).map(field => [field, run[field]]));
}

function recordedTrials(runs = {}) {
  return Object.fromEntries(Object.entries(runs).map(([id, run]) => [id, recordedTrialData(run)]));
}

export function attachInvestigationEvidence(report, lab, state, core) {
  const initial = recordedPlan(state);
  const writing = core ? state.notes : state;
  report.planning = {
    initial: initial ? structuredClone(initial) : null,
    prediction: writing.prediction, design: writing.design,
    timing: initial?.timing || 'timing-unrecorded'
  };
  const plan = report.sections[0];
  if (initial && initial.prediction !== writing.prediction) {
    plan.blocks.push(response('First recorded prediction', initial.prediction));
  }
  if (initial && initial.design !== writing.design) {
    plan.blocks.push(response('First recorded investigation design', initial.design));
  }
  plan.blocks.push(paragraph(initial?.timing === 'before-observations'
    ? 'The first prediction and design were recorded before observations began.'
    : 'The timing of the original prediction and design was not recorded for this attempt.'));
  report.evidence = investigationEvidence(lab, state, core);
  report.feedback = feedbackSummaries(state);
  report.responses = (core ? lab.questions : lab.analysis).map((prompt, index) => ({
    id: `analysis-${index + 1}`, prompt, response: (core ? state.notes.answers : state.answers)[index]
  }));
  report.data = structuredClone(core ? {
    sources: state.sources, runs: state.runs, classifications: state.classifications,
    counts: state.counts, reviewed: state.reviewed, cycleHours: state.cycleHours,
    leafTrials: recordedTrials(state.leafRuns), yeastTrials: recordedTrials(state.yeastRuns),
    exploration: { leaf: recordedTrialData(state.leafExploration), yeast: recordedTrialData(state.yeastExploration),
      microscope: recordedTrialData(state.microscopeExploration) },
    feedbackHistory: recordedFeedback(state)
  } : { comparison: state.records, exploration: state.exploration,
    currentSample: recordedTrialData(state.run), feedbackHistory: recordedFeedback(state) });
  const explanationIndex = report.sections.findIndex(item => item.heading === 'Your explanations');
  const [explanations] = report.sections.splice(explanationIndex, 1);
  report.sections.splice(1, 0, evidenceSection(report.evidence), explanations, revisionSection(state));
  return report;
}
