import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {reportAttempt} from '../fixtures/report-attempts.js';
import {extendedById} from '../../src/investigations/extended-content.js';
import {gelLanes,benchSites} from '../../src/investigations/bench-geometry.js';
import {fillRequiredPlan} from './planning-helpers.js';

test.use({hasTouch:true});
async function fixture(page,f){
 await page.addInitScript(({key,value})=>{if(!sessionStorage.getItem('audit-seeded')){localStorage.setItem(key,JSON.stringify(value));sessionStorage.setItem('audit-seeded','true');}},{key:f.key,value:f.storageValue});
 await page.goto(f.url);
}
test('osmosis records original prediction, requires reasoning, and saves truthful named exports offline',async({page,context})=>{
 await page.goto('/lab.html');await expect(page.getByRole('button',{name:'Begin Lab'})).toBeDisabled();
 await page.locator('#osmosis-prediction').fill('My initial prediction.');await page.getByRole('button',{name:'Begin Lab'}).click();
 let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state);
 expect(state.initialPrediction.text).toBe('My initial prediction.');expect(state.initialPrediction.timing).toBe('before-experiment');
 const f=reportAttempt('osmosis-homeostasis',true);f.state.prediction=state.prediction;f.state.initialPrediction=state.initialPrediction;f.state.complete=false;f.state.reasoning=Object.fromEntries(Object.keys(f.state.reasoning).map(key=>[key,'']));
 await page.evaluate(value=>localStorage.setItem('cell-lab',JSON.stringify(value)),f.storageValue);await page.reload();
 const complete=page.locator('[data-action="complete"]');await expect(complete).toBeDisabled();
 for(const field of await page.locator('[data-reasoning]').all())await field.fill('My evidence stays verbatim <A/D> — water moves both ways.');
 await page.getByLabel('Name (optional)',{exact:true}).fill('Zoë García');await complete.click();await expect(page.locator('#lab-complete-feedback')).toContainText('Saved just now');
 await page.locator('.tube-inspection [data-select="E"]').click();await expect(page.locator('[data-direction="out"]')).toBeVisible();
 await page.locator('.tube-inspection [data-select="A"]').click();await expect(page.locator('[data-direction="balanced"]')).toBeVisible();
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('Denied');};});
 await complete.click();await expect(page.locator('#lab-complete-feedback')).toContainText('could not be saved');
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});await complete.click();await page.reload();
 await expect(complete).toHaveText('Work saved as complete');
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);await context.setOffline(true);
 const download=page.waitForEvent('download');await page.locator('[data-report-action="pdf"]').click();const file=await download;
 expect(file.suggestedFilename()).toBe('osmosis-homeostasis-Zoë-García-lab-report.pdf');await file.saveAs('tmp/aud05-07/osmosis-reasoning-complete.pdf');
 await page.locator('[data-reasoning]').first().fill('Revised explanation.');await expect(complete).toHaveText('Save completed explanation');
});

test('earlier osmosis results reopen with masses intact and no invented earlier prediction',async({page})=>{
 const f=reportAttempt('osmosis-homeostasis',true);for(const key of ['prediction','initialPrediction','learningVersion','reasoning'])delete f.state[key];
 await fixture(page,f);await expect(page.getByRole('heading',{name:'Your results',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cell-lab')).state.run)).toEqual(f.state.run);
 for(const field of await page.locator('[data-reasoning]').all())await field.fill('Explain the earlier mass evidence.');
 await page.locator('[data-action="complete"]').click();await expect(page.locator('#lab-complete-feedback')).toContainText('Saved just now');
 const event=page.waitForEvent('download');await page.locator('[data-report-action="json"]').click();const file=await event;
 const json=JSON.parse(await fs.readFile(await file.path(),'utf8'));expect(json.prediction.initial).toBeNull();expect(json.prediction.unrecorded).toBe(true);
});

for(const id of ['cell-microscopy','enzyme-activity','cell-signaling','linked-genes','dna-protein','lac-operon','gel-electrophoresis']){
 for(const width of [1440,390])test(`${id} work sites and drag/select/keyboard at ${width}px`,async({page,context})=>{
  const c=extendedById[id];await page.setViewportSize({width,height:950});await page.goto('/investigation.html?lab='+id);await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations',exact:true}).click();
  const stage=page.locator('.bench-stage');await stage.screenshot({path:`tmp/aud05-07/${id}-initial-${width}.png`});
  for(let i=0;i<c.steps.length;i++){
   const tool=page.locator(`[data-act="tool-${i}"]`);await tool.scrollIntoViewIfNeeded();
   if(i===0){
    const source=await tool.boundingBox(),target=await page.locator('.bench-target').boundingBox();
    const from={x:source.x+source.width/2,y:source.y+source.height/2},to={x:target.x+target.width/2,y:target.y+target.height/2};
    if(width===390){const session=await context.newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});for(let j=1;j<=8;j++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*j/8,y:from.y+(to.y-from.y)*j/8}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();}
    else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();}
   }else{
    await tool.focus();await page.keyboard.press('Enter');
    if(c.kind==='gel'&&i===1){
     const sites=await page.locator('.gel-loading button').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,width:r.width};}));
     const bounds=await stage.boundingBox();sites.forEach((site,j)=>{expect(Math.abs(site.x-(bounds.x+bounds.width*gelLanes[j].x/600))).toBeLessThan(1);expect(site.width).toBeGreaterThanOrEqual(44);if(j)expect(site.x-sites[j-1].x).toBeGreaterThanOrEqual(44);});
     await stage.screenshot({path:`tmp/aud05-07/${id}-intermediate-${width}.png`});
     for(let lane=0;lane<4;lane++){await page.locator(`[data-act="lane-${lane}"]`).tap();await expect(page.locator(`[data-act="lane-${lane}"]`)).toBeDisabled();}
    }else{await expect(page.locator('.bench-target')).toBeFocused();await page.keyboard.press('Enter');}
   }
   await expect(page.locator('.bench-procedure li').nth(i)).toHaveClass('done');
   if(i===0){await stage.screenshot({path:`tmp/aud05-07/${id}-intermediate-${width}.png`});await page.reload();}
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  if(c.kind==='microscope'){
   await page.locator('[data-control="objective"]').selectOption('40');await expect(page.locator('[data-act="collect"]')).toBeDisabled();
   await page.locator('[data-calibration]').fill('20');await page.locator('[data-act="calibrate"]').click();await expect(page.locator('.ext-calibration [role="status"]')).toContainText('Try again');
   await page.locator('[data-calibration]').fill('2');await page.locator('[data-act="calibrate"]').click();await expect(page.locator('.success')).toContainText('Correct!');
   await page.locator('[data-control="ruler"]').press('ArrowRight');await expect(page.locator('[data-act="collect"]')).toBeEnabled();
  }else if(c.duration){await page.locator('[data-act="finish"]').click();if(c.kind==='gel')await page.locator('[data-act="stain"]').click();if(['expression','regulation'].includes(c.kind))await page.locator('[data-act="viewer"]').click();}
  if(c.kind==='flies'){await page.locator('.fly-magnifier').scrollIntoViewIfNeeded();const lens=await page.locator('.fly-magnifier').boundingBox(),tally=await page.locator('.bench-tallies').boundingBox();expect(tally.y).toBeGreaterThanOrEqual(lens.y+lens.height);}
  const work=c.kind==='flies'?page.locator('.population-workspace'):stage;
  await (await work.count()?work:page.locator('.ext-workspace')).screenshot({path:`tmp/aud05-07/${id}-final-${width}.png`});
  await page.reload();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('svg').evaluateAll(nodes=>nodes.some(n=>n.outerHTML.includes('${')))).toBe(false);
 });
}
