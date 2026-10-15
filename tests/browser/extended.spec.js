import {test,expect} from '@playwright/test';
import {extendedLabs} from '../../src/investigations/extended-content.js';
import {sequence} from '../../src/investigations/extended-model.js';
async function prepare(page,c){
 if(c.kind==='corn'){await page.locator('[data-act^="ear-"]:not([disabled])').click();await page.locator('[data-act="region-1"]').click();return;}
 if(c.kind==='meiosis')return;
 for(let i=0;i<c.steps.length;i++){
  await page.locator(`[data-act="tool-${i}"]`).click();
  if(c.kind==='gel'&&i===1){for(let j=0;j<4;j++)await page.locator(`[data-act="lane-${j}"]`).click();}
  else {const times=(c.kind==='extraction'&&i===0&&!await page.getByRole('heading',{name:'No fruit blank',exact:true}).count())||(c.kind==='regulation'&&i===2)?3:1;for(let n=0;n<times;n++)await page.locator(`[data-act="prepare-${i}"]`).click();}
  await expect(page.locator('.bench-procedure li').nth(i)).toHaveClass('done');
 }
}
async function finish(page,c){
 await prepare(page,c);
 if(c.kind==='meiosis'){
 await page.locator('[data-act="mei-pair"]').click();
 await expect(page.locator('[data-act="mei-exchange"]')).toBeVisible();const control=await page.getByRole('heading',{name:'No exchange comparison',exact:true}).count();
 if(!control){await page.locator('[data-act="chromatid-0"]').click();await page.locator('[data-act="chromatid-2"]').click();const ab=await page.getByRole('heading',{name:'Exchange between A and B',exact:true}).count();await page.locator(`[data-act="cut-${ab?1:2}"]`).click();}
 await page.locator('[data-act="mei-exchange"]').click();await page.locator('[data-act="mei-first"]').click();for(let i=0;i<4;i++){await page.locator(`[data-act="pick-gamete-${i}"]`).click();await page.locator(`[data-act="place-gamete-${i}"]`).click();}
 for(let i=0;i<4;i++)await page.locator('[data-act="tally-plus-0"]').click();await page.locator('[data-act="review"]').click();
 }
 else if(c.categories){for(let i=0;i<c.count;i++)await page.locator('[data-act="tally-plus-0"]').click();await page.locator('[data-act="review"]').click();}
 else if(c.kind==='microscope'){await page.getByRole('combobox',{name:'Objective',exact:true}).selectOption('40');await page.getByRole('slider',{name:'Ruler endpoint (scale divisions)'}).press('End');}
 else {await page.getByRole('button',{name:'Run remaining time',exact:true}).click();if(c.kind==='gel'){await page.locator('[data-act="stain"]').click();for(const [i,v] of [3000,1500,700].entries()){await page.locator(`[data-estimate="${i}"]`).fill(String(v));await page.locator(`[data-estimate="${i}"]`).press('Tab');}}if(['regulation','expression'].includes(c.kind))await page.locator('[data-act="viewer"]').click();}
 await page.getByRole('button',{name:'Collect data and continue',exact:true}).click();
}
for(const c of extendedLabs)test(`${c.id}: complete comparison, restore, analyze, export and explore`,async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));await page.goto('/investigation.html?lab='+c.id);await expect(page.getByRole('heading',{name:c.title,exact:true})).toBeVisible();
 await expect(page.locator('#classroom-options')).not.toHaveAttribute('open','');
 await page.getByLabel('Prediction —').fill('Predict a measurable difference based on the treatment.');await page.getByRole('button',{name:'Begin observations'}).click();
 await expect(page.locator('[data-act="collect"]')).toBeDisabled();await expect(page.locator('.ext-next-step')).toBeVisible();
 for(const job of sequence(c))await finish(page,c);
 await expect(page.getByRole('heading',{name:'Comparison complete'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'Comparison complete'})).toBeVisible();
 if(c.duration&&!['gel','extraction'].includes(c.kind)){await expect(page.locator('.ext-legend li')).toHaveCount(c.conditions.length);await expect(page.locator('.ext-legend svg')).toHaveCount(c.conditions.length);}
 await page.getByRole('button',{name:'Analyze evidence',exact:true}).click();await expect(page.locator('.ext-scroll tbody tr')).toHaveCount(sequence(c).length);
 for(let i=0;i<3;i++)await page.locator(`[data-note="answer-${i}"]`).fill('Claim supported by my observations, with uncertainty and a control.');
 await page.getByRole('button',{name:'Mark work complete'}).click();await expect(page.getByRole('status')).toContainText('complete');
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download observations CSV'}).click();expect((await dl).suggestedFilename()).toBe(c.id+'-observations.csv');
 await page.getByRole('button',{name:'Explore other settings'}).click();await expect(page.getByLabel('Explore a condition')).toBeVisible();await page.getByLabel('Explore a condition').selectOption('1');await page.getByRole('button',{name:'3. Analyze evidence'}).click();await expect(page.locator('.ext-scroll tbody tr')).toHaveCount(sequence(c).length);
 await page.locator('#classroom-options summary').click();for(const kind of ['worksheet','teacher-guide']){const response=await page.request.get(`/resources/${c.id}-${kind}.pdf`);expect(response.ok()).toBeTruthy();expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');}
 expect(errors).toEqual([]);
});
test('new lab classroom entry, timer pause/reload, mobile and offline navigation',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});const c=extendedLabs.find(x=>x.kind==='enzyme');await page.goto('/investigation.html?lab='+c.id);await page.getByRole('button',{name:'Begin observations'}).click();
 await page.locator('[data-act="source"]').click();await page.locator('[name="value-0"]').fill('12.5');await page.locator('[name="observation"]').fill('Measured with a gas syringe; starting volume zero.');await page.getByRole('button',{name:'Save classroom data and continue'}).click();await page.locator('[data-act="source"]').click();await prepare(page,c);await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Advance 30 seconds',exact:true}).click();await page.reload();await expect(page.locator('.ext-clock')).toContainText('30');await expect(page.getByRole('button',{name:'Start / resume',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:'test-results/new-enzyme-mobile.png',fullPage:true});
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);await page.goto('/investigation.html?lab=gel-electrophoresis');await expect(page.getByRole('heading',{name:'Separating DNA Fragments',exact:true})).toBeVisible();
});

test('corn marks remain separate from tallies and restore at phone width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/investigation.html?lab=inheritance-ratios');await page.getByRole('button',{name:'Begin observations'}).click();
 await page.locator('[data-act="ear-0"]').click();await expect(page.locator('.corn-region-ear')).toBeVisible();
 await page.locator('[data-act="region-2"]').click();await page.locator('[data-act="mark-0"]').click();
 await expect(page.getByLabel('Purple tally',{exact:true})).toHaveText('0');await expect(page.getByLabel('Yellow tally',{exact:true})).toHaveText('0');
 await page.getByRole('button',{name:'Add Purple',exact:true}).click();await page.getByRole('button',{name:'Add Yellow',exact:true}).click();await page.getByRole('button',{name:'Subtract Yellow',exact:true}).click();
 await page.reload();await expect(page.getByLabel('Purple tally',{exact:true})).toHaveText('1');await expect(page.locator('[data-act="mark-0"]')).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('chromosome exchange restricts nonsister choice and preserves placement on reload',async({page})=>{
 await page.goto('/investigation.html?lab=meiosis-variation');await page.getByRole('button',{name:'Begin observations'}).click();await finish(page,extendedLabs.find(c=>c.kind==='meiosis'));
 await page.locator('[data-act="mei-pair"]').click();await expect(page.locator('[data-act="mei-exchange"]')).toBeVisible();
 await page.locator('[data-act="chromatid-0"]').click();await page.locator('[data-act="chromatid-1"]').click();
 await expect(page.locator('[data-act="chromatid-0"]')).toHaveAttribute('aria-pressed','false');
 await page.locator('[data-act="chromatid-2"]').click();await page.locator('[data-act="cut-2"]').click();await expect(page.locator('[data-act="mei-exchange"]')).toBeDisabled();
 await page.locator('[data-act="cut-1"]').click();await page.locator('[data-act="mei-exchange"]').click();await page.locator('[data-act="mei-first"]').click();
 await page.locator('[data-act="pick-gamete-0"]').click();await page.locator('[data-act="place-gamete-2"]').click();await expect(page.getByRole('status')).toContainText('Keep the two');
 await page.locator('[data-act="place-gamete-0"]').click();await page.reload();await expect(page.locator('[data-act="place-gamete-0"]')).toContainText('A');await expect(page.locator('[data-act="pick-gamete-0"]')).toBeDisabled();
});
