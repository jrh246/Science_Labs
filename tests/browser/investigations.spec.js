import {test,expect} from '@playwright/test';
import {fieldCells} from '../../src/investigations/model.js';
const ids=['light-photosynthesis','yeast-fermentation','mitosis'];
async function open(page,id){await page.goto('/investigation.html?lab='+id);}
async function prepareLeaf(page){if(await page.locator('leaf-simulator').count()){for(let n=0;n<3;n++){await page.getByRole('button',{name:'Pull plunger',exact:true}).click();await page.getByRole('button',{name:'Release vacuum',exact:true}).click();}await page.getByRole('button',{name:'Add disks to cup',exact:true}).click();}}
async function finishTrials(page){
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 if(await page.locator('leaf-simulator').count()){for(const light of ['Off','Low','High'])for(let t=0;t<3;t++){await prepareLeaf(page);await page.getByRole('button',{name:light,exact:true}).click();await page.getByRole('button',{name:'Start trial',exact:true}).click();await page.getByRole('button',{name:'Run remaining time'}).click();await page.getByRole('button',{name:'Collect data and continue'}).click();}return;}
 for(const fuel of ['No added sugar','Glucose','Sucrose'])for(let trial=1;trial<=3;trial++){const sim=page.locator('yeast-simulator');await sim.getByRole('button',{name:fuel,exact:true}).click();await sim.getByRole('button',{name:'Prepare mixture',exact:true}).click();await sim.getByRole('button',{name:'Connect gas syringe',exact:true}).click();await sim.getByRole('button',{name:'Start trial',exact:true}).click();await sim.getByRole('button',{name:'Run remaining time'}).click();await sim.getByRole('button',{name:'Collect data and continue'}).click();}
}
for(const id of ids.slice(0,2))test(`${id}: complete virtual investigation, restore, and export`,async({page})=>{
 await open(page,id);
 await page.getByLabel('Prediction — what do you expect, and why?').fill('I predict a response to the treatment.');
 await page.getByLabel('Investigation design — variables, controls, or sampling plan').fill('Match all other variables and repeat three times.');
 await finishTrials(page);await page.reload();
 await page.getByRole('button',{name:'Analyze evidence →'}).click();
 await expect(page.locator('.screen-work table tbody tr')).toHaveCount(3);
 for(let i=0;i<4;i++)await page.locator(`[data-note="answer-${i}"]`).fill('Evidence from the trials supports this explanation, with model limitations.');
 await page.getByRole('button',{name:'Mark work complete'}).click();await expect(page.getByRole('status')).toContainText('marked complete');
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();
 const file=await downloaded;expect(file.suggestedFilename()).toBe(id+'-data.csv');
 const stream=await file.createReadStream();let text='';for await(const chunk of stream)text+=chunk;
 expect(text).toContain('virtual');expect(text).toContain('"3"');
 await page.screenshot({path:`test-results/${id}-analysis.png`,fullPage:true});
});
test('photosynthesis hides teacher setup while existing hybrid links retain classroom data and labels',async({page})=>{
 await open(page,'light-photosynthesis');
 await expect(page.getByRole('heading',{name:'Teacher setup',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Create assignment link'})).toHaveCount(0);
 const link='/investigation.html?lab=light-photosynthesis&sources=classroom,virtual,virtual';
 await page.goto(link);await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 for(let t=1;t<=3;t++){
  for(let time=0;time<=20;time+=2)await page.getByRole('spinbutton',{name:`Reading at ${time} minutes`,exact:true}).fill('0');
  await page.getByRole('button',{name:'Save classroom trial'}).click();
 }
 for(const light of ['Low','High'])for(let t=1;t<=3;t++){await prepareLeaf(page);await page.getByRole('button',{name:light,exact:true}).click();await page.getByRole('button',{name:'Start trial',exact:true}).click();await page.getByRole('button',{name:'Run remaining time'}).click();await page.getByRole('button',{name:'Collect data and continue'}).click();}
 await page.getByRole('button',{name:'Analyze evidence →'}).click();
 await expect(page.locator('.screen-work table')).toContainText('classroom');
 await expect(page.locator('.screen-work table')).toContainText('Not reached by 20 min');
 await page.reload();await expect(page.locator('.screen-work table')).toContainText('classroom');
});
test('mitosis supports classification feedback, manual fields, and duration changes',async({page})=>{
 await page.goto('/investigation.html?lab=mitosis&sources=virtual,classroom');
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();
 const seed=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.includes(':mitosis:v1:virtual,classroom'));return JSON.parse(localStorage.getItem(key)).seed;});
 await page.getByRole('button',{name:'Load prepared slide'}).click();await page.getByRole('button',{name:'Turn light on'}).click();await page.getByRole('slider',{name:'Fine focus',exact:true}).fill('50');await page.getByRole('button',{name:'40× objective',exact:true}).click();
 const cells=fieldCells('field-a',seed);
 for(let i=0;i<20;i++){await page.locator(`[data-cell="${i}"]`).click();await page.locator(`[data-stage="${cells[i]}"]`).click();}
 await page.getByRole('button',{name:'Review field classifications'}).click();
 await expect(page.getByText('20 / 20 match the model key.',{exact:false})).toBeVisible();
 await page.screenshot({path:'test-results/mitosis-field.png',fullPage:true});
 await page.getByRole('button',{name:'Collect data and continue'}).click();
 for(let i=0;i<5;i++)await page.locator(`[name="stage-${i}"]`).fill(i===0?'16':'1');
 await page.getByRole('button',{name:'Save field count'}).click();
 await page.getByRole('button',{name:'Analyze evidence →'}).click();
 await expect(page.locator('.screen-work table')).toContainText('40 cells');
 await expect(page.locator('.screen-work table tbody tr').first()).toContainText('18.00');
 await page.locator('#cycle-hours').fill('12');await page.locator('#cycle-hours').press('Tab');
 await expect(page.locator('.screen-work table tbody tr').first()).toContainText('9.00');
 await page.reload();await expect(page.locator('#cycle-hours')).toHaveValue('12');
});
test('six PDFs are linked and downloadable; lab routes work offline without cross-lab progress',async({page,context})=>{
 for(const id of ids){await open(page,id);for(const kind of ['worksheet','teacher-guide']){
  const response=await page.request.get(`/resources/${id}-${kind}.pdf`);expect(response.ok()).toBeTruthy();expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');
  await expect(page.locator(`a[href="./resources/${id}-${kind}.pdf"]`)).toBeVisible();
 }}
 await open(page,ids[0]);await page.getByLabel('Prediction — what do you expect, and why?').fill('Saved leaf prediction');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
 await context.setOffline(true);
 await open(page,ids[1]);await expect(page.getByLabel('Prediction — what do you expect, and why?')).toHaveValue('');
 await page.reload();await expect(page.getByRole('heading',{name:'Yeast Fermentation and Fuel Sources',exact:true})).toBeVisible();
 await open(page,ids[0]);await expect(page.getByLabel('Prediction — what do you expect, and why?')).toHaveValue('Saved leaf prediction');
 const bytes=await page.evaluate(async()=>{const r=await fetch('./resources/light-photosynthesis-worksheet.pdf');return (await r.text()).slice(0,4);});expect(bytes).toBe('%PDF');
});
test('new lab overviews expose the right launch link and resources',async({page})=>{
 for(const id of ids){await page.goto(`/#/science/biology/the-cell/${id}`);await expect(page.getByRole('link',{name:id==='mitosis'?'Launch investigation':'Launch virtual lab'})).toHaveAttribute('href',`./investigation.html?lab=${id}`);await expect(page.getByRole('link',{name:'Student worksheet (PDF)',exact:true})).toBeVisible();}
});
for(const width of [390,1440])test(`new lab layouts ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});
 for(const id of ids){await open(page,id);await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/${id}-${width}.png`,fullPage:true});}
});
