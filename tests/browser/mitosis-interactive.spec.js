import {test,expect} from '@playwright/test';
import {fieldCells} from '../../src/investigations/model.js';
async function prepare(page){const sim=page.locator('mitosis-simulator');await sim.getByRole('button',{name:'Load prepared slide'}).click();await sim.getByRole('button',{name:'Turn light on'}).click();await sim.getByRole('slider',{name:'Fine focus',exact:true}).fill('50');await sim.getByRole('button',{name:'40× objective',exact:true}).click();}
test('guided microscope collects two fields and preserves original classifications during exploration',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis');await expect(page.getByRole('heading',{name:'Before you begin: using a microscope'})).toBeVisible();await expect(page.getByRole('heading',{name:'Teacher setup'})).toHaveCount(0);
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await expect(page.locator('#condition')).toHaveCount(0);
 const sim=page.locator('mitosis-simulator');await expect(sim.getByRole('button',{name:'Interphase',exact:true})).toBeDisabled();await expect(sim.getByRole('button',{name:'40× objective',exact:true})).toBeDisabled();await expect(sim.locator('#view')).toContainText('Load the prepared slide');
 const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.includes(':mitosis:v1:')));const seed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).seed,key);
 for(const [fieldIndex,id] of ['field-a','field-b'].entries()){
  await expect(page.locator('.screen-work')).toContainText(`Field ${fieldIndex+1} of 2`);await prepare(page);
  await expect(sim.locator('#view-caption')).toContainText('400×');
  await sim.getByRole('slider',{name:'Fine focus',exact:true}).fill('90');await expect(sim.getByRole('button',{name:'Interphase',exact:true})).toBeDisabled();await sim.getByRole('slider',{name:'Fine focus',exact:true}).fill('50');
  const cells=fieldCells(id,seed);
  for(let i=0;i<20;i++){await sim.locator(`[data-cell="${i}"]`).click();await sim.locator(`[data-stage="${i===0&&fieldIndex===0?(cells[i]+1)%5:cells[i]}"]`).click();if(i===4&&fieldIndex===0){await page.reload();await expect(sim.locator('#tally')).toContainText('5 / 20');}}
  await expect(sim.getByRole('button',{name:'Collect data and continue'})).toBeDisabled();await sim.getByRole('button',{name:'Review field classifications'}).click();await expect(sim.locator('#review')).toContainText(`${fieldIndex===0?19:20} / 20 match`);
  if(fieldIndex===0){await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/microscope-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/microscope-mobile.png',fullPage:true});}
  await sim.getByRole('button',{name:'Collect data and continue'}).click();
 }
 await expect(page.getByRole('heading',{name:'Both fields collected'})).toBeVisible();
 const saved=await page.evaluate(k=>JSON.stringify(JSON.parse(localStorage.getItem(k)).classifications),key);await page.getByRole('button',{name:'Explore other settings'}).click();await prepare(page);await sim.getByRole('button',{name:'Interphase',exact:true}).click();await sim.getByRole('slider',{name:'Practice cycle duration'}).fill('12');await expect(sim.locator('#estimates')).toContainText('12-hour');
 expect(await page.evaluate(k=>JSON.stringify(JSON.parse(localStorage.getItem(k)).classifications),key)).toBe(saved);
 await page.getByRole('button',{name:'Return to collected data'}).click();await page.reload();await page.getByRole('button',{name:'Explore other settings'}).click();await expect(sim.locator('#tally')).toContainText('1 / 20');await expect(sim.getByRole('slider',{name:'Practice cycle duration'})).toHaveValue('12');
 await page.getByRole('button',{name:'Analyze evidence'}).click();await expect(page.locator('.screen-work table')).toContainText('40 cells');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();const stream=await(await download).createReadStream();let text='';for await(const part of stream)text+=part;expect(text).toContain('Microscope exploration (excluded from collected fields)');
});
test('saved classroom fields stay separate from the virtual microscope workspace',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis&sources=classroom,classroom');await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();for(let i=0;i<5;i++)await page.locator(`[name="stage-${i}"]`).fill(i===0?'16':'1');await page.getByRole('button',{name:'Save field count'}).click();await expect(page.getByRole('heading',{name:'Field B · Field 2 of 2'})).toBeVisible();await page.getByRole('link',{name:'Open interactive microscope'}).click();await expect(page.locator('mitosis-simulator')).toBeVisible();await expect(page.getByRole('heading',{name:'Field A · Field 1 of 2'})).toBeVisible();await page.getByRole('link',{name:'Return to saved lab'}).click();await expect(page.getByRole('heading',{name:'Field B · Field 2 of 2'})).toBeVisible();
});
