import {test,expect} from '@playwright/test';
test('classroom fermentation handouts are available from both entry points and offline',async({page,context})=>{
 for(const route of ['/#/science/biology/the-cell/yeast-fermentation','/investigation.html?lab=yeast-fermentation']){
  await page.goto(route);await expect(page.getByRole('heading',{name:'Classroom lab options'})).toBeVisible();
  for(const kind of ['worksheet','teacher-guide']){
   const link=page.locator(`a[href="./resources/yeast-fermentation-classroom-${kind}.pdf"]`);await expect(link).toBeVisible();
   const r=await page.request.get(await link.getAttribute('href'));expect(r.ok()).toBeTruthy();expect((await r.body()).subarray(0,4).toString()).toBe('%PDF');
  }
 }
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/classroom-resources-mobile.png',fullPage:true});
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await context.setOffline(true);
 for(const kind of ['worksheet','teacher-guide'])expect(await page.evaluate(async k=>(await (await fetch(`./resources/yeast-fermentation-classroom-${k}.pdf`)).text()).slice(0,4),kind)).toBe('%PDF');
});
