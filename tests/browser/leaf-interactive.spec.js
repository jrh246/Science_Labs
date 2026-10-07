import {test,expect} from '@playwright/test';
async function prep(page){for(let n=0;n<3;n++){await page.getByRole('button',{name:'Pull plunger',exact:true}).click();await page.getByRole('button',{name:'Release vacuum',exact:true}).click();}}
test('lamp and running timer affect disks, pause, persist, and keep exploration out of comparison',async({page})=>{
 await page.goto('/investigation.html?lab=light-photosynthesis');
 await expect(page.getByRole('heading',{name:'Why do we infiltrate the leaf disks?'})).toBeVisible();
 await page.getByRole('button',{name:'2. Collect observations',exact:true}).click();await page.locator('#condition').selectOption('2');
 const sim=page.locator('leaf-simulator');await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/10 of 10/);await prep(page);
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/0 of 10/);
 await sim.getByRole('button',{name:'Start trial',exact:true}).click();
 await expect(sim.locator('#clock')).not.toHaveText('00:00');
 await sim.getByRole('button',{name:'Pause timer',exact:true}).click();const paused=await sim.locator('#clock').textContent();
 await page.waitForTimeout(400);await expect(sim.locator('#clock')).toHaveText(paused);
 await sim.getByRole('button',{name:'Run remaining time'}).click();await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/10 of 10/);
 await sim.getByRole('button',{name:'Off',exact:true}).click();await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/Lamp at 0%.*10 of 10/);
 for(let i=0;i<15;i++)await sim.getByRole('button',{name:'Advance 2 minutes'}).click();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/0 of 10/);await expect(sim.locator('#quality')).toContainText('Exploratory');
 await expect(page.locator('.progress-list')).toContainText('Bright light: 0/3');
 await page.reload();await page.locator('#condition').selectOption('2');await expect(sim.locator('#clock')).toHaveText('50:00');await expect(sim.getByRole('button',{name:'Resume timer'})).toBeVisible();
 await sim.getByRole('button',{name:'High',exact:true}).click();for(let i=0;i<10;i++)await sim.getByRole('button',{name:'Advance 2 minutes'}).click();
 await expect(sim.locator('#scene svg')).toHaveAttribute('aria-label',/10 of 10/);
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/leaf-interactive-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/leaf-interactive-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'3. Analyze & explain'}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download data (CSV)'}).click();const file=await download;const stream=await file.createReadStream();let text='';for await(const chunk of stream)text+=chunk;expect(text).toContain('exploratory');expect(text).toContain('lamp change');
});
