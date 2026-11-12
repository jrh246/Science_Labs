import {fillRequiredPlan} from './planning-helpers.js';
import {test,expect} from '@playwright/test';
import {extendedLabs} from '../../src/investigations/extended-content.js';
import {sequence} from '../../src/investigations/extended-model.js';
async function prepare(page,c){
 if(await page.locator('[data-act="reuse-setup"]').count()){
  await page.locator('[data-act="reuse-setup"]').click();
  await expect(page.locator('.preparation-source')).toContainText('No observations have been copied');
  await expect(page.locator('[data-act="collect"]')).toBeDisabled();
  return;
 }
 if(c.kind==='corn'){await page.locator('[data-act^="ear-"]:not([disabled])').click();await page.locator('[data-act="region-1"]').click();return;}
 if(c.kind==='meiosis')return;
 for(let i=0;i<c.steps.length;i++){
  await page.locator(`[data-act="tool-${i}"]`).click();
  if(c.kind==='gel'&&i===1){for(let j=0;j<4;j++)await page.locator(`[data-act="lane-${j}"]`).click();}
  else {const times=(c.kind==='extraction'&&i===0&&!await page.getByRole('heading',{name:'No fruit blank',exact:true}).count())?3:1;for(let n=0;n<times;n++)await page.locator(`[data-act="prepare-${i}"]`).click();}
  await expect(page.locator('.bench-procedure li').nth(i)).toHaveClass('done');
 }
}
async function finish(page,c){
 await prepare(page,c);
 if(c.kind==='meiosis'){
 const egg=await page.getByRole('heading',{name:'Egg formation (oogenesis)',exact:true}).count();
 await page.locator('[data-act="mei-pair"]').click();
 await page.locator('[data-act="chromatid-0"]').click();await page.locator('[data-act="chromatid-2"]').click();await page.locator('[data-act="cut-1"]').click();
 await page.locator('[data-act="mei-exchange"]').click();await page.locator('[data-act="mei-first"]').click();
 if(egg)await page.locator('[data-act="egg-resume"]').click();
 for(let i=0;i<4;i++){await page.locator(`[data-act="pick-gamete-${i}"]`).click();await page.locator(`[data-act="place-gamete-${i}"]`).click();}
 if(!egg){await expect(page.locator('[data-act="collect"]')).toBeDisabled();await page.locator('[data-act="mature-sperm"]').click();await expect(page.locator('.sperm-icon')).toHaveCount(4);await expect(page.locator('.polar-product')).toHaveCount(0);await page.locator('.product-groups').screenshot({path:'test-results/sperm-products.png'});}
 }
 else if(c.categories){for(let i=0;i<c.count;i++)await page.locator('[data-act="tally-plus-0"]').click();await page.locator('[data-act="review"]').click();}
 else if(c.kind==='microscope'){await page.getByRole('combobox',{name:'Objective',exact:true}).selectOption('40');await page.getByRole('slider',{name:'Ruler endpoint (scale divisions)'}).press('End');}
 else {await page.getByRole('button',{name:'Run remaining time',exact:true}).click();if(c.kind==='gel'){await page.locator('[data-act="stain"]').click();for(const [i,v] of [3000,1500,700].entries()){await page.locator(`[data-estimate="${i}"]`).fill(String(v));await page.locator(`[data-estimate="${i}"]`).press('Tab');}}if(['regulation','expression'].includes(c.kind))await page.locator('[data-act="viewer"]').click();}
 await page.locator('[data-act="collect"]').click();
}
for(const c of extendedLabs.filter(c=>c.kind!=='extraction'))test(`${c.id}: complete comparison, restore, analyze, export and explore`,async({page})=>{
 const errors=[];page.on('pageerror',err=>errors.push(err.message));await page.goto('/investigation.html?lab='+c.id);await expect(page.getByRole('heading',{name:c.title,exact:true})).toBeVisible();
 await expect(page.locator('#classroom-options')).not.toHaveAttribute('open','');
 await page.getByLabel('Prediction —').fill('Predict a measurable difference based on the treatment.');await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 await expect(page.locator('[data-act="collect"]')).toBeDisabled();await expect(page.locator('.ext-next-step')).toBeVisible();
 for(const job of sequence(c))await finish(page,c);
 await expect(page.getByRole('heading',{name:c.kind==='meiosis'?'Egg and sperm pathways complete':'Comparison complete'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:c.kind==='meiosis'?'Egg and sperm pathways complete':'Comparison complete'})).toBeVisible();
 if(c.duration&&!['gel','extraction'].includes(c.kind)){await expect(page.locator('.ext-legend li')).toHaveCount(c.conditions.length);await expect(page.locator('.ext-legend svg')).toHaveCount(c.conditions.length);if(c.repeats===1)await expect(page.locator('.ext-legend')).not.toContainText('mean of 1');}
 await page.getByRole('button',{name:'Analyze evidence',exact:true}).click();await expect(page.locator('.ext-scroll tbody tr')).toHaveCount(sequence(c).length);
 if(['corn','flies'].includes(c.kind))await expect(page.locator('.sample-comparison li')).toHaveCount(sequence(c).length);
 for(let i=0;i<3;i++)await page.locator(`[data-note="answer-${i}"]`).fill('Claim supported by my observations, with uncertainty and a control.');
 await page.getByRole('button',{name:'Mark work complete'}).click();await expect(page.locator('#lab-complete-feedback')).toContainText('Saved just now');
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download observations CSV'}).click();expect((await dl).suggestedFilename()).toBe(c.id+'-observations.csv');
 await page.getByRole('button',{name:'Explore other settings'}).click();await expect(page.getByLabel('Explore a condition')).toBeVisible();await page.getByLabel('Explore a condition').selectOption(String(Math.min(1,c.conditions.length-1)));await page.getByRole('button',{name:'3. Analyze evidence'}).click();await expect(page.locator('.ext-scroll tbody tr')).toHaveCount(sequence(c).length);
 await page.locator('#classroom-options summary').click();for(const kind of ['worksheet','teacher-guide']){const response=await page.request.get(`/resources/${c.id}-${kind}.pdf`);expect(response.ok()).toBeTruthy();expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');}
 expect(errors).toEqual([]);
});
test('new lab classroom entry, timer pause/reload, mobile and offline navigation',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});const c=extendedLabs.find(x=>x.kind==='enzyme');await page.goto('/investigation.html?lab='+c.id);await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 await page.locator('[data-act="source"]').click();await page.locator('[name="value-0"]').fill('12.5');await page.locator('[name="observation"]').fill('Measured with a gas syringe; starting volume zero.');await page.getByRole('button',{name:'Save classroom data and continue'}).click();await page.locator('[data-act="source"]').click();await prepare(page,c);await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Advance 30 seconds',exact:true}).click();await page.reload();await expect(page.locator('.ext-clock')).toContainText('30');await expect(page.getByRole('button',{name:'Start / resume',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:'test-results/new-enzyme-mobile.png',fullPage:true});
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);await page.goto('/investigation.html?lab=gel-electrophoresis');await expect(page.getByRole('heading',{name:'Separating DNA Fragments',exact:true})).toBeVisible();
});

test('corn marks remain separate from tallies and restore at phone width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/investigation.html?lab=inheritance-ratios');await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 await page.locator('[data-act="ear-0"]').click();await expect(page.locator('.corn-region-ear')).toBeVisible();
 await page.locator('[data-act="region-2"]').click();
 const ear=await page.locator('.corn-ear').elementHandle(),kernel=await page.locator('[data-act="mark-0"]').elementHandle();
 await page.locator('[data-act="mark-0"]').click();
 expect(await ear.evaluate(el=>el===document.querySelector('.corn-ear'))).toBeTruthy();
 expect(await kernel.evaluate(el=>el===document.querySelector('[data-act="mark-0"]'))).toBeTruthy();
 await expect(page.locator('[data-act="mark-0"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-act="mark-0"]').press('Space');
 await expect(page.locator('[data-act="mark-0"]')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('[data-act="mark-0"]')).toBeFocused();
 await page.locator('[data-act="mark-0"]').press('Space');
 expect(await ear.evaluate(el=>el===document.querySelector('.corn-ear'))).toBeTruthy();
 await expect(page.getByLabel('Purple tally',{exact:true})).toHaveText('0');await expect(page.getByLabel('Yellow tally',{exact:true})).toHaveText('0');
 await page.getByRole('button',{name:'Add Purple',exact:true}).click();await page.getByRole('button',{name:'Add Yellow',exact:true}).click();await page.getByRole('button',{name:'Subtract Yellow',exact:true}).click();
 await page.reload();await expect(page.getByLabel('Purple tally',{exact:true})).toHaveText('1');await expect(page.locator('[data-act="mark-0"]')).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('egg and sperm begin in one nucleus, then form distinct products without repeated trials',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/investigation.html?lab=meiosis-variation');await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 await expect(page.locator('.shared-nucleus')).toHaveCount(1);await expect(page.locator('.shared-nucleus .parent-chromosome')).toHaveCount(2);
 await expect(page.locator('.precursor-cell')).toContainText('Primary oocyte');
 await expect(page.locator('.ext-main')).not.toContainText('Repeat 1 of');await expect(page.locator('.ext-main')).toContainText('PATHWAY · 1 OF 2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.locator('.precursor-cell').screenshot({path:'test-results/egg-one-nucleus.png'});
 await page.locator('[data-act="mei-pair"]').click();await page.locator('[data-act="chromatid-0"]').click();await page.locator('[data-act="chromatid-1"]').click();
 await expect(page.locator('[data-act="chromatid-0"]')).toHaveAttribute('aria-pressed','false');
 await page.locator('[data-act="chromatid-2"]').click();await page.locator('[data-act="cut-2"]').click();
 await expect(page.locator('[data-act="mei-exchange"]')).toBeEnabled();await page.locator('[data-act="mei-exchange"]').click();
 await expect(page.locator('.shared-nucleus .moving-tail')).toHaveCount(2);
 await page.locator('[data-act="egg-side-1"]').click();await page.locator('[data-act="mei-first"]').click();
 await expect(page.locator('.shared-nucleus')).toHaveCount(0);await expect(page.locator('.daughter-cells')).toContainText('Secondary oocyte');
 await expect(page.locator('[data-act="pick-gamete-0"]')).toBeDisabled();await page.locator('[data-act="egg-resume"]').click();
 await page.locator('[data-act="pick-gamete-0"]').click();await expect(page.locator('[data-act="place-gamete-2"]')).toBeDisabled();await page.locator('[data-act="place-gamete-0"]').click();
 await page.reload();await expect(page.locator('[data-act="pick-gamete-0"]')).toBeDisabled();
 for(let i=1;i<4;i++){await page.locator(`[data-act="pick-gamete-${i}"]`).click();await page.locator(`[data-act="place-gamete-${i}"]`).click();}
 await expect(page.locator('.large-egg')).toHaveCount(1);await expect(page.locator('.polar-product')).toHaveCount(3);
 await expect(page.locator('[data-act="place-gamete-2"]')).toHaveClass(/large-egg/);
 await page.locator('.product-groups').screenshot({path:'test-results/egg-products.png'});
 await page.locator('[data-act="collect"]').click();await expect(page.locator('.precursor-cell')).toContainText('Primary spermatocyte');
 const c=extendedLabs.find(c=>c.kind==='meiosis');await finish(page,c);
 await expect(page.getByRole('heading',{name:'Egg and sperm pathways complete'})).toBeVisible();
 await page.getByRole('button',{name:'Analyze evidence',exact:true}).click();await expect(page.locator('.saved-products')).toHaveCount(2);
 await expect(page.locator('.saved-products').first()).toContainText('Egg');await expect(page.locator('.saved-products').last().locator('li')).toHaveCount(4);
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download observations CSV'}).click();const stream=await(await dl).createReadStream();let text='';for await(const part of stream)text+=part;expect(text).toContain('Polar body');expect(text).toContain('Sperm');
});

test('corn Punnett prediction gives feedback, persists and exports without changing observations',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/investigation.html?lab=inheritance-ratios');
 const panel=page.locator('.punnett-panel');await expect(panel).toBeVisible();await expect(panel.getByRole('button',{name:'Check my Punnett square'})).toBeDisabled();await fillRequiredPlan(page);
 await panel.getByRole('button',{name:'Check my Punnett square'}).click();await expect(panel.getByRole('status')).toContainText('Complete all four');
 for(const [i,v] of ['PP','Pp','Pp','PP'].entries())await panel.locator(`[data-punnett="${i}"]`).selectOption(v);
 await panel.getByRole('button').click();await expect(panel.getByRole('status')).toContainText('Recheck');
 await panel.locator('[data-punnett="3"]').selectOption('pp');
 await panel.locator('[data-punnett="purple"]').selectOption('2');await panel.locator('[data-punnett="yellow"]').selectOption('2');
 await panel.getByRole('button').click();await expect(panel.getByRole('status')).toContainText('genotype combinations are correct');
 await panel.locator('[data-punnett="purple"]').selectOption('3');await panel.locator('[data-punnett="yellow"]').selectOption('1');
 await panel.getByRole('button').click();await expect(panel.getByRole('status')).toContainText('36 purple and 12 yellow');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await panel.screenshot({path:'test-results/punnett-mobile.png'});
 await page.reload();await expect(panel.locator('[data-punnett="3"]')).toHaveValue('pp');await expect(panel.locator('[data-punnett="purple"]')).toHaveValue('3');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download lab report (.txt)',exact:true}).click();
 const stream=await(await download).createReadStream();let report='';for await(const chunk of stream)report+=chunk;
 expect(report).toContain('PP | Pp');expect(report).toContain('Purple outcomes out of 4: 3');
 const responses=page.waitForEvent('download');await page.locator('[data-report-action="json"]').click();
 const dataStream=await(await responses).createReadStream();let responseText='';for await(const chunk of dataStream)responseText+=chunk;
 const responseData=JSON.parse(responseText);
 expect(responseData.feedback.some(item=>item.corrected>0)).toBe(true);
 expect(responseData.data.feedbackHistory.length).toBeGreaterThan(1);

 await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();await expect(page.locator('.corn-rack')).toBeVisible();
 await page.getByRole('button',{name:'1. Predict and plan',exact:true}).click();await expect(panel.locator('[data-punnett="yellow"]')).toHaveValue('1');
});
