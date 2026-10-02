import {test,expect} from '@playwright/test';
async function complete(page){await page.goto('/');await page.getByRole('button',{name:'Begin Lab'}).click();for(const id of 'ABCDE'){await page.getByRole('button',{name:new RegExp(`Beaker ${id} `)}).click();await page.getByRole('button',{name:'Measure & add water'}).click();await expect(page.locator('.prep-scene')).toHaveClass(/filling/);await expect(page.locator('.volume')).toContainText('1000 mL',{timeout:10000});await expect(page.getByRole('button',{name:'Weigh sugar'})).toBeDisabled();await page.getByRole('button',{name:'Tare / Zero'}).click();await page.getByRole('button',{name:'Weigh sugar'}).click();await page.getByRole('button',{name:'Add sugar & mix'}).click();if(id==='C'){await expect(page.locator('.sugar-grains')).toHaveCSS('opacity','1');await page.waitForTimeout(1500);await page.screenshot({path:'test-results/sugar-pouring.png',fullPage:true});}await expect(page.locator('.worksheet-reminder')).toContainText(`Record beaker ${id} on your lab sheet`,{timeout:10000});}await page.getByRole('button',{name:'Continue'}).click();for(const id of 'ABCDE'){await page.getByRole('button',{name:new RegExp(`Tube ${id} `)}).click();await page.getByRole('button',{name:'Weigh & record initial mass'}).click();await expect(page.locator('table tbody tr').filter({has:page.getByRole('rowheader',{name:id,exact:true})}).locator('td').first()).toHaveText(/\d+\.\d{2} g/);}await page.getByRole('button',{name:'Continue'}).click();await expect(page.getByRole('button',{name:'Begin Experiment'})).toBeDisabled();for(const id of 'ABCDE'){await page.locator(`[data-select="${id}"][data-drop]`).click();await page.getByRole('button',{name:`Place tube ${id} in beaker ${id}`}).click();}await page.getByRole('button',{name:'Begin Experiment'}).click();await page.getByRole('button',{name:'Advance 24 Hours'}).click();await page.getByRole('button',{name:'Continue'}).click();for(const [i,id] of [...'ABCDE'].entries()){await page.getByRole('button',{name:new RegExp(`Tube ${id} `)}).click();await page.getByRole('button',{name:'Remove, weigh & record'}).click();if(id==='A'){await page.getByLabel('Change in mass').fill('99');await page.getByRole('button',{name:'Check calculation'}).click();await expect(page.getByRole('status')).toContainText('Check your subtraction');}await page.getByLabel('Change in mass').fill(String(await page.evaluate(id=>{const t=JSON.parse(localStorage.getItem('cell-lab')).state.run.find(t=>t.id===id);return Number((t.finalMass-t.initialMass).toFixed(2));},id)));await page.getByRole('button',{name:'Check calculation'}).click();}await page.getByRole('button',{name:'Continue'}).click();await expect(page.getByRole('heading',{name:'Your results'})).toBeVisible();}
test('complete experiment, refresh, offline, and reset',async({page,context})=>{await complete(page);const run=await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state.run);await page.reload();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state.run)).toEqual(run);await expect(page.getByRole('heading',{name:'Your results'})).toBeVisible();await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Your results'})).toBeVisible();page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset Lab'}).click();await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();await page.getByRole('button',{name:'Begin Lab'}).click();const newRun=await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state.run);expect(newRun).not.toEqual(run);await page.reload();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state.run)).toEqual(newRun);await expect(page.getByRole('heading',{name:'Prepare the beakers'})).toBeVisible();});
for(const [name,width,height] of [['chromebook',1366,768],['ipad',1024,768],['desktop',1920,1080],['mobile',390,844]])test(`layout ${name}`,async({page})=>{await page.setViewportSize({width,height});await page.goto('/');await page.getByRole('button',{name:'Begin Lab'}).click();await expect(page.getByRole('heading',{name:'Prepare the beakers'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/${name}.png`,fullPage:true});});
test('online reload refreshes HTML instead of retaining a stale cached document',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));const name=(await caches.keys()).find(k=>k.startsWith('cell-lab-'));const cache=await caches.open(name);await cache.put(new URL('index.html',location.href),new Response('<html><body>Stale cached page</body></html>',{headers:{'Content-Type':'text/html'}}));await cache.put(location.href,new Response('<html><body>Stale cached page</body></html>',{headers:{'Content-Type':'text/html'}}));});
 await page.reload();
 await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
});
test('sugar piles increase with mass and fit inside the scale background',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Begin Lab'}).click();
 const heights=[];
 for(const id of 'CDE'){
  await page.getByRole('button',{name:new RegExp(`Beaker ${id} `)}).click();
  await page.getByRole('button',{name:'Measure & add water'}).click();
  await expect(page.locator('.prep-scene')).toHaveClass(/filling/);
  await page.getByRole('button',{name:'Tare / Zero'}).click();
  await page.getByRole('button',{name:'Weigh sugar'}).click();
  await expect(page.locator('.sugar-on-scale')).toHaveClass(/loaded/);
  const pile=await page.locator('.sugar-on-scale span').boundingBox();
  const background=await page.locator('.scale-station').boundingBox();
  expect(pile.y).toBeGreaterThanOrEqual(background.y);
  expect(pile.y+pile.height).toBeLessThan(background.y+background.height);
  heights.push(pile.height);
  await page.screenshot({path:`test-results/sugar-${id}.png`,fullPage:true});
 }
 expect(heights[1]/heights[0]).toBeCloseTo(2,1);expect(heights[2]/heights[0]).toBeCloseTo(3,1);
});

test('reset refreshes stale lab cache from server',async({page})=>{
 await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;const name=(await caches.keys()).find(k=>k.startsWith('cell-lab-'));await (await caches.open(name)).put(new URL('index.html',location.href),new Response('STALE RESET MARKER'));});
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset Lab'}).click();await expect(page.getByRole('button',{name:'Begin Lab'})).toBeEnabled();
 const html=await page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('cell-lab-'));return (await (await caches.open(name)).match(new URL('index.html',location.href))).text();});
 expect(html).not.toContain('STALE RESET MARKER');expect(html).toContain('Cell Homeostasis');
});
test('reset keeps the lab reloadable without internet',async({page,context})=>{
 await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await context.setOffline(true);page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset Lab'}).click();await expect(page.getByRole('button',{name:'Begin Lab'})).toBeEnabled();await page.reload();await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
});

for(const reducedMotion of ['reduce','no-preference'])test(`preparation stays gradual with motion setting ${reducedMotion}`,async({page})=>{
 await page.emulateMedia({reducedMotion});await page.goto('/');await page.getByRole('button',{name:'Begin Lab'}).click();await page.getByRole('button',{name:/Beaker C /}).click();
 const started=Date.now();await page.getByRole('button',{name:'Measure & add water'}).click();
 await expect(page.locator('.volume')).toContainText(/^[1-9]\d{0,2} mL/);
 const scale=await page.locator('.water-fill').evaluate(el=>Number(getComputedStyle(el).transform.split(',')[3]));expect(scale).toBeGreaterThan(0);expect(scale).toBeLessThan(1);
 await expect(page.getByRole('button',{name:'Tare / Zero'})).toBeEnabled({timeout:10000});expect(Date.now()-started).toBeGreaterThanOrEqual(7800);
 await page.getByRole('button',{name:'Tare / Zero'}).click();await page.getByRole('button',{name:'Weigh sugar'}).click();await expect(page.locator('.sugar-on-scale')).toHaveClass(/loaded/);
 await page.getByRole('button',{name:'Add sugar & mix'}).click();await expect(page.locator('.sugar-grains')).toHaveCSS('opacity','1');await expect(page.locator('.volume')).toContainText(/· [1-9]\d? g sugar added/);
 await expect(page.locator('.worksheet-reminder')).toBeVisible({timeout:10000});
});
