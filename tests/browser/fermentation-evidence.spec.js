import {test,expect} from '@playwright/test';
import {newYeastRun,advanceYeast} from '../../src/investigations/yeast-model.js';
test('legacy comparison stays on version 1 until explicit reset and exports its model',async({page})=>{
 await page.goto('/investigation.html?lab=yeast-fermentation');
 const legacy={...newYeastRun('none',1,123,1),fuel:'none',prepared:true,connected:true};advanceYeast(legacy,30);
 await page.evaluate(r=>{const k=Object.keys(localStorage).find(k=>k.includes(':yeast-fermentation:v1:'));const s=JSON.parse(localStorage.getItem(k));delete s.fermentationModelVersion;s.yeastRuns={'none-1':r};s.runs={'none-1':r.points.map(({time,value})=>({time,value}))};localStorage.setItem(k,JSON.stringify(s));},legacy);
 await page.reload();await expect(page.getByText('This saved investigation retains the earlier constant-rate model.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await expect(page.getByRole('heading',{name:'No added sugar · Trial 2 of 3'})).toBeVisible();
 await page.locator('yeast-simulator').getByRole('button',{name:'No added sugar',exact:true}).click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes(':yeast-fermentation:v1:')))).yeastRuns['none-2'].version)).toBe(1);
 await page.getByRole('button',{name:'3. Analyze & explain',exact:true}).click();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();const stream=await(await event).createReadStream();let csv='';for await(const c of stream)csv+=c;expect(csv).toContain('1: legacy constant-rate');
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset this lab',exact:true}).click();await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await page.locator('yeast-simulator').getByRole('button',{name:'No added sugar',exact:true}).click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes(':yeast-fermentation:v1:')))).yeastRuns['none-1'].version)).toBe(2);
});
test('evidence is linked after prediction and available offline',async({page,context})=>{
 await page.goto('/investigation.html?lab=yeast-fermentation');await page.getByRole('button',{name:'3. Analyze & explain',exact:true}).click();await page.getByText('Scientific evidence behind the simulation',{exact:true}).click();await expect(page.getByRole('link',{name:'Read the evidence review and model assumptions'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);await page.goto('/resources/fermentation-model-evidence.html');await expect(page.getByRole('heading',{name:'Equal moles are not equal masses'})).toBeVisible();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/fermentation-evidence.png',fullPage:true});
});
