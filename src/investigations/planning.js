import { escape } from './visuals.js';

export function planReady(state) {
  const writing = state.notes || state;
  return Boolean(writing.prediction?.trim() && writing.design?.trim());
}

export function recordedPlan(state) {
  const plan = state.initialPlan;
  return plan && typeof plan.prediction === 'string' && typeof plan.design === 'string'
    && ['before-observations', 'timing-unrecorded'].includes(plan.timing)
    && typeof plan.recordedAt === 'string' && Number.isFinite(Date.parse(plan.recordedAt)) ? plan : null;
}

export function recordInitialPlan(state, hasWork, recordedAt = new Date().toISOString()) {
  if (!planReady(state)) return false;
  if (!recordedPlan(state)) {
    const writing = state.notes || state;
    state.initialPlan = {
      prediction: writing.prediction, design: writing.design, recordedAt,
      timing: hasWork ? 'timing-unrecorded' : 'before-observations'
    };
  }
  return true;
}

export function enterInvestigationStage(state, nextStep, hasWork, recordedAt = new Date().toISOString()) {
  if (!Number.isInteger(nextStep) || nextStep < 0 || nextStep > 2) return false;
  if (nextStep > 0 && !recordInitialPlan(state, hasWork, recordedAt)) return false;
  state.step = nextStep;
  return true;
}

export function coreHasWork(state) {
  return Object.values(state.runs).some(points => points.length)
    || Object.values(state.classifications).some(answers => answers.some(Number.isInteger))
    || Object.values(state.counts).some(counts => counts.some(value => value > 0))
    || Object.values(state.leafRuns || {}).some(run => run.prepared || run.cycles || run.points?.length)
    || Object.values(state.yeastRuns || {}).some(run => run.prepared || run.points?.length)
    || Object.values(state.microscopeRuns || {}).some(run => run.loaded);
}

export function extendedHasWork(state) {
  return Boolean(state.records.length || state.exploration.length || state.run.prepared
    || state.run.time || state.run.readings.length);
}

export function planningHistoryHtml(state) {
  const plan = recordedPlan(state);
  if (!plan) return '';
  return `<div class="planning-history"><h3>First recorded prediction</h3><p>${escape(plan.prediction)}</p><p>${plan.timing === 'before-observations'
    ? 'This prediction was recorded before the observations began.'
    : 'This attempt already contained lab work. The timing of the original prediction was not recorded.'} Your first recorded prediction stays in the report when you revise your writing.</p></div>`;
}
