import { test, expect } from '@playwright/test';
import { reportAttempt, reportLabIds } from '../fixtures/report-attempts.js';
import { freshExtraction } from '../../src/investigations/extraction-model.js';

const required = 'Required before continuing';

async function seed(page, attempt) {
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem('save-planning-seeded')) {
      localStorage.setItem(key, JSON.stringify(value));
      sessionStorage.setItem('save-planning-seeded', 'yes');
    }
  }, { key: attempt.key, value: attempt.storageValue });
  await page.goto(attempt.url);
}

async function jsonReport(page, extraction = false) {
  const pending = page.waitForEvent('download');
  await page.locator(extraction ? '[data-action="response-data"]' : '[data-report-action="json"]').click();
  const stream = await (await pending).createReadStream();
  let text = '';
  for await (const part of stream) text += part;
  return JSON.parse(text);
}

async function denySaving(page) {
  await page.evaluate(() => {
    window.restoreStorageWrite = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'QuotaExceededError'); };
  });
}

for (const id of reportLabIds.filter(id => id !== 'osmosis-homeostasis')) {
  test(`${id} requires a prediction and design before the bench or analysis`, async ({ page }) => {
    const attempt = reportAttempt(id);
    const core = Boolean(attempt.state.notes);
    await page.goto(attempt.url);
    const collect = page.locator(core ? '[data-step="1"]' : '[data-act="step-1"]').first();
    const analyze = page.locator(core ? '[data-step="2"]' : '[data-act="step-2"]');
    await expect(collect).toBeDisabled();
    await expect(analyze).toBeDisabled();
    await expect(page.locator('leaf-simulator, yeast-simulator, mitosis-simulator, .ext-workspace')).toHaveCount(0);
    await expect(page.locator('main')).toContainText(required);
    if(id==='mitosis')await page.screenshot({path:'tmp/aud03-04/prediction-required-desktop.png',fullPage:true});
    // Verify the transition itself rejects a request if the disabled UI is bypassed.
    await analyze.evaluate(button => { button.disabled = false; });
    await analyze.click();
    await expect(page.locator('[data-note="prediction"]')).toBeVisible();
    await page.locator('[data-note="prediction"]').fill('My first prediction may be wrong.');
    await expect(collect).toBeDisabled();
    await page.locator('[data-note="design"]').fill('Compare the required samples and keep conditions matched.');
    await expect(collect).toBeEnabled();
    await collect.click();
    const data = await jsonReport(page);
    expect(data.planning.initial.prediction).toBe('My first prediction may be wrong.');
    expect(data.planning.timing).toBe('before-observations');
    await page.locator(core ? '[data-step="0"]' : '[data-act="step-0"]').click();
    await page.locator('[data-note="prediction"]').fill('A revised prediction.');
    await page.locator('[data-note="design"]').fill('');
    await expect(collect).toBeDisabled();
    await page.reload();
    await expect(page.locator('[data-note="prediction"]')).toHaveValue('A revised prediction.');
    const revised = await jsonReport(page);
    expect(revised.planning.initial.prediction).toBe('My first prediction may be wrong.');
    expect(revised.planning.prediction).toBe('A revised prediction.');
    expect(revised.status).toBe('In progress');
  });
}

test('corn feedback records the prediction before revealing the expected ratio', async ({ page }) => {
  await page.goto('/investigation.html?lab=inheritance-ratios');
  const checker = page.locator('[data-act="check-punnett"]');
  await expect(checker).toBeDisabled();
  await checker.evaluate(button => { button.disabled = false; });
  await checker.click();
  await expect(page.locator('#punnett-feedback')).toBeEmpty();
  await page.locator('[data-note="prediction"]').fill('I expect an equal number of both colors.');
  await page.locator('[data-note="design"]').fill('Compare three ears from the stated cross.');
  await checker.click();
  const data = await jsonReport(page);
  expect(data.planning.initial.prediction).toBe('I expect an equal number of both colors.');
  expect(data.planning.timing).toBe('before-observations');
  await page.locator('[data-note="prediction"]').fill('A revised prediction after feedback.');
  expect((await jsonReport(page)).planning.initial.prediction).toBe('I expect an equal number of both colors.');
});

for (const id of ['light-photosynthesis', 'yeast-fermentation', 'mitosis']) {
  test(`${id} virtual workspace also starts with the required prediction`, async ({ page }) => {
    await page.goto(`/investigation.html?lab=${id}&mode=virtual`);
    await expect(page.locator('[data-note="prediction"]')).toBeVisible();
    await expect(page.locator('[data-step="1"]')).toBeDisabled();
    await expect(page.locator('leaf-simulator, yeast-simulator, mitosis-simulator')).toHaveCount(0);
  });
}

for (const id of ['mitosis', 'enzyme-activity', 'dna-replication']) {
  test(`${id} confirms successful saves nearby, clears edits, and recovers from denied storage`, async ({ page }) => {
    const extraction = id === 'dna-replication';
    const attempt = extraction ? {
      key: 'science-labs:/:dna-replication:extraction-v2',
      url: '/investigation.html?lab=dna-replication',
      state: { ...freshExtraction(), route: 'classroom', stage: 2, prediction: 'Detergent may release more material.',
        sources: ['classroom', 'classroom', 'classroom'], scores: [3, 1, 0], notes: ['Many strands.', 'Faint strands.', 'No strands.'],
        claim: 'The complete mixture had more visible material.', limit: 'Visible material can contain other molecules.' }
    } : reportAttempt(id, true);
    attempt.state.complete = false;
    attempt.storageValue = attempt.state;
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, attempt);
    const button = page.locator(extraction ? '[data-action="complete"]' : attempt.state.notes ? '[data-action="complete"]' : '[data-act="complete"]');
    const feedback = page.locator('#lab-complete-feedback');
    const writing = page.locator(extraction ? '[data-field="claim"]' : '[data-note="answer-0"]');
    const identity = page.locator(extraction ? '[data-field="studentName"]' : '[data-report-field="studentName"]');
    await button.click();
    await expect(feedback).toContainText('Saved just now');
    await expect(feedback).toBeInViewport();
    await expect(button).toHaveText('Work saved as complete');
    await expect(button).toBeFocused();
    await page.evaluate(() => {
      window.completionAnnouncements = 0;
      new MutationObserver(() => window.completionAnnouncements++).observe(document.querySelector('#lab-complete-feedback'), { childList: true });
    });
    await button.click();
    await expect(feedback).toContainText('Saved just now');
    expect(await page.evaluate(() => window.completionAnnouncements)).toBeGreaterThan(0);
    await identity.fill('Maya Rivera');
    await page.locator(extraction ? '[data-field="studentClass"]' : '[data-report-field="studentClass"]').fill('Period 3');
    expect((await jsonReport(page, extraction)).status).toBe('Complete');
    await denySaving(page);
    await button.click();
    await expect(feedback).toContainText('could not be saved');
    await expect(button).not.toHaveText('Work saved as complete');
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreStorageWrite; });
    await button.click();
    await expect(feedback).toContainText('Saved just now');
    if(!extraction){
      if(attempt.state.notes)await page.locator('[data-step="1"]').click();
      await page.locator(attempt.state.notes ? '[data-action="explore-leaf"]' : '[data-act="explore"]').click();
      if(attempt.state.notes)await page.getByRole('slider',{name:'Practice cycle duration'}).fill('12');
      else await page.locator('[data-note="run-note"]').fill('An optional exploration note.');
      expect((await jsonReport(page)).status).toBe('Complete');
      await page.locator(attempt.state.notes ? '[data-step="2"]' : '[data-act="step-2"]').click();
    }
    await page.screenshot({path:`tmp/aud03-04/${id}-save-success-phone.png`,fullPage:true});
    await writing.fill('My revised explanation uses the recorded evidence.');
    await expect(feedback).toBeEmpty();
    expect((await jsonReport(page, extraction)).status).toBe('In progress');
    await button.click();
    await page.reload();
    await expect(feedback).toContainText('Your completed work is saved on this device');
    await writing.fill('This response must survive an export when storage is denied.');
    await denySaving(page);
    await button.click();
    await expect(feedback).toContainText('could not be saved');
    await expect(feedback).toHaveClass(/lab-save-error/);
    await expect(feedback).toBeInViewport();
    await expect(button).not.toHaveText('Work saved as complete');
    const failed = await jsonReport(page, extraction);
    expect(failed.status).toBe('In progress');
    expect(JSON.stringify(failed)).toContain('This response must survive an export');
    await page.screenshot({ path: `tmp/aud03-04/${id}-save-failure-phone.png`, fullPage: true });
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreStorageWrite; });
    await button.click();
    await expect(feedback).toContainText('Saved just now');
    await page.reload();
    await expect(writing).toHaveValue('This response must survive an export when storage is denied.');
    await expect(feedback).toContainText('Your completed work is saved on this device');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const id of ['mitosis', 'enzyme-activity']) {
  test(`${id} retains older results when planning is missing and labels their timing`, async ({ page }) => {
    const attempt = reportAttempt(id, true);
    const writing = attempt.state.notes || attempt.state;
    writing.prediction = '';
    writing.design = '';
    attempt.state.complete = false;
    await seed(page, attempt);
    await expect(page.locator('[data-note="prediction"]')).toBeVisible();
    const before = await jsonReport(page);
    expect(before.planning.timing).toBe('timing-unrecorded');
    await page.locator('[data-note="prediction"]').fill('Recorded after the earlier observations.');
    await page.locator('[data-note="design"]').fill('Keep the original samples.');
    await page.locator(attempt.state.notes ? '[data-step="1"]' : '[data-act="step-1"]').first().click();
    const after = await jsonReport(page);
    expect(after.planning.timing).toBe('timing-unrecorded');
    expect(after.data).toEqual(before.data);
  });
}

test('osmosis and card practice keep storage failures visible alongside action feedback', async ({ page }) => {
  for (const [url, button, status] of [
    ['/lab.html', '[data-action="next"]', '.storage-warning'],
    ['/activity.html', '[data-action="check"]', '.cycle-storage']
  ]) {
    await page.goto(url);
    if(url==='/lab.html')await page.locator('#osmosis-prediction').fill('Water will move toward more sugar.');
    await denySaving(page);
    await page.locator(button).click();
    await expect(page.locator(status)).toContainText('could not be saved');
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreStorageWrite; });
    await page.locator(url === '/lab.html' ? '[data-action="back"]' : button).click();
    await expect(page.locator(status)).toBeEmpty();
  }
});
