import {test,expect} from '@playwright/test';

test('preview genetics preserves production work and generates PDFs offline',async({page,context})=>{
 // Production may still contain only the original osmosis lab.
 await page.goto('/Science_Labs/');
 const productionLab=await page.getByRole('button',{name:'Begin Lab'}).count()?'/Science_Labs/':'/Science_Labs/lab.html';
 if(productionLab!=='/Science_Labs/')await page.goto(productionLab);
 await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/Science_Labs/sw.js'));
 if(await page.locator('#osmosis-prediction').count())await page.locator('#osmosis-prediction').fill('Water moves toward a higher sugar concentration.');
 await page.getByRole('button',{name:'Begin Lab'}).click();
 const productionWork=await page.evaluate(()=>localStorage.getItem('cell-lab'));
 expect(productionWork).not.toBeNull();
 const previewPath='/Science_Labs/dev/investigation.html?lab=genetic-information&mode=classroom';
 await page.goto(previewPath);
 await expect(page.locator('.gi-badge')).toHaveText('VIRTUAL ONLY');
 await expect(page.locator('[data-writing="prediction"]')).toHaveValue('');
 await page.locator('[data-writing="prediction"]').fill('Preview prediction');
 await page.locator('[data-gi-action="next"]').click();
 await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/Science_Labs/dev/sw.js'));
 const previewKeys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('genetic-information')));
 expect(previewKeys).toHaveLength(1);
 expect(previewKeys[0]).toContain('/Science_Labs/dev/');
 await context.setOffline(true);
 await page.reload();
 await page.locator('[data-gi-action="location"][data-value="nucleus"]').click();
 const event=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download report (PDF)',exact:true}).click();
 const download=await event;
 expect(download.suggestedFilename()).toBe('genetic-information-lab-report.pdf');
 const stream=await download.createReadStream(),chunks=[];
 for await(const chunk of stream)chunks.push(chunk);
 expect(Buffer.concat(chunks).subarray(0,5).toString()).toBe('%PDF-');
 await page.goto(productionLab);
 await expect(page.getByRole('heading',{name:'Prepare the beakers'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('cell-lab'))).toBe(productionWork);
 await page.goto(previewPath);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).prediction,previewKeys[0])).toBe('Preview prediction');
});
