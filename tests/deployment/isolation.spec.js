import {test,expect} from '@playwright/test';
async function controlled(page,expectedScope){
 await page.evaluate(async expected=>{
  await navigator.serviceWorker.ready;
  const deadline=Date.now()+15000;
  while(!navigator.serviceWorker.controller?.scriptURL.endsWith(expected+'sw.js')){
   if(Date.now()>deadline)throw new Error('Wrong service worker scope');
   await new Promise(r=>setTimeout(r,100));
  }
 },expectedScope);
}
test('production and development keep independent progress and offline caches',async({page,context})=>{
 await page.goto('/Science_Labs/');
 // Both the original production lab and a future promoted library are supported.
 const productionLab=await page.getByRole('button',{name:'Begin Lab'}).count()?'/Science_Labs/':'/Science_Labs/lab.html';
 await page.goto(productionLab);await controlled(page,'/Science_Labs/');
 await page.getByRole('button',{name:'Begin Lab'}).click();
 const original=await page.evaluate(()=>localStorage.getItem('cell-lab'));
 await page.goto('/Science_Labs/dev/');
 await expect(page.getByRole('complementary',{name:'Development preview'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Big questions. Real discoveries.'})).toBeVisible();
 await controlled(page,'/Science_Labs/dev/');
 await page.goto('/Science_Labs/dev/#/search?q=osmosis');
 await page.getByRole('link',{name:'Osmosis and Cell Homeostasis',exact:true}).click();
 await page.getByRole('link',{name:'Launch virtual lab'}).click();
 await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
 await page.getByRole('button',{name:'Begin Lab'}).click();
 expect(await page.evaluate(()=>localStorage.getItem('cell-lab'))).toBe(original);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab:development:/Science_Labs/dev/')).state.step)).toBe(1);
 page.on('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Reset Lab'}).click();
 await expect(page.getByRole('button',{name:'Begin Lab'})).toBeEnabled();
 expect(await page.evaluate(()=>localStorage.getItem('cell-lab'))).toBe(original);
 const keys=await page.evaluate(()=>caches.keys());
 expect(keys.some(k=>k.startsWith('science-labs:/Science_Labs/:'))).toBeTruthy();
 expect(keys.some(k=>k.startsWith('science-labs:/Science_Labs/dev/:'))).toBeTruthy();
 await context.setOffline(true);
 await page.goto(productionLab);await expect(page.getByRole('heading',{name:'Prepare the beakers'})).toBeVisible();
 await page.getByRole('button',{name:'Reset Lab'}).click();
 await expect(page.getByRole('button',{name:'Begin Lab'})).toBeEnabled();
 await page.goto('/Science_Labs/dev/lab.html');await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
 await page.goto('/Science_Labs/dev/#/science/biology');await expect(page.getByRole('heading',{name:'Investigate living things.'})).toBeVisible();
});
