import {test,expect} from '@playwright/test';
import {fieldCells} from '../../src/investigations/model.js';
async function prepare(page){const sim=page.locator('mitosis-simulator');await sim.getByRole('button',{name:'Load prepared slide'}).click();await sim.getByRole('button',{name:'Turn light on'}).click();await sim.getByRole('slider',{name:'Fine focus',exact:true}).fill('50');await sim.getByRole('button',{name:'40× objective',exact:true}).click();}
test('guided microscope collects two fields and preserves original classifications during exploration',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis');await expect(page.getByRole('heading',{name:'Before you begin: using a microscope'})).toBeVisible();await expect(page.getByRole('heading',{name:'Teacher setup'})).toHaveCount(0);await expect(page.locator('.screen-work')).toContainText('10× eyepiece × 10× objective = 100×');await expect(page.locator('.screen-work')).toContainText('10× eyepiece × 40× objective = 400×');
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await expect(page.locator('#condition')).toHaveCount(0);
 const sim=page.locator('mitosis-simulator');await expect(sim.getByRole('button',{name:'Interphase',exact:true})).toBeDisabled();await expect(sim.getByRole('button',{name:'40× objective',exact:true})).toBeDisabled();await expect(sim.locator('#view')).toContainText('Load the prepared slide');
 const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.includes(':mitosis:v1:')));const seed=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).seed,key);
 for(const [fieldIndex,id] of ['field-a','field-b'].entries()){
  await expect(page.locator('.screen-work')).toContainText(`Field ${fieldIndex+1} of 2`);await prepare(page);
  await expect(sim.locator('#view-caption')).toContainText('400×');await expect(sim.locator('.classify-box [data-stage]')).toHaveCount(5);await expect(page.getByLabel(/Observation reflections/)).toBeVisible();
  const view=await sim.locator('#view').boundingBox(),choices=await sim.locator('.classify-box').boundingBox();expect(choices.y).toBeGreaterThan(view.y+view.height);expect(choices.y-view.y-view.height).toBeLessThan(150);
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

test('legacy microscope attempts retain the original key until explicitly reset',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis');
 const {key,seed}=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.includes(':mitosis:v1:')),s=JSON.parse(localStorage.getItem(key));delete s.mitosisModelVersion;s.classifications['field-a']=Array(20).fill(0);localStorage.setItem(key,JSON.stringify(s));return {key,seed:s.seed};});
 await page.reload();await expect(page.getByText(/This saved attempt keeps the original cell fields/)).toBeVisible();
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await prepare(page);
 const sim=page.locator('mitosis-simulator');
 for(const [i,stage] of fieldCells('field-a',seed,1).entries()){await sim.locator(`[data-cell="${i}"]`).click();await sim.locator(`[data-stage="${stage}"]`).click();}
 await sim.getByRole('button',{name:'Review field classifications'}).click();await expect(sim.locator('#review')).toContainText('20 / 20 match');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset this lab',exact:true}).click();
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).mitosisModelVersion,key)).toBe(2);
 await expect(page.getByText(/This saved attempt keeps the original cell fields/)).toHaveCount(0);
});

test('completed fields prompt review, identify mismatches, and support corrections',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis');await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await prepare(page);
 const sim=page.locator('mitosis-simulator');
 const seed=await page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes(':mitosis:v1:')))).seed);
 const cells=fieldCells('field-a',seed);
 for(const [i,stage] of cells.entries()){await sim.locator(`.cell-map [data-cell="${i}"]`).click();await sim.locator(`[data-stage="${i===2||i===17?(stage+1)%5:stage}"]`).click();}
 await expect(sim.locator('#note')).toContainText('Click Review field classifications');await expect(sim.locator('#step')).toContainText('Click Review field classifications');
 await expect(sim.locator('#review')).toBeEmpty();await sim.getByRole('button',{name:'Review field classifications'}).click();
 await expect(sim.locator('#review')).toContainText('18 / 20 match');await expect(sim.locator('.review-list li')).toHaveCount(2);
 for(const i of [2,17]){const row=sim.locator(`.review-list li:has([data-revisit="${i}"])`);await expect(row).toContainText('you selected');await expect(row).toContainText('the model classification is');await expect(sim.locator(`.cell-map [data-cell="${i}"]`)).toHaveAccessibleName(/does not match/);}
 await page.reload();await expect(sim.locator('.review-list li')).toHaveCount(2);
 for(const i of [2,17]){await sim.getByRole('button',{name:`Revisit Cell ${i+1}`,exact:true}).click();await expect(sim.locator('#classify-title')).toHaveText(`Record a stage for Cell ${i+1}`);await sim.locator(`[data-stage="${cells[i]}"]`).click();await expect(sim.getByRole('button',{name:'Collect data and continue'})).toBeDisabled();await expect(sim.locator('#review')).toBeEmpty();await sim.getByRole('button',{name:'Review field classifications'}).click();}
 await expect(sim.locator('#review')).toContainText('20 / 20 match');await expect(sim.locator('.review-list li')).toHaveCount(0);await expect(sim.locator('.cell-map .review-mismatch')).toHaveCount(0);await expect(sim.getByRole('button',{name:'Collect data and continue'})).toBeEnabled();
});

test('cell map matches numbered field positions and enlarged cell drawings',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis');await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await prepare(page);
 const sim=page.locator('mitosis-simulator');
 await sim.getByRole('button',{name:'10× objective',exact:true}).click();
 await expect(sim.locator('.overview-cell')).toHaveCount(20);
 const drawings=await sim.locator('.overview-cell svg g').evaluateAll(nodes=>nodes.map(n=>n.innerHTML));
 for(const i of [0,3,4,9,19]){
  await sim.locator(`.cell-map [data-cell="${i}"]`).click();await expect(sim.locator('.overview-cell.selected-cell')).toHaveAttribute('data-field-cell',String(i));await expect(sim.locator('.overview-cell.selected-cell .cell-number')).toHaveText(String(i+1));
  await sim.getByRole('button',{name:'40× objective',exact:true}).click();await expect(sim.locator('.detail-cell .cell-number')).toHaveText(String(i+1));expect(await sim.locator('.detail-cell svg g').innerHTML()).toBe(drawings[i]);await sim.getByRole('button',{name:'10× objective',exact:true}).click();
 }
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:844});
  for(const selector of ['.overview-cell','.cell-map button']){
   const boxes=await sim.locator(selector).evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y};}));
   for(let i=0;i<20;i++){expect(Math.abs(boxes[i].y-boxes[Math.floor(i/4)*4].y)).toBeLessThan(1);if(i%4)expect(boxes[i].x).toBeGreaterThan(boxes[i-1].x);else if(i)expect(boxes[i].y).toBeGreaterThan(boxes[i-4].y);}
  }
  await page.screenshot({path:`test-results/mitosis-map-${width}.png`,fullPage:true});
 }
});
