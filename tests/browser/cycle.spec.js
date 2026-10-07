import {test,expect} from '@playwright/test';
const solution={light:'photo-energy',chlorophyll:'photo-help',mitochondrion:'resp-place',atp:'resp-energy',heat:'resp-energy','glucose-1':'photo-out','glucose-2':'resp-in'};
for(let n=1;n<=12;n++){solution[`co2-${n}`]=n<=6?'photo-in':'resp-out';solution[`water-${n}`]=n<=6?'photo-in':'resp-out';solution[`oxygen-${n}`]=n<=6?'photo-out':'resp-in';}

test('landing choices lead to separate activity and lab, with no embedded activity',async({page})=>{
 await page.goto('/#/science/biology/the-cell/light-photosynthesis');
 await page.getByRole('link',{name:'Start card activity'}).click();
 await expect(page).toHaveURL(/activity.html$/);
 await expect(page.getByRole('heading',{name:'Matter cycles. Energy flows.'})).toBeVisible();
 await page.getByRole('link',{name:'Activity & lab choices'}).click();
 await page.getByRole('link',{name:'Launch virtual lab'}).click();
 await expect(page.locator('equation-builder')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Start with a question'})).toBeVisible();
});
test('drag, keyboard placement, correction, save, mobile, and offline activity',async({page,context})=>{
 await page.goto('/activity.html');
 await page.getByRole('button',{name:'Check my model'}).click();
 await expect(page.locator('#model-feedback')).toContainText('0 of 8');
 await page.locator('[data-zone="photo-in"]').scrollIntoViewIfNeeded();
 await page.locator('[data-card="co2-1"]').dragTo(page.locator('[data-zone="photo-in"]'));
 await expect(page.locator('[data-zone="photo-in"] [data-card="co2-1"]')).toHaveCount(1);
 for(const [card,zone] of Object.entries(solution).filter(([id])=>id!=='co2-1')){
   await page.locator(`[data-card="${card}"]`).focus();await page.keyboard.press('Enter');
   await page.locator(`[data-place="${zone}"]`).focus();await page.keyboard.press('Enter');
 }
 await page.getByRole('button',{name:'Check my model'}).click();
 await expect(page.locator('#model-feedback')).toContainText('Your cycle is complete!');
 await expect(page.locator('.bank-cards .molecule-card')).toHaveCount(0);
 await page.reload();await expect(page.locator('#model-feedback')).toContainText('Your cycle is complete!');
 await page.setViewportSize({width:1440,height:1100});await page.screenshot({path:'test-results/cycle-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/cycle-mobile.png',fullPage:true});
 await page.locator('[data-card="heat"]').click();await page.locator('[data-place="bank"]').click();
 await expect(page.locator('.bank-cards [data-card="heat"]')).toHaveCount(1);
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await context.setOffline(true);await page.goto('/activity.html?offline=1');
 await expect(page.getByRole('heading',{name:'Matter cycles. Energy flows.'})).toBeVisible();
 await expect(page.locator('.bank-cards [data-card="heat"]')).toHaveCount(1);
 await context.setOffline(false);
 page.on('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Start over'}).click();
 await expect(page.locator('.bank-cards .molecule-card')).toHaveCount(9);
});


test('small screen can move energy directly using the fixed destination bar',async({page})=>{
 await page.setViewportSize({width:390,height:640});await page.goto('/activity.html');
 for(const id of ['heat','atp']){
  await page.locator(`[data-card="${id}"]`).click();
  await expect(page.locator('.move-dock')).toBeInViewport();
  await expect(page.locator('[data-zone="resp-energy"]')).not.toBeInViewport();
  await page.getByLabel('Destination',{exact:true}).selectOption('resp-energy');
  await page.getByRole('button',{name:'Move here',exact:true}).click();
  await expect(page.locator(`[data-zone="resp-energy"] [data-card="${id}"]`)).toHaveCount(1);
 }
 await page.locator('[data-card="water-1"]').click();
 await page.getByLabel('Destination',{exact:true}).selectOption('photo-in');
 await page.getByRole('button',{name:'Move here',exact:true}).click();
 await page.locator('[data-card="water-2"]').click();
 await page.getByRole('button',{name:'Move here',exact:true}).click();
 await expect(page.locator('[data-zone="photo-in"] .molecule-token')).toHaveCount(2);
 await expect(page.locator('[data-zone="photo-in"] .molecule-tally')).toHaveText('2 H₂O');
 await page.locator('[data-card="water-3"]').click();
 await page.screenshot({path:'test-results/cycle-move-dock.png',fullPage:false});
});
