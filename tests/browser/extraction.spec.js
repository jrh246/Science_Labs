import {test,expect} from '@playwright/test';
const url='/investigation.html?lab=dna-replication';
const names=['Complete extraction','No detergent control','No fruit blank'];
async function begin(page){await page.goto(url);await page.locator('[data-field="prediction"]').fill('Without detergent, membranes may retain more DNA, so I expect less visible material.');await page.getByRole('button',{name:'Start extraction'}).click();}
async function use(page,tool,target){await page.locator(`[data-tool="${tool}"]`).click();await page.locator(`[data-target="${target}"]`).click();}
async function dragTo(page,tool,target){const a=await page.locator(`[data-tool="${tool}"]`).boundingBox(),b=await page.locator(`[data-target="${target}"]`).boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();await page.waitForTimeout(370);}
async function finishPreparation(page){
 await use(page,'fruit','bag');for(let i=0;i<3;i++)await use(page,'masher','bag');await use(page,'water','bag');await use(page,'salt','bag');
 await page.locator('[data-check="0"]').click();await use(page,'soap','bag');await use(page,'mix','bag');await use(page,'filter','tube');await use(page,'sample','funnel');
 await page.locator('[data-check="1"]').click();await use(page,'alcohol','tube');
}
async function evidence(page){for(let i=0;i<3;i++){await page.getByLabel(names[i]+' visibility score').selectOption(String([3,1,0][i]));await page.locator(`[data-note="${i}"]`).fill(['A pale clump and many strands at the interface.','Faint threads near the interface.','No visible strands.'][i]);}await page.locator('[data-field="claim"]').fill('The complete sample had more visible material than the no-detergent sample, consistent with disruption of membranes. The blank checks the reagents.');await page.locator('[data-field="limit"]').fill('The material is a crude mixture. Visibility is not a DNA concentration measurement.');}

test('extraction: drag fruit, move masher, gates, reload, comparisons, export and offline',async({page,context})=>{
 const errors=[];page.on('pageerror',x=>errors.push(x.message));await begin(page);
 await dragTo(page,'soap','bag');await expect(page.getByRole('heading',{name:'Move the fruit into the bag'})).toBeVisible();
 await dragTo(page,'fruit','bag');await expect(page.getByRole('heading',{name:'Break up the fruit'})).toBeVisible();
 const masher=await page.locator('[data-tool="masher"]').boundingBox(),bag=await page.locator('[data-target="bag"]').boundingBox();
 await page.mouse.move(masher.x+masher.width/2,masher.y+masher.height/2);await page.mouse.down();for(const fraction of [.3,.7,.3])await page.mouse.move(bag.x+bag.width*fraction,bag.y+bag.height*.6,{steps:8});await page.mouse.up();await page.waitForTimeout(370);
 await expect(page.getByRole('heading',{name:'Add 9 mL water'})).toBeVisible();await use(page,'water','bag');await use(page,'salt','bag');
 await page.locator('[data-check="1"]').click();await expect(page.locator('[data-tool="soap"]')).toBeDisabled();await expect(page.getByRole('heading',{name:'Stop and think: before detergent'})).toBeVisible();await page.locator('[data-check="0"]').click();await use(page,'soap','bag');await page.reload();await expect(page.getByRole('heading',{name:'Gently mix the contents'})).toBeVisible();
 await use(page,'mix','bag');await use(page,'filter','tube');await dragTo(page,'sample','funnel');await page.locator('[data-check="1"]').click();await use(page,'alcohol','tube');
 await expect(page.getByRole('button',{name:'Compare the controls'})).toBeDisabled();await page.getByRole('button',{name:'Watch separation'}).click();await expect(page.locator('.dna-clock strong')).not.toHaveText('0:00');await page.reload();await expect(page.getByRole('button',{name:'Watch separation'})).toBeVisible();
 await page.getByRole('button',{name:'Advance to 5:00'}).click();await page.screenshot({path:'test-results/dna-bench-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Compare the controls'}).click();await expect(page.locator('.dna-sample')).toHaveCount(3);await expect(page.getByRole('button',{name:'Save completed explanation'})).toBeDisabled();await evidence(page);await page.getByRole('button',{name:'Save completed explanation'}).click();await expect(page.locator('#lab-complete-feedback')).toContainText('Saved just now');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download responses (JSON)',exact:true}).click();const stream=await(await download).createReadStream();let report='';for await(const part of stream)report+=part;const data=JSON.parse(report);expect(data.status).toBe('Complete');expect(data.observations[2]).toMatchObject({condition:'No fruit blank',source:'virtual',score:0});
 await page.screenshot({path:'test-results/dna-comparison-desktop.png',fullPage:true});
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});await context.setOffline(true);await page.reload();await expect(page.getByRole('button',{name:'Work saved as complete'})).toBeVisible();await expect(page.locator('[data-field="claim"]')).toContainText('membranes');expect(errors).toEqual([]);
});

test('extraction: keyboard access, student scoring, mixed source and legacy work',async({page})=>{
 await page.goto(url);await page.evaluate(()=>localStorage.setItem('science-labs:/:dna-replication:original-v1','{"prediction":"earlier work"}'));await page.reload();await expect(page.getByRole('button',{name:'Download earlier work'})).toBeVisible();
 await page.locator('[data-field="prediction"]').fill('I expect fewer strands without detergent.');await page.getByRole('button',{name:'Start extraction'}).click();
 await page.locator('[data-tool="fruit"]').focus();await page.keyboard.press('Enter');await page.locator('[data-target="bag"]').focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Break up the fruit'})).toBeVisible();
 for(let i=0;i<3;i++)await use(page,'masher','bag');await use(page,'water','bag');await use(page,'salt','bag');await page.locator('[data-check="0"]').click();await use(page,'soap','bag');await use(page,'mix','bag');await use(page,'filter','tube');await use(page,'sample','funnel');await page.locator('[data-check="1"]').click();await use(page,'alcohol','tube');await page.getByRole('button',{name:'Advance to 5:00'}).click();await page.getByRole('button',{name:'Compare the controls'}).click();
 await evidence(page);await page.getByLabel('Complete extraction source').selectOption('classroom');await expect(page.locator('.dna-sample').first().locator('.dna-sample-art')).toHaveCount(0);await expect(page.getByLabel('Complete extraction visibility score')).toHaveValue('');await page.getByLabel('Complete extraction visibility score').selectOption('0');await page.locator('[data-note="0"]').fill('Unexpected: no strands in our classroom tube.');await page.getByRole('button',{name:'Save completed explanation'}).click();await expect(page.locator('#lab-complete-feedback')).toContainText('Saved just now');
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Download observations CSV'}).click();const stream=await(await dl).createReadStream();let text='';for await(const part of stream)text+=part;expect(text).toContain('"Complete extraction","classroom","0"');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset activity'}).click();await expect(page.locator('[data-field="prediction"]')).toHaveValue('');expect(await page.evaluate(()=>localStorage.getItem('science-labs:/:dna-replication:original-v1'))).toContain('earlier work');
});

test('extraction: classroom entry does not require virtual preparation',async({page})=>{
 await page.goto(url);await page.locator('[data-field="prediction"]').fill('The complete mixture should recover more material.');await page.getByRole('button',{name:'Use classroom observations'}).click();await expect(page.locator('.dna-sample-art')).toHaveCount(0);await expect(page.locator('.dna-classroom-placeholder')).toHaveCount(3);await evidence(page);await page.getByRole('button',{name:'Save completed explanation'}).click();await page.reload();await expect(page.getByRole('button',{name:'Work saved as complete'})).toBeVisible();
});

for(const width of [390,768,1440])test(`extraction: responsive workspace and comparison at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});await begin(page);await page.screenshot({path:`test-results/dna-start-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await finishPreparation(page);await page.getByRole('button',{name:'Advance to 5:00'}).click();await page.getByRole('button',{name:'Compare the controls'}).click();await page.screenshot({path:`test-results/dna-compare-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
