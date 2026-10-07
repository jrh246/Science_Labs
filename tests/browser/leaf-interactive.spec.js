import {test,expect} from '@playwright/test';
async function prep(page){await expect(page.locator('leaf-simulator #scene svg')).toHaveAttribute('aria-label',/cup contains no disks/);for(let n=0;n<3;n++){await page.getByRole('button',{name:'Pull plunger',exact:true}).click();await page.getByRole('button',{name:'Release vacuum',exact:true}).click();}await expect(page.locator('leaf-simulator #scene svg')).toHaveAttribute('aria-label',/cup contains no disks/);await page.getByRole('button',{name:'Add disks to cup',exact:true}).click();}
test('guided sequence collects nine trials then explores without changing comparison data',async({page})=>{
 await page.goto('/investigation.html?lab=light-photosynthesis&mode=virtual');
 const sim=page.locator('leaf-simulator');
 await expect(page.locator('#condition')).toHaveCount(0);await expect(page.locator('#trial')).toHaveCount(0);
 await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Explore other settings'})).toHaveCount(0);
 for(const [i,light] of ['Off','Low','High'].entries())for(let t=1;t<=3;t++){
  await expect(page.locator('.screen-work')).toContainText(`Trial ${i*3+t} of 9`);
  await prep(page);
  if(light==='Off')await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeEnabled();
  else await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();
  if(i===1&&t===1){await sim.getByRole('button',{name:'High',exact:true}).click();await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();}
  if(light!=='Off')await sim.getByRole('button',{name:light,exact:true}).click();
  await sim.getByRole('button',{name:'Start trial',exact:true}).click();
  await expect(sim.locator('#clock')).not.toHaveText('00:00');
  await expect(sim.getByRole('button',{name:'High',exact:true})).toBeDisabled();
  await sim.getByRole('button',{name:'Pause timer',exact:true}).click();
  const paused=await sim.locator('#clock').textContent();await page.waitForTimeout(100);await expect(sim.locator('#clock')).toHaveText(paused);
  if(i===0&&t===1){await page.reload();await expect(sim.locator('#clock')).toHaveText(paused);}
  await sim.getByRole('button',{name:'Run remaining time'}).click();
  await expect(sim.locator('#clock')).toHaveText('20:00');
  await expect(sim.getByRole('button',{name:'Resume timer',exact:true})).toBeDisabled();
  if(i===0&&t===1){await page.reload();await expect(sim.locator('#clock')).toHaveText('20:00');await expect(page.locator('.progress-list')).toContainText('0/3');}
  await sim.getByRole('button',{name:'Collect data and continue'}).click();
 }
 await expect(page.getByRole('heading',{name:'Comparison complete'})).toBeVisible();
 const before=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith(':lamp-workspace')))).runs));
 await page.reload();await page.getByRole('button',{name:'Explore other settings'}).click();
 await prep(page);await sim.getByRole('button',{name:'Run remaining time'}).click();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/10 of 10/);
 await sim.getByRole('button',{name:'Off',exact:true}).click();
 for(let i=0;i<15;i++)await sim.getByRole('button',{name:'Advance 2 minutes'}).click();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/0 of 10/);
 expect(await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith(':lamp-workspace')))).runs))).toBe(before);
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/leaf-explore-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Return to collected data'}).click();
 await page.getByRole('button',{name:'Analyze evidence →'}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();const file=await download;const stream=await file.createReadStream();let text='';for await(const chunk of stream)text+=chunk;expect(text).toContain('Free exploration (excluded from comparison)');
});

test('syringe pull takes 1.5 seconds and cannot advance the trial mid-pull',async({page})=>{
 await page.goto('/investigation.html?lab=light-photosynthesis&mode=virtual');
 const sim=page.locator('leaf-simulator');
 await sim.getByRole('button',{name:'Pull plunger',exact:true}).click();
 await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();
 const motion=await sim.locator('#syringe-plunger').evaluate(el=>{
  const a=el.getAnimations()[0];return {duration:a.effect.getTiming().duration,time:a.currentTime};
 });
 expect(motion.duration).toBe(1500);expect(motion.time).toBeLessThan(1500);
 await expect(sim.getByRole('button',{name:'Release vacuum',exact:true})).toBeEnabled();
 await expect(sim.locator('#syringe-plunger')).toHaveCSS('transform','matrix(1, 0, 0, 1, 116, 0)');
 await sim.getByRole('button',{name:'Release vacuum',exact:true}).click();
 await expect(sim.locator('.prep strong')).toHaveText('Infiltration: 1 / 3 vacuum cycles');
 await page.setViewportSize({width:390,height:844});
 await sim.locator('.prep').screenshot({path:'test-results/syringe-mobile.png'});
 await sim.getByRole('button',{name:'Pull plunger',exact:true}).click();
 await page.getByRole('button',{name:'1. Predict & plan',exact:true}).click();
 await page.waitForTimeout(1600);
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 await expect(sim.getByRole('button',{name:'Pull plunger',exact:true})).toBeEnabled();
});


test('disks stay in the syringe until transfer and the transfer survives reload',async({page})=>{
 await page.goto('/investigation.html?lab=light-photosynthesis&mode=virtual');
 const sim=page.locator('leaf-simulator');
 await expect(sim.locator('#scene svg ellipse')).toHaveCount(1); // Lamp bulb only.
 await expect(sim.getByRole('button',{name:'Add disks to cup',exact:true})).toBeDisabled();
 for(let n=0;n<3;n++){
  await sim.getByRole('button',{name:'Pull plunger',exact:true}).click();
  await expect(sim.getByRole('button',{name:'Add disks to cup',exact:true})).toBeDisabled();
  await sim.getByRole('button',{name:'Release vacuum',exact:true}).click();
 }
 await expect(sim.getByRole('button',{name:'Add disks to cup',exact:true})).toBeEnabled();
 await page.reload();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/cup contains no disks/);
 await expect(sim.getByRole('button',{name:'Off',exact:true})).toBeDisabled();
 await expect(sim.getByRole('button',{name:'Start trial',exact:true})).toBeDisabled();
 await sim.getByRole('button',{name:'Add disks to cup',exact:true}).click();
 await expect(sim.locator('#scene svg ellipse')).toHaveCount(11);
 await expect(sim.locator('.syringe ellipse')).toHaveCount(1); // Shadow only; no sample left.
 await page.reload();
 await expect(sim.locator('#scene svg ellipse')).toHaveCount(11);
 await expect(sim.getByRole('button',{name:'Disks added to cup',exact:true})).toBeDisabled();
 await expect(sim.getByRole('button',{name:'Off',exact:true})).toBeEnabled();
 page.on('dialog',dialog=>dialog.accept());
 await sim.getByRole('button',{name:'Fresh disks / restart trial'}).click();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/cup contains no disks/);
});
