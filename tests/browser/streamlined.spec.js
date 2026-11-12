import {fillRequiredPlan} from './planning-helpers.js';
import {test,expect} from '@playwright/test';

for(const id of ['enzyme-activity','cell-signaling','dna-protein','gel-electrophoresis'])test(`${id}: shorter workflow preserves earlier multi-trial work`,async({page})=>{
 const oldKey=`science-labs:/:${id}:original-v1`,oldWork={version:1,records:[{condition:'Earlier sample',values:[12],source:'classroom'}],prediction:'Keep my earlier explanation'};
 await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:oldKey,value:JSON.stringify(oldWork)});
 await page.goto(`/investigation.html?lab=${id}`);
 await expect(page.locator('.learning-purpose')).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download earlier multi-trial work'}).click();
 const stream=await(await download).createReadStream();let raw='';for await(const part of stream)raw+=part;expect(JSON.parse(raw)).toEqual(oldWork);
 await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 await expect(page.locator('[data-act="collect"]')).toBeDisabled();
 await expect(page.locator('[data-act="reuse-setup"]')).toHaveCount(0);
 await page.reload();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),oldKey)).toEqual(oldWork);
 const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key.replace('original-v1','streamlined-v2'))),oldKey);
 expect(state.records).toEqual([]);
});

test('Sordaria reuses microscope setup but requires a second set of classifications',async({page})=>{
 await page.goto('/investigation.html?lab=sordaria-crossing-over');
 await fillRequiredPlan(page);await page.getByRole('button',{name:'Begin observations'}).click();
 for(let i=0;i<3;i++)await page.locator(`[data-act="prepare-${i}"]`).click();
 for(let i=0;i<12;i++)await page.locator('[data-act="score-0"]').click();
 await page.locator('[data-act="review"]').click();await page.locator('[data-act="collect"]').click();
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-act="reuse-setup"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('.ext-count')).toContainText('0 classified');
 await expect(page.locator('[data-act="review"]')).toBeDisabled();
 await expect(page.locator('[data-act="collect"]')).toBeDisabled();
 await page.reload();await expect(page.locator('.preparation-source')).toBeVisible();
 for(let i=0;i<12;i++)await page.locator('[data-act="score-1"]').click();
 await page.locator('[data-act="review"]').click();await page.locator('[data-act="collect"]').click();
 await page.getByRole('button',{name:'Analyze evidence',exact:true}).click();
 await expect(page.locator('.sample-comparison li')).toHaveCount(2);
 await expect(page.locator('.sample-comparison')).toContainText('0.0%');
 await expect(page.locator('.sample-comparison')).toContainText('100.0%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/streamlined-sampling-mobile.png',fullPage:true});
});
