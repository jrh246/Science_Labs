import { test, expect } from '@playwright/test';
import { reportAttempt } from '../fixtures/report-attempts.js';
import { fieldCells } from '../../src/investigations/model.js';
import { specimens } from '../../src/investigations/extended-model.js';

async function start(page, attempt) {
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem('evidence-attempt')) {
      localStorage.setItem(key, JSON.stringify(value));
      sessionStorage.setItem('evidence-attempt', 'ready');
    }
  }, { key: attempt.key, value: attempt.storageValue });
  await page.goto(attempt.url);
}

async function responseData(page) {
  const pending = page.waitForEvent('download');
  await page.locator('[data-report-action="json"]').click();
  const stream = await (await pending).createReadStream();
  let text = '';
  for await (const chunk of stream) text += chunk;
  return JSON.parse(text);
}

test('mitosis records a corrected classification through the normal microscope feedback and reload', async ({ page }) => {
  const attempt = reportAttempt('mitosis');
  attempt.state.step = 1;
  const key = fieldCells('field-a', attempt.state.seed, 2);
  await start(page, attempt);
  const microscope = page.locator('mitosis-simulator');
  await microscope.getByRole('button', { name: 'Load prepared slide' }).click();
  await microscope.getByRole('button', { name: 'Turn light on' }).click();
  await microscope.getByRole('slider', { name: 'Fine focus', exact: true }).fill('50');
  await microscope.getByRole('button', { name: '40× objective', exact: true }).click();
  for (let index = 0; index < 20; index++) {
    await microscope.locator(`[data-cell="${index}"]`).first().click();
    await microscope.locator(`[data-stage="${index === 0 ? (key[index] + 1) % 5 : key[index]}"]`).click();
  }
  await microscope.getByRole('button', { name: 'Review field classifications' }).click();
  await expect(microscope.locator('#review')).toContainText('19 / 20');
  await microscope.locator('[data-cell="0"]').first().click();
  await microscope.locator(`[data-stage="${key[0]}"]`).click();
  await microscope.getByRole('button', { name: 'Review field classifications' }).click();
  await page.reload();
  const data = await responseData(page);
  expect(data.feedback[0].corrected).toBe(1);
  expect(data.feedback[0].status).toBe('Correct after feedback');
  expect(data.data.feedbackHistory).toHaveLength(2);
});

test('osmosis records a revised calculation using the actual subtraction check', async ({ page }) => {
  const attempt = reportAttempt('osmosis-homeostasis', true);
  attempt.state.step = 5;
  attempt.state.valid = {};
  attempt.state.answers = {};
  const tube = attempt.state.run[0];
  const answer = (tube.finalMass - tube.initialMass).toFixed(2);
  await start(page, attempt);
  await page.getByLabel('Change in mass').fill('99');
  await page.getByRole('button', { name: 'Check calculation' }).click();
  await page.getByLabel('Change in mass').fill(answer);
  await page.getByRole('button', { name: 'Check calculation' }).click();
  await page.reload();
  const data = await responseData(page);
  expect(data.feedback[0].corrected).toBe(1);
  expect(data.data.feedbackHistory.map(check => check.matches[0])).toEqual([false, true]);
  expect(data.status).toBe('In progress');
});

test('Sordaria feedback retains the first classification and the corrected review', async ({ page }) => {
  const attempt = reportAttempt('sordaria-crossing-over');
  attempt.state.step = 1;
  attempt.state.run.prepared = attempt.c.steps.length;
  const key = specimens(attempt.c, attempt.state.run);
  attempt.state.run.scores = [...key];
  attempt.state.run.scores[0] = (key[0] + 1) % 3;
  await start(page, attempt);
  await page.locator('[data-act="review"]').click();
  await page.locator('[data-act="select-0"]').click();
  await page.locator(`[data-act="score-${key[0]}"]`).click();
  await page.locator('[data-act="review"]').click();
  await page.reload();
  const data = await responseData(page);
  expect(data.feedback[0].corrected).toBe(1);
  expect(data.data.feedbackHistory[0].responses[0]).not.toBe(key[0]);
  expect(data.data.feedbackHistory[1].responses[0]).toBe(key[0]);
});
