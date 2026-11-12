import {test,expect} from '@playwright/test';
test.use({hasTouch:true,isMobile:true,viewport:{width:390,height:844},reducedMotion:'reduce'});
test('touch selection and real touch dragging use the same extraction preparation gates',async({page,context})=>{
 await page.goto('/investigation.html?lab=dna-replication');
 await page.locator('[data-field="prediction"]').fill('Less material may be recovered without detergent.');
 await page.getByRole('button',{name:'Start extraction'}).tap();
 await page.locator('[data-tool="fruit"]').tap();await page.locator('[data-target="bag"]').tap();
 await expect(page.getByRole('heading',{name:'Break up the fruit'})).toBeVisible();
 await page.locator('[data-tool="masher"]').scrollIntoViewIfNeeded();
 const tool=await page.locator('[data-tool="masher"]').boundingBox(),bag=await page.locator('[data-target="bag"]').boundingBox();
 const session=await context.newCDPSession(page);
 const touch=(type,x,y)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 await touch('touchStart',tool.x+tool.width/2,tool.y+tool.height/2);
 for(const fraction of [.2,.8,.2])await touch('touchMove',bag.x+bag.width*fraction,bag.y+bag.height*.65);
 await touch('touchEnd');
 await expect(page.getByRole('heading',{name:'Add 9 mL water'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Add 9 mL water'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
