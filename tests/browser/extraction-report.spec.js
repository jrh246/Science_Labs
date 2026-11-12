import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
test.use({timezoneId:'America/Los_Angeles'});
const url='/investigation.html?lab=dna-replication';
const names=['Complete extraction','No detergent control','No fruit blank'];
const use=async(page,tool,target)=>{await page.locator(`[data-tool="${tool}"]`).click();await page.locator(`[data-target="${target}"]`).click();};
async function start(page){await page.goto(url);await page.locator('[data-field="prediction"]').fill('Mashing may release some DNA; detergent may release more.');await page.getByRole('button',{name:'Start extraction'}).click();}
async function fillReport(page){
 for(let i=0;i<3;i++){await page.getByLabel(names[i]+' visibility score').selectOption(String([3,1,0][i]));await page.locator(`[data-note="${i}"]`).fill(['Many pale strands at the interface.','A few faint strands.','No visible precipitate.'][i]);}
 await page.locator('[data-field="claim"]').fill('The detergent sample had more visible material. Mashing can rupture some membranes without detergent; detergent disrupts additional lipid bilayers.');
 await page.locator('[data-field="limit"]').fill('Visibility does not measure DNA concentration. Other molecules may join the precipitate.');
 await page.getByLabel('Name (optional)',{exact:true}).fill('Zoë García');await page.getByLabel('Class / period (optional)').fill('Biology 3');
 await page.getByRole('button',{name:'Save completed explanation'}).click();
}
async function downloadPdf(page,path){
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();const file=await event;
 expect(file.suggestedFilename()).toBe('dna-replication-Zoë-García-lab-report.pdf');await file.saveAs(path);
 expect((await fs.readFile(path)).subarray(0,5).toString()).toBe('%PDF-');await expect(page.locator('.dna-message')).toContainText('PDF report downloaded');
}

test('required checkpoints take priority over tool instructions and preserve correction history',async({page})=>{
 await start(page);await use(page,'fruit','bag');for(let i=0;i<3;i++)await use(page,'masher','bag');await use(page,'water','bag');await use(page,'salt','bag');
 await expect(page.getByRole('heading',{name:'Stop and think: before detergent'})).toBeVisible();
 await expect(page.locator('.dna-check')).toContainText('Answer this question correctly before continuing');
 await expect(page.locator('.dna-step-panel')).not.toContainText('Move the detergent dropper');
 await expect(page.locator('[data-tool="soap"]')).toBeDisabled();await expect(page.locator('[data-target="bag"]')).toBeDisabled();
 await page.locator('[data-check="1"]').click();await expect(page.locator('[data-tool="soap"]')).toBeDisabled();await page.reload();
 await expect(page.getByRole('heading',{name:'Stop and think: before detergent'})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/dna-required-checkpoint-mobile.png',fullPage:true});
 await page.locator('[data-check="0"]').click();await expect(page.getByRole('heading',{name:'Add 1 mL detergent'})).toBeVisible();await use(page,'soap','bag');await use(page,'mix','bag');await use(page,'filter','tube');await use(page,'sample','funnel');
 await expect(page.getByRole('heading',{name:'Stop and think: before alcohol'})).toBeVisible();await expect(page.locator('.dna-step-panel')).not.toContainText('Move the alcohol pipette');await expect(page.locator('[data-tool="alcohol"]')).toBeDisabled();
 await page.locator('[data-check="1"]').click();await use(page,'alcohol','tube');await page.getByRole('button',{name:'Advance to 5:00'}).click();await page.getByRole('button',{name:'Compare the controls'}).click();
 await expect(page.locator('.dna-sample-art').nth(1)).toHaveAttribute('aria-label',/few thin, pale threads/);
 await fillReport(page);const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download responses (JSON)'}).click();const stream=await(await event).createReadStream();let raw='';for await(const part of stream)raw+=part;const data=JSON.parse(raw);
 expect(data.checkpoints[0].attempts.map(a=>a.choice)).toEqual([1,0]);expect(data.grading.status).toBe('not_graded');expect(data.status).toBe('Complete');expect(data.schemaVersion).toBe(2);expect(data.evidence[0].status).toBe('Checkpoint correct after feedback');
 await downloadPdf(page,'tmp/dna-learning-revision/virtual-report.pdf');
});

test('completed classroom reports download offline, print all answers and preserve long writing',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 await expect(page.locator('.dna-science')).toContainText('lipid bilayer');await expect(page.locator('.dna-science')).toContainText('come out of a solution');
 await page.locator('[data-field="prediction"]').fill('DNA is already present in fruit. Detergent should help release it.');await page.getByRole('button',{name:'Use classroom observations'}).click();await fillReport(page);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);await context.setOffline(true);await page.reload();
 await expect(page.getByLabel('Name (optional)',{exact:true})).toHaveValue('Zoë García');
 // First PDF use occurs offline, including loading the PDF generator and font.
 await downloadPdf(page,'tmp/dna-learning-revision/classroom-report.pdf');
 await page.evaluate(()=>{window.print=()=>{window.__printCalled=(window.__printCalled||0)+1;};});
 await page.getByRole('button',{name:'Print lab report',exact:true}).click();expect(await page.evaluate(()=>window.__printCalled)).toBe(1);
 await page.emulateMedia({media:'print'});await expect(page.locator('.dna-lab')).toBeHidden();await expect(page.locator('.dna-print-report')).toBeVisible();await expect(page.locator('.dna-print-report')).toContainText('Zoë García');await expect(page.locator('.dna-print-report')).toContainText('Not required for classroom route');await expect(page.locator('.dna-print-report')).toContainText('A few faint strands.');
 await page.pdf({path:'tmp/dna-learning-revision/printed-report.pdf',format:'Letter',printBackground:true});await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.locator('[data-field="claim"]').fill(('Long evidence paragraph: mashing releases some DNA; detergent disrupts more membranes. α β 37 °C.\n').repeat(90)+'FINAL ANSWER MARKER');
 await downloadPdf(page,'tmp/dna-learning-revision/long-draft-report.pdf');expect(errors).toEqual([]);
});
