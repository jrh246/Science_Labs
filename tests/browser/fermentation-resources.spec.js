import {test,expect} from '@playwright/test';
test('three classroom methods offer distinct PDFs and leave the virtual gas syringe unchanged',async({page,context})=>{
 for(const route of ['/#/science/biology/the-cell/yeast-fermentation','/investigation.html?lab=yeast-fermentation']){
  await page.goto(route);const chooser=page.locator('fermentation-downloads');await expect(chooser.getByRole('heading',{name:'Classroom lab options'})).toBeVisible();
  for(const method of ['balloon','cylinder','syringe']){
   await chooser.getByLabel('Classroom collection method').selectOption(method);
   for(const kind of ['worksheet','teacher-guide']){
    const path=`./resources/yeast-fermentation-${method}-${kind}.pdf`;await expect(chooser.locator(`a[href="${path}"]`)).toBeVisible();
    const r=await page.request.get(path);expect(r.ok()).toBeTruthy();expect((await r.body()).subarray(0,4).toString()).toBe('%PDF');
   }
  }
 }
 await page.setViewportSize({width:390,height:844});await page.getByLabel('Classroom collection method').selectOption('cylinder');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/classroom-methods-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await expect(page.locator('yeast-simulator')).toBeVisible();await expect(page.locator('yeast-simulator')).toContainText('gas syringe');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);
 for(const method of ['balloon','cylinder','syringe'])for(const kind of ['worksheet','teacher-guide'])expect(await page.evaluate(async path=>(await (await fetch(path)).text()).slice(0,4),`./resources/yeast-fermentation-${method}-${kind}.pdf`)).toBe('%PDF');
});
