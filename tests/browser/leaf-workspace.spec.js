import {test,expect} from '@playwright/test';
test('legacy classroom settings can open the lamp without overwriting classroom work',async({page})=>{
 await page.goto('/investigation.html?lab=light-photosynthesis');
 const key=await page.evaluate(()=>{
  const key=Object.keys(localStorage).find(k=>k.includes(':light-photosynthesis:v1:'));
  const state=JSON.parse(localStorage.getItem(key));state.sources=['classroom','classroom','classroom'];state.step=1;
  state.notes.prediction='My original prediction';state.runs['dark-1']=Array.from({length:11},(_,i)=>({time:i*2,value:2}));
  localStorage.setItem(key,JSON.stringify(state));return key;
 });
 await page.reload();await expect(page.getByText('Saved classroom settings are active',{exact:true})).toBeVisible();
 const original=await page.evaluate(key=>localStorage.getItem(key),key);
 await page.getByRole('link',{name:'Open interactive lamp',exact:true}).click();
 await expect(page.locator('leaf-simulator').getByRole('heading',{name:'Control the lamp'})).toBeVisible();
 await page.getByRole('button',{name:'Pull plunger',exact:true}).click();
 expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(original);
 await page.getByRole('link',{name:'Return to saved lab'}).click();
 await expect(page.getByRole('spinbutton',{name:'Reading at 0 minutes',exact:true})).toHaveValue('2');
 await page.getByRole('button',{name:'1. Predict & plan',exact:true}).click();
 await expect(page.getByLabel('Prediction — what do you expect, and why?')).toHaveValue('My original prediction');
});
