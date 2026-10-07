import {test,expect} from '@playwright/test';
async function prepare(page,fuel){const sim=page.locator('yeast-simulator');await sim.getByRole('button',{name:fuel,exact:true}).click();await sim.getByRole('button',{name:'Prepare mixture',exact:true}).click();await sim.getByRole('button',{name:'Connect gas syringe',exact:true}).click();}
test('fermentation guides nine prepared trials, restores progress, and protects comparison during exploration',async({page})=>{
 await page.goto('/investigation.html?lab=yeast-fermentation');
 await expect(page.getByRole('heading',{name:'How does the gas-collection apparatus work?'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Teacher setup'})).toHaveCount(0);
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 const sim=page.locator('yeast-simulator');
 await expect(page.locator('#condition,#trial')).toHaveCount(0);
 await expect(sim.locator('#apparatus svg')).toHaveAttribute('aria-label',/Empty flask.*disconnected/);
 await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();
 await expect(sim.getByRole('button',{name:'Connect gas syringe',exact:true})).toBeDisabled();
 for(const [i,fuel] of ['No added sugar','Glucose','Sucrose'].entries())for(let t=1;t<=3;t++){
  await expect(page.locator('.screen-work')).toContainText(`Trial ${i*3+t} of 9`);
  if(i>0)await expect(sim.getByRole('button',{name:'Prepare mixture',exact:true})).toBeDisabled();
  await prepare(page,fuel);
  await expect(sim.locator('#apparatus svg')).toHaveAttribute('aria-label',/Prepared mixture; gas syringe connected/);
  await expect(sim.getByRole('slider',{name:'Water bath temperature'})).toBeDisabled();
  await sim.getByRole('button',{name:'Start trial',exact:true}).click();await expect(sim.locator('#clock')).not.toHaveText('00:00');
  if(i===0&&t===1){await sim.getByRole('button',{name:'Pause timer',exact:true}).click();const time=await sim.locator('#clock').textContent();await page.reload();await expect(sim.locator('#clock')).toHaveText(time);}
  await sim.getByRole('button',{name:'Run remaining time'}).click();await expect(sim.locator('#clock')).toHaveText('30:00');
  await expect(sim.getByRole('button',{name:'Resume timer',exact:true})).toBeDisabled();
  if(i===1&&t===1){await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/yeast-equipment-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/yeast-equipment-mobile.png',fullPage:true});}
  await sim.getByRole('button',{name:'Collect data and continue'}).click();
 }
 await expect(page.getByRole('heading',{name:'Comparison complete'})).toBeVisible();
 const readRuns=()=>page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes(':yeast-fermentation:v1:')))).runs));
 const comparison=await readRuns();await page.getByRole('button',{name:'Explore other settings'}).click();await prepare(page,'Glucose');
 await sim.getByRole('button',{name:'Start trial',exact:true}).click();await sim.getByRole('button',{name:'Run remaining time'}).click();
 await sim.getByRole('slider',{name:'Water bath temperature'}).fill('15');await sim.getByRole('button',{name:'Advance 5 minutes'}).click();await expect(sim.locator('#clock')).toHaveText('35:00');
 expect(await readRuns()).toBe(comparison);
 await page.getByRole('button',{name:'Return to collected data'}).click();await page.reload();await page.getByRole('button',{name:'Explore other settings'}).click();await expect(sim.locator('#clock')).toHaveText('35:00');
 page.on('dialog',d=>d.accept());await sim.getByRole('button',{name:'Fresh mixture / restart trial'}).click();await sim.getByLabel("Include 0.5 g baker's yeast").uncheck();await prepare(page,'Glucose');await sim.getByRole('button',{name:'Start trial',exact:true}).click();await sim.getByRole('button',{name:'Run remaining time'}).click();await expect(sim.locator('#apparatus svg')).toHaveAttribute('aria-label',/0.0 milliliters/);
 expect(await readRuns()).toBe(comparison);
 await page.getByRole('button',{name:'Analyze evidence'}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();const stream=await (await download).createReadStream();let csv='';for await(const chunk of stream)csv+=chunk;expect(csv).toContain('Free exploration (excluded from comparison)');
});


test('saved fermentation classroom data and notes stay separate from the virtual apparatus workspace',async({page})=>{
 await page.goto('/investigation.html?lab=yeast-fermentation&sources=classroom,virtual,virtual');
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 for(let time=0;time<=30;time+=5)await page.getByRole('spinbutton',{name:`Reading at ${time} minutes`,exact:true}).fill(String(time/10));
 await page.getByRole('button',{name:'Save classroom trial'}).click();
 await expect(page.getByRole('heading',{name:'No added sugar · Trial 2 of 3'})).toBeVisible();
 await page.getByRole('link',{name:'Open interactive fermentation apparatus'}).click();
 await expect(page.locator('yeast-simulator')).toBeVisible();
 await expect(page.getByRole('heading',{name:'No added sugar · Trial 1 of 3'})).toBeVisible();
 await page.getByRole('link',{name:'Return to saved lab'}).click();
 await expect(page.getByRole('heading',{name:'No added sugar · Trial 2 of 3'})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith(':classroom,virtual,virtual')))).runs['none-1'].at(-1).value)).toBe(3);
});
