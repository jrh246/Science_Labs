export async function fillRequiredPlan(page) {
  for (const [field, answer] of [
    ['prediction', 'I expect a difference because the treatments or samples differ.'],
    ['design', 'Keep conditions matched, use the controls, and record each required sample.']
  ]) {
    const input = page.locator(`[data-note="${field}"]`);
    if (await input.count() && await input.isVisible() && !(await input.inputValue()).trim()) {
      await input.fill(answer);
    }
  }
}

export async function openPlannedCollection(page) {
  await fillRequiredPlan(page);
  await page.getByRole('button', { name: '2. Collect observations', exact: true }).click();
}
