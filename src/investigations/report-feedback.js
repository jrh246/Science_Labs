function validCheck(check) {
  return check && typeof check.topic === 'string' && typeof check.sample === 'string'
    && typeof check.label === 'string' && ['comparison', 'exploration'].includes(check.scope)
    && Array.isArray(check.responses) && Array.isArray(check.expected)
    && check.responses.length === check.expected.length && check.responses.length <= 100
    && [...check.responses, ...check.expected].every(value => typeof value === 'string' || Number.isFinite(value))
    && (check.matches === undefined || Array.isArray(check.matches)
      && check.matches.length === check.responses.length && check.matches.every(value => typeof value === 'boolean'));
}

export function recordedFeedback(state) {
  return Array.isArray(state.feedbackHistory) ? state.feedbackHistory.filter(validCheck) : [];
}

// Save checks that actually displayed feedback. Navigation and tool clicks do not enter this record.
export function recordFeedback(state, { topic, sample, label, responses, expected, matches, scope = 'comparison' }) {
  const check = { topic, sample, label, scope, responses: [...responses], expected: [...expected],
    matches: matches ? [...matches] : responses.map((value, index) => value === expected[index]) };
  if (!validCheck(check)) return;

  const history = recordedFeedback(state);
  const previous = history.findLast(item => item.topic === topic && item.sample === sample && item.scope === scope);
  if (previous && JSON.stringify(previous.responses) === JSON.stringify(check.responses)
      && JSON.stringify(previous.expected) === JSON.stringify(check.expected)) return;

  state.feedbackHistory = [...history, check];
}

export function feedbackSummaries(state) {
  const groups = new Map();
  for (const check of recordedFeedback(state)) {
    if (check.scope !== 'comparison') continue;
    const key = JSON.stringify([check.topic, check.sample]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(check);
  }

  return [...groups.values()].map(checks => {
    const first = checks[0];
    const latest = checks.at(-1);
    const revised = latest.responses.filter((value, index) => value !== first.responses[index]).length;
    const matches = (check, index) => check.matches?.[index] ?? check.responses[index] === check.expected[index];
    const corrected = latest.responses.filter((value, index) => matches(latest, index)
      && checks.slice(0, -1).some(check => !matches(check, index))).length;
    const remaining = latest.responses.filter((value, index) => !matches(latest, index)).length;
    let summary = `${latest.responses.length - remaining} of ${latest.responses.length} responses matched the check at the latest review.`;
    if (checks.length > 1) summary += ` ${revised} responses changed between the first and latest checks. ${corrected} responses matched after earlier feedback.`;

    return { topic: latest.topic, sample: latest.sample, label: latest.label,
      status: remaining ? 'Review needed' : corrected ? 'Correct after feedback' : 'Correct at latest check',
      summary, checks: checks.length, revised, corrected, remaining };
  });
}
