import {test,expect} from '@playwright/test';
test('all new preview labs and PDFs survive offline reload at the deployment subpath',async({page,context})=>{
 await page.goto('/Science_Labs/dev/investigation.html?lab=light-photosynthesis');
 await expect(page.getByRole('complementary',{name:'Development preview'})).toBeVisible();
 await page.getByLabel('Prediction — what do you expect, and why?').fill('My preview prediction');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 const keys=await page.evaluate(()=>Object.keys(localStorage));
 expect(keys.some(k=>k.startsWith('science-labs:/Science_Labs/dev/:light-photosynthesis:'))).toBeTruthy();
 await context.setOffline(true);
 await page.goto('/Science_Labs/dev/activity.html?offline=1');
 await expect(page.getByRole('heading',{name:'Matter cycles. Energy flows.'})).toBeVisible();
 await page.locator('[data-card="light"]').click();await page.locator('[data-place="photo-help"]').click();
 expect(await page.evaluate(()=>Object.keys(localStorage).some(k=>k==='science-labs:/Science_Labs/dev/:matter-cycle:v2'))).toBeTruthy();
 for(const [id,title] of [['light-photosynthesis','Light and Photosynthesis'],['yeast-fermentation','Yeast Fermentation and Fuel Sources'],['mitosis','Measuring Mitosis']]){
  await page.goto('/Science_Labs/dev/investigation.html?lab='+id);await page.reload();
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  for(const type of ['worksheet','teacher-guide']){
   expect(await page.evaluate(async path=>{const r=await fetch(path);return (await r.text()).slice(0,4);},`./resources/${id}-${type}.pdf`)).toBe('%PDF');
  }
 }
});
