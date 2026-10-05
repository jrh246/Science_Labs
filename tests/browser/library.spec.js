import {test,expect} from '@playwright/test';
test('navigate from landing through units to the working lab and back',async({page})=>{
 await page.goto('/');await page.getByRole('link',{name:'Explore science →',exact:true}).click();
 await page.getByRole('link',{name:'Explore biology →',exact:true}).click();
 await expect(page.locator('.grid .card')).toHaveCount(8);
 await page.getByRole('link',{name:'The Cell',exact:true}).click();
 await expect(page.locator('.lab-card')).toHaveCount(7);
 await page.getByRole('link',{name:'Osmosis and Cell Homeostasis',exact:true}).click();
 await page.getByRole('link',{name:'Launch virtual lab'}).click();
 await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
 await page.getByRole('button',{name:'Begin Lab'}).click();
 await page.getByRole('link',{name:'Back to lab overview'}).click();
 await page.getByRole('link',{name:'Launch virtual lab'}).click();
 await expect(page.getByRole('heading',{name:'Prepare the beakers'})).toBeVisible();
});
test('search, shareable results, planned details, empty results, and unknown routes',async({page})=>{
 await page.goto('/');await page.getByLabel('Search the library',{exact:true}).fill('enzyme');
 await page.getByRole('button',{name:'Submit library search'}).click();
 await expect(page.locator('.lab-card')).toHaveCount(1);await page.reload();
 await page.getByRole('link',{name:'What Affects Enzyme Activity?',exact:true}).click();
 await expect(page.getByText('An investigation in the making')).toBeVisible();
 await expect(page.getByRole('link',{name:'Launch virtual lab'})).toHaveCount(0);
 await page.goto('/#/search?q=&available=1');await expect(page.locator('.lab-card')).toHaveCount(1);
 await page.goto('/#/search?q=unfindable');await expect(page.getByRole('heading',{name:'No matching investigations'})).toBeVisible();
 await page.goto('/#/science/biology/missing');await expect(page.getByRole('heading',{name:'That page isn’t in the library.'})).toBeVisible();
});
test('catalog and lab stay separate after offline navigation',async({page,context})=>{
 await page.goto('/lab.html');await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await page.goto('/#/science/biology');await context.setOffline(true);await page.reload();
 await expect(page.getByRole('heading',{name:'Investigate living things.'})).toBeVisible();
 await page.goto('/lab.html');await expect(page.getByRole('button',{name:'Begin Lab'})).toBeVisible();
});
for(const width of [390,768,1440])test(`library layout at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});await page.goto('/');
 await expect(page.getByRole('heading',{name:'Big questions. Real discoveries.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:`test-results/library-${width}.png`,fullPage:true});
 await page.goto('/#/science/biology');await expect(page.locator('.grid .card')).toHaveCount(8);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
