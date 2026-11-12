import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {reportAttempt,reportLabIds} from '../fixtures/report-attempts.js';

test.use({timezoneId:'America/Los_Angeles'});
async function download(page,path,filename){
 const event=page.waitForEvent('download');await page.locator('[data-report-action="pdf"]').click();const file=await event;
 expect(file.suggestedFilename()).toBe(filename);await file.saveAs(path);expect((await fs.readFile(path)).subarray(0,5).toString()).toBe('%PDF-');await expect(page.locator('.student-report-status')).toContainText('PDF report downloaded');
}
async function seed(page,f){
 // Seed after the old page's pagehide handler has saved its current attempt.
 await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:f.key,value:f.storageValue});await page.reload();
}
async function installFixture(page,f){
 await page.addInitScript(({key,value})=>{if(!sessionStorage.getItem('report-fixture-ready')){localStorage.setItem(key,JSON.stringify(value));sessionStorage.setItem('report-fixture-ready','true');}},{key:f.key,value:f.storageValue});await page.goto(f.url);
}
async function printReport(page){await page.evaluate(()=>{window.print=()=>window.dispatchEvent(new Event('beforeprint'));});await page.locator('[data-report-action="print"]').click();await page.emulateMedia({media:'print'});await expect(page.locator('#app')).toBeHidden();await expect(page.locator('#student-report-print')).toBeVisible();await expect(page.locator('html')).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('#student-report-print h2').first()).toHaveCSS('letter-spacing','normal');}

for(const id of reportLabIds)test(`${id}: draft and named complete PDF, first export offline, and student-only printing`,async({page,context})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));const partial=reportAttempt(id);await installFixture(page,partial);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);await context.setOffline(true);await page.reload();
 // The generator and fonts have never been imported by the page before this offline export.
 await download(page,`tmp/aud02/${id}-draft.pdf`,`${id}-lab-report.pdf`);
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await expect(page.locator('#student-report-print')).toContainText('Status: In progress');await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.getByLabel('Name (optional)',{exact:true}).fill('Zoë García');await page.getByLabel('Class / period (optional)',{exact:true}).fill('Period 3');await page.reload();await expect(page.getByLabel('Name (optional)',{exact:true})).toHaveValue('Zoë García');
 const complete=reportAttempt(id,true);complete.state.studentName='Zoë García';complete.state.studentClass='Period 3';await seed(page,complete);await expect(page.getByLabel('Class / period (optional)',{exact:true})).toHaveValue('Period 3');
 await download(page,`tmp/aud02/${id}-complete.pdf`,`${id}-Zoë-García-lab-report.pdf`);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 if(id!=='osmosis-homeostasis'){
  const textEvent=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download lab report (.txt)',exact:true}).click();
  const file=await textEvent;
  expect(file.suggestedFilename()).toBe(`${id}-Zoë-García-lab-report.txt`);
  await file.saveAs(`tmp/aud02/${id}-report.txt`);
  const contents=await fs.readFile(`tmp/aud02/${id}-report.txt`,'utf8');
  expect(contents).toContain('Evidence by learning goal');
  expect(contents).toContain('Written explanation 1 for '+id);
  expect(contents).not.toContain('"comparison":');
 }
 const dataEvent=page.waitForEvent('download');
 await page.locator('[data-report-action="json"]').click();
 const dataFile=await dataEvent;
 expect(dataFile.suggestedFilename()).toBe(`${id}-Zoë-García-responses.json`);
 await dataFile.saveAs(`tmp/aud02/${id}-responses.json`);
 const data=JSON.parse(await fs.readFile(`tmp/aud02/${id}-responses.json`,'utf8'));
 expect(data.schemaVersion).toBe(2);
 expect(data.evidence.length).toBeGreaterThanOrEqual(3);
 expect(data.data).toBeTruthy();
 await printReport(page);const report=page.locator('#student-report-print');await expect(report).toContainText('Zoë García');await expect(report).toContainText('Period 3');await expect(report).toContainText('Status: Complete');await expect(report).toContainText('Evidence by learning goal');await expect(report).toContainText('Revisions and feedback');await expect(report).toContainText('PST');if(id!=='osmosis-homeostasis')await expect(report).toContainText('Written explanation 1 for '+id);
 await page.pdf({path:`tmp/aud02/${id}-print.pdf`,format:'Letter',printBackground:true});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await page.emulateMedia({media:'screen'});await expect(page.locator('#app')).toBeVisible();expect(await page.evaluate(()=>document.body.classList.contains('student-report-printing')||document.documentElement.classList.contains('student-report-printing'))).toBe(false);expect(errors).toEqual([]);
});

test('native printing uses current identity and long writing without clipping or losing the final response',async({page})=>{
 const f=reportAttempt('enzyme-activity',true);f.state.studentName='Zoë García';f.state.studentClass='Period 3';f.state.answers[0]=('Long evidence paragraph: measured gas is indirect evidence of enzyme activity. α β 37 °C.\n\n').repeat(90)+'FINAL LONG ANSWER MARKER';await installFixture(page,f);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.getByLabel('Name (optional)',{exact:true}).fill('Maya Rivera');
 await download(page,'tmp/aud02/long-answers.pdf','enzyme-activity-Maya-Rivera-lab-report.pdf');
 // Native Ctrl+P enters the same report path without clicking the print control.
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});await expect(page.locator('#student-report-print')).toContainText('Maya Rivera');await expect(page.locator('#student-report-print')).toContainText('FINAL LONG ANSWER MARKER');await page.pdf({path:'tmp/aud02/long-answers-print.pdf',format:'Letter',printBackground:true});
});

test('PDF generation failure leaves printing available and permits retry',async({browser})=>{
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();await installFixture(page,reportAttempt('enzyme-activity'));
 await page.route('**/assets/lab-report-pdf-*.js',route=>route.abort());await page.locator('[data-report-action="pdf"]').click();await expect(page.locator('.student-report-status')).toContainText('The PDF could not be generated');await expect(page.locator('[data-report-action="pdf"]')).toBeEnabled();await expect(page.locator('[data-report-action="print"]')).toBeEnabled();await printReport(page);await expect(page.locator('#student-report-print')).toContainText('Status: In progress');await context.close();
});
