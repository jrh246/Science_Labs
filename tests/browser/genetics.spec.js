import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
test.use({timezoneId:'America/Los_Angeles'});
import {freshGenetics,interact} from '../../src/investigations/genetics-model.js';
const url='/investigation.html?lab=genetic-information';
const action=(page,a,value)=>page.locator(`[data-gi-action="${a}"]${value===undefined?'':`[data-value="${value}"]`}`);
async function idle(page){if(await page.locator('.gi-molecule-stage').count())await expect(page.locator('.gi-molecule-stage')).toHaveAttribute('data-animation','none');}
async function use(page,token,target){
 if(target==='dna')target=await page.locator('.gi-replication-stage').count()?(token==='tool:helicase'?'fork':'primer'):'promoter';
 if(target==='polymerase')target=await page.locator('.gi-replication-stage').count()?'growing-dna':'growing-rna';
 if(target==='rna')target={cap:'five-prime',splice:'intron',tail:'three-prime'}[token.split(':')[1]];
 if(target==='ribosome')target=token.startsWith('molecule:')?'mrna-groove':'ribosome-site';
 await page.locator(`[data-token="${token}"]`).click();await page.locator(`[data-target="${target}"]`).click();await idle(page);
}
async function capture(page,label){for(const width of [1440,390,768]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{scrollTo(0,0);requestAnimationFrame(resolve);})));await page.screenshot({path:`tmp/genetics-review/${label}-${width}.png`,fullPage:true});}await page.setViewportSize({width:1440,height:950});}
async function begin(page){await page.goto(url);await page.locator('[data-writing="prediction"]').fill('I predict that RNA carries the message and DNA stays in the nucleus.');await action(page,'next').click();}
test('virtual genetics: complete all processes, required corrections, offline PDF and printed student work',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await capture(page,'intro');
 await page.locator('[data-writing="prediction"]').fill('I predict that RNA carries the message and DNA stays in the nucleus.');await action(page,'next').click();
 await expect(page.locator('[data-token]')).toHaveCount(0);await action(page,'location','cytoplasm').click();await expect(page.locator('.gi-status')).toContainText('nuclear gene');await action(page,'location','nucleus').click();
 await use(page,'tool:helicase','dna');await use(page,'tool:dna-polymerase','dna');await use(page,'base:U','polymerase');await expect(page.locator('.gi-status')).toContainText('DNA uses thymine');
 for(const b of 'ATG')await use(page,'base:'+b,'polymerase');await page.reload();await expect(page.locator('.gi-work-instruction')).toContainText('other original strand');await capture(page,'replication');for(const b of 'TTA')await use(page,'base:'+b,'polymerase');
 await action(page,'check','0').click();await expect(action(page,'next')).toHaveCount(0);await action(page,'check','1').focus();await page.keyboard.press('Enter');await expect(action(page,'check','1')).toBeFocused();await action(page,'check','0').hover();await expect(action(page,'check','0')).toHaveCSS('background-color','rgb(229, 237, 217)');await capture(page,'daughters');await action(page,'next').click();
 await action(page,'location','nucleus').click();await use(page,'tool:dna-polymerase','dna');await expect(page.locator('.gi-status')).toContainText('Choose RNA polymerase');await use(page,'tool:rna-polymerase','dna');await use(page,'base:A','polymerase');await use(page,'base:T','polymerase');await expect(page.locator('.gi-status')).toContainText('RNA uses uracil');await use(page,'base:U','polymerase');await use(page,'base:G','polymerase');await action(page,'finish-rna').click();await idle(page);await capture(page,'transcription');await action(page,'next').click();
 for(const t of ['cap','splice','tail'])await use(page,'tool:'+t,'rna');await use(page,'molecule:dna','pore');await expect(page.locator('.gi-status')).toContainText('Nuclear DNA stays');await use(page,'molecule:mrna','pore');await capture(page,'processing');await action(page,'next').click();
 await action(page,'location','nucleus').click();await action(page,'location','cytoplasm').click();await use(page,'molecule:mrna','ribosome');await use(page,'trna:lys','ribosome');await expect(page.locator('.gi-current-codon')).toHaveText('AUG');await use(page,'trna:met','ribosome');await capture(page,'translation');await use(page,'trna:ala','ribosome');await use(page,'trna:phe','ribosome');await use(page,'trna:lys','ribosome');await expect(page.locator('.gi-status')).toContainText('no matching tRNA');await use(page,'release:release','ribosome');await action(page,'next').click();
 await action(page,'check','0').click();await action(page,'check','1').click();await page.locator('[data-writing="0"]').fill('Replication and transcription occurred in the nucleus. Mature mRNA crossed the pore; translation occurred at a ribosome in the cytoplasm. DNA was retained.');await page.locator('[data-writing="1"]').fill('Replication created two DNA molecules, each with an old and a new strand. Transcription made RNA using U. Translation read AUG GCU UUU UAA to make Met Ala Phe, stopping without adding an amino acid.');
 await page.getByLabel('Name (optional)',{exact:true}).fill('Zoë García');await page.getByLabel('Class / period (optional)',{exact:true}).fill('Period 3');await action(page,'complete').click();await capture(page,'report');
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);await context.setOffline(true);await page.reload();await expect(page.getByLabel('Name (optional)',{exact:true})).toHaveValue('Zoë García');
 let event=page.waitForEvent('download');await page.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();let file=await event;expect(file.suggestedFilename()).toBe('genetic-information-Zoë-García-lab-report.pdf');await file.saveAs('tmp/genetics-review/completed-report.pdf');expect((await fs.readFile('tmp/genetics-review/completed-report.pdf')).subarray(0,5).toString()).toBe('%PDF-');await expect(page.locator('.gi-status')).toContainText('PDF report downloaded');
 event=page.waitForEvent('download');await action(page,'json').click();file=await event;expect(file.suggestedFilename()).toBe('genetic-information-Zoë-García-responses.json');const stream=await file.createReadStream();let raw='';for await(const part of stream)raw+=part;const data=JSON.parse(raw);expect(data.status).toBe('Complete');expect(data.grading).toBe('not_graded');expect(data.records.peptide).toEqual(['Met','Ala','Phe']);expect(data.history.filter(x=>!x.accepted).length).toBeGreaterThan(5);expect(data.schemaVersion).toBe(2);expect(data.evidence.find(row=>row.id==='rna-pairing').status).toBe('shown_after_feedback');expect(data.exportedAtDisplay).toMatch(/\d{1,2}:\d{2} [AP]M P[SD]T/);
 await page.evaluate(()=>window.print=()=>{window.__printed=true;});await action(page,'print').click();expect(await page.evaluate(()=>window.__printed)).toBe(true);await page.emulateMedia({media:'print'});await expect(page.locator('.gi-lab')).toBeHidden();await expect(page.locator('.gi-print')).toContainText('Zoë García');await expect(page.locator('.gi-print')).toContainText('Evidence of learning and revisions');await expect(page.locator('.gi-print')).not.toContainText('Actions and corrections');await expect(page.locator('.gi-print')).not.toContainText('Continue to the next process');await expect(page.locator('.gi-print')).not.toContainText(data.exportedAt);await page.pdf({path:'tmp/genetics-review/printed-report.pdf',format:'Letter',printBackground:true});await page.emulateMedia({media:'screen'});
 await page.locator('[data-writing="1"]').fill(('Long explanation: information is copied into RNA, and amino acids are assembled into a peptide. α β 37 °C.\n').repeat(80)+'FINAL RESPONSE MARKER');event=page.waitForEvent('download');await page.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();await(await event).saveAs('tmp/genetics-review/long-draft.pdf');expect(errors).toEqual([]);
});
test('genetics catalog labels a separate virtual-only lab and mouse dragging works',async({page})=>{
 await page.goto('/#/science/biology/genetics');await page.getByRole('link',{name:'DNA to RNA to Protein',exact:true}).click();await expect(page.locator('.detail .badge')).toHaveText('Available · Virtual only');await expect(page.locator('.detail-panel')).not.toContainText('Use virtual observations, classroom measurements');await page.getByRole('link',{name:'Launch virtual lab'}).click();
 await page.locator('[data-writing="prediction"]').fill('RNA moves, DNA stays.');await action(page,'next').click();await action(page,'location','nucleus').click();
 const from=await page.locator('[data-token="tool:helicase"]').boundingBox(),to=await page.locator('[data-target="fork"]').boundingBox();await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});await page.mouse.up();await expect(page.getByRole('heading',{name:'Choose the copying enzyme'})).toBeVisible();
});
test('touch dragging, tap alternative, reduced motion and reload retain the process',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();await begin(page);await action(page,'location','nucleus').tap();
 const token=page.locator('[data-token="tool:helicase"]');await token.scrollIntoViewIfNeeded();await page.locator('.gi-molecular-view').screenshot({path:'tmp/genetics-review/touch-enzyme-target.png'});const from=await token.boundingBox(),to=await page.locator('[data-target="fork"]').boundingBox(),cdp=await context.newCDPSession(page);const a={x:from.x+from.width/2,y:from.y+from.height/2},b={x:to.x+to.width/2,y:to.y+to.height/2};expect(b.y).toBeGreaterThan(0);expect(b.y).toBeLessThan(844);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/6,y:a.y+(b.y-a.y)*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.getByRole('heading',{name:'Choose the copying enzyme'})).toBeVisible();await page.reload();await page.locator('[data-token="tool:dna-polymerase"]').tap();await page.locator('[data-target="primer"]').tap();await expect(page.getByRole('heading',{name:'Build a new DNA partner'})).toBeVisible();await expect(page.locator('.gi-replication-stage animate,.gi-replication-stage animateTransform')).toHaveCount(0);await context.close();
});

test('enzymes act at molecular sites, wrong placements give feedback, and replay preserves work',async({page})=>{
 await begin(page);await action(page,'location','nucleus').click();
 await use(page,'tool:dna-polymerase','fork');await expect(page.locator('.gi-status')).toContainText('Open the DNA with helicase first');
 await page.locator('[data-token="tool:helicase"]').focus();await page.keyboard.press('Enter');await page.locator('[data-target="fork"]').focus();await page.keyboard.press('Enter');
 await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','unwind');
 const position=()=>page.locator('.gi-helicase').evaluate(el=>el.transform.animVal.getItem(0).matrix.e);
 const start=await position();await expect.poll(position).toBeGreaterThan(start+80);
 await page.locator('.gi-molecular-view').screenshot({path:'tmp/genetics-review/helicase-in-action.png'});
 await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','none');
 const snapshot=()=>page.evaluate(()=>localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith(':genetic-information:v1'))));
 const saved=await snapshot();await action(page,'replay-animation').click();await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','unwind');await action(page,'finish-animation').click();expect(await snapshot()).toBe(saved);
 await use(page,'tool:dna-polymerase','fork');await expect(page.locator('.gi-status')).toContainText('primer’s 3′ end (2)');await expect(page.locator('.gi-dna-polymerase')).toHaveCount(0);
 await page.locator('[data-token="tool:dna-polymerase"]').click();await page.locator('[data-target="primer"]').click();await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','bind');await action(page,'finish-animation').click();
 await page.locator('[data-token="base:A"]').click();await page.locator('[data-target="growing-dna"]').click();await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','extend');await expect(page.locator('[data-token]')).toHaveCount(0);
 await page.locator('.gi-molecular-view').screenshot({path:'tmp/genetics-review/polymerase-in-action.png'});await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','none');
 await page.reload();await expect(page.locator('.gi-replication-stage')).toHaveAttribute('data-animation','none');await expect(page.locator('.gi-base-builder')).toHaveCount(0);await expect(page.getByRole('group',{name:'Nucleotide choices',exact:true}).locator('[data-token]')).toHaveCount(5);
 for(const width of [1440,390]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('.gi-scene').screenshot({path:`tmp/genetics-review/replication-placement-${width}.png`});}
});

test('every process uses a molecular work site with correct feedback and replay',async({page})=>{
 await begin(page);await action(page,'location','nucleus').click();await use(page,'tool:helicase','fork');await use(page,'tool:dna-polymerase','primer');for(const b of 'ATGTTA')await use(page,'base:'+b,'growing-dna');await action(page,'check','1').click();await action(page,'next').click();await action(page,'location','nucleus').click();
 await use(page,'tool:rna-polymerase','gene-body');await expect(page.locator('.gi-local-status')).toContainText('Start at the promoter');await expect(page.locator('.gi-rna-polymerase')).toHaveCount(0);
 await page.locator('[data-token="tool:rna-polymerase"]').click();await page.locator('[data-target="promoter"]').click();await expect(page.locator('.gi-molecule-stage')).toHaveAttribute('data-animation','rna-bind');await idle(page);
 for(const b of 'AUG')await use(page,'base:'+b,'growing-rna');await action(page,'finish-rna').click();await idle(page);await action(page,'next').click();
 await use(page,'tool:cap','three-prime');await expect(page.locator('.gi-local-status')).toContainText('5′ end (1)');await expect(page.locator('.gi-rna-cap')).toHaveCount(0);
 await use(page,'tool:tail','intron');await expect(page.locator('.gi-local-status')).toContainText('3′ end (3)');await use(page,'tool:splice','five-prime');await expect(page.locator('.gi-local-status')).toContainText('intron (2)');
 for(const [tool,target,kind] of [['cap','five-prime','cap'],['splice','intron','splice'],['tail','three-prime','tail']]){
  await page.locator(`[data-token="tool:${tool}"]`).click();await page.locator(`[data-target="${target}"]`).click();await expect(page.locator('.gi-molecule-stage')).toHaveAttribute('data-animation',kind);await idle(page);
 }
 await page.locator('[data-token="molecule:mrna"]').click();await page.locator('[data-target="pore"]').click();await expect(page.locator('.gi-molecule-stage')).toHaveAttribute('data-animation','export');
 const x=()=>page.locator('.gi-exported-mrna').evaluate(el=>el.transform.animVal.getItem(0).matrix.e);const start=await x();await expect.poll(x).toBeGreaterThan(start+75);await idle(page);
 await action(page,'next').click();await action(page,'location','cytoplasm').click();await use(page,'molecule:mrna','mrna-groove');await use(page,'release:release','ribosome-site');await expect(page.locator('.gi-local-status')).toContainText('stop codon');
 for(const t of ['met','ala','phe'])await use(page,'trna:'+t,'ribosome-site');await page.locator('[data-token="release:release"]').click();await page.locator('[data-target="ribosome-site"]').click();await expect(page.locator('.gi-molecule-stage')).toHaveAttribute('data-animation','release');await idle(page);await expect(page.locator('.gi-scene')).toContainText('Released');
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith(':genetic-information:v1')))));
 const before=await read();await action(page,'replay-animation').click();await idle(page);expect(await read()).toEqual(before);await page.reload();await expect(page.locator('.gi-console')).toContainText('chain is released');
});

test('touch workbench keeps later enzyme, pore, and tRNA sites reachable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage();
 let saved=freshGenetics();saved.prediction='RNA carries the message.';const step=(a,v='')=>saved=interact(saved,a,v).state;
 step('next');step('location','nucleus');step('tool','helicase');step('tool','dna-polymerase');for(const b of 'ATGTTA')step('base',b);step('check','1');step('next');step('location','nucleus');
 await page.addInitScript(data=>{if(!sessionStorage.getItem('fixture-loaded')){localStorage.setItem('science-labs:/:genetic-information:v1',JSON.stringify(data));sessionStorage.setItem('fixture-loaded','yes');}},saved);await page.goto(url);
 const cdp=await context.newCDPSession(page);
 async function drag(tokenId,targetId){
  const token=page.locator(`[data-token="${tokenId}"]`);await token.scrollIntoViewIfNeeded();const from=await token.boundingBox(),to=await page.locator(`[data-target="${targetId}"]`).boundingBox();
  const a={x:from.x+from.width/2,y:from.y+from.height/2},b={x:to.x+to.width/2,y:to.y+to.height/2};expect(b.y).toBeGreaterThan(0);expect(b.y).toBeLessThan(844);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/8,y:a.y+(b.y-a.y)*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await idle(page);
 }
 await drag('tool:rna-polymerase','promoter');await expect(page.locator('.gi-rna-polymerase')).toHaveCount(1);for(const b of 'AUG')await use(page,'base:'+b,'growing-rna');await action(page,'finish-rna').tap();await action(page,'next').tap();
 await drag('tool:cap','five-prime');await expect(page.locator('.gi-rna-cap')).toHaveCount(1);await drag('tool:splice','intron');await expect(page.locator('.gi-intron')).toHaveCount(0);await drag('tool:tail','three-prime');await drag('molecule:mrna','pore');await expect(page.locator('.gi-work-instruction')).toContainText('message has arrived');await action(page,'next').tap();await action(page,'location','cytoplasm').tap();
 await drag('molecule:mrna','mrna-groove');await drag('trna:met','ribosome-site');await expect(page.locator('.gi-current-codon')).toHaveText('GCU');await expect(page.locator('.gi-molecule-stage animate,.gi-molecule-stage animateTransform')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await context.close();
});

test('nucleotide placement ring follows each polymerase on both DNA strands and RNA',async({page})=>{
 await begin(page);await action(page,'location','nucleus').click();await use(page,'tool:helicase','fork');await use(page,'tool:dna-polymerase','primer');
 async function aligned(target,enzyme,offsetY){
  await expect(page.locator('.gi-base-builder,.gi-component-dock .gi-sequence')).toHaveCount(0);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:950});
   const distance=await page.evaluate(({target,enzyme,offsetY})=>{
    const machine=document.querySelector(enzyme),ring=document.querySelector(`[data-target="${target}"]`),point=machine.ownerSVGElement.createSVGPoint();
    point.x=0;point.y=offsetY;const site=point.matrixTransform(machine.getScreenCTM()),box=ring.getBoundingClientRect();
    const stage=ring.closest('.gi-molecule-stage').getBoundingClientRect(),tray=document.querySelector('.gi-nucleotides').getBoundingClientRect();
    return {x:Math.abs(box.x+box.width/2-site.x),y:Math.abs(box.y+box.height/2-site.y),trayGap:tray.top-stage.bottom};
   },{target,enzyme,offsetY});
   expect(distance.x).toBeLessThan(1);expect(distance.y).toBeLessThan(1);expect(distance.trayGap).toBeGreaterThanOrEqual(0);expect(distance.trayGap).toBeLessThan(25);
  }
  await page.setViewportSize({width:1440,height:950});
 }
 for(let i=0;i<6;i++){
  if(i===4)await page.reload();
  await aligned('growing-dna','.gi-dna-polymerase',i<3?14:-14);
  if(i===1||i===4)await page.locator('.gi-molecule-stage').screenshot({path:`tmp/genetics-review/aligned-dna-${i}.png`});
  await use(page,'base:'+'ATGTTA'[i],'growing-dna');
 }
 await expect(page.locator('[data-target="growing-dna"]')).toHaveCount(0);await action(page,'check','1').click();await action(page,'next').click();await action(page,'location','nucleus').click();await use(page,'tool:rna-polymerase','promoter');
 for(const b of 'AUG'){await aligned('growing-rna','.gi-rna-polymerase',34);await use(page,'base:'+b,'growing-rna');}
 await expect(page.locator('[data-target="growing-rna"]')).toHaveCount(0);await expect(action(page,'finish-rna')).toBeVisible();
});

test('translation choices, concept feedback, and completion saves remain clear after reload',async({page})=>{
 let saved=freshGenetics();saved.attemptId='shuffle-feedback-review-1';saved.prediction='RNA carries the message.';const step=(a,v='')=>saved=interact(saved,a,v).state;
 step('next');step('location','nucleus');step('tool','helicase');step('tool','dna-polymerase');for(const b of 'ATGTTA')step('base',b);step('check','1');step('next');step('location','nucleus');step('tool','rna-polymerase');for(const b of 'AUG')step('base',b);step('finish-rna');step('next');for(const tool of ['cap','splice','tail'])step('tool',tool);step('export','mrna');step('next');step('location','cytoplasm');step('load','mrna');
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(data=>{if(!sessionStorage.getItem('feedback-fixture')){localStorage.setItem('science-labs:/:genetic-information:v1',JSON.stringify(data));sessionStorage.setItem('feedback-fixture','yes');}},saved);await page.goto(url);
 const readOrder=()=>page.locator('.gi-translation-tray [data-token]').evaluateAll(nodes=>nodes.map(node=>node.dataset.token)),order=await readOrder();
 expect([...order].sort()).toEqual(['trna:met','trna:ala','trna:phe','trna:lys','release:release'].sort());
 const factor=page.locator('[data-token="release:release"]');for(const codon of ['UAA','UAG','UGA']){await expect(factor).toContainText(codon);await expect(factor).toHaveAttribute('aria-label',new RegExp(codon));}
 for(const width of [1440,390]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('.gi-component-dock').screenshot({path:`tmp/genetics-review/shuffled-trnas-${width}.png`});}await page.setViewportSize({width:1440,height:950});
 await use(page,'trna:lys','ribosome-site');expect(await readOrder()).toEqual(order);await use(page,'trna:met','ribosome-site');expect(await readOrder()).toEqual(order);await page.reload();expect(await readOrder()).toEqual(order);
 for(const t of ['ala','phe'])await use(page,'trna:'+t,'ribosome-site');await use(page,'release:release','ribosome-site');await action(page,'next').click();
 const question=page.locator('.gi-final fieldset');await expect(question).toContainText('Replication makes a new copy of DNA');await expect(question).toContainText('Must a cell replicate (copy) its DNA each time it wants to transcribe an mRNA message?');await expect(question.locator('.gi-check-feedback')).toHaveCount(0);
 await action(page,'check','0').click();await expect(question.locator('.gi-check-feedback strong')).toHaveText('Try again.');await action(page,'check','1').click();await expect(question.locator('legend')).toContainText('Correct answer');await expect(action(page,'check','1')).toHaveClass(/correct/);await expect(question.locator('.gi-check-feedback strong')).toHaveText('Correct!');await expect(question.locator('.gi-success')).toContainText('DNA already in its nucleus');
 await page.reload();await expect(question.locator('.gi-check-feedback strong')).toHaveText('Correct!');
 for(const width of [1440,390]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await question.screenshot({path:`tmp/genetics-review/explain-correct-${width}.png`});}
 await page.locator('[data-writing="0"]').fill('DNA replication and transcription happen in the nucleus. The mRNA leaves through the pore.');await page.locator('[data-writing="1"]').fill('Replication makes DNA, transcription makes RNA, and translation links amino acids.');
 await action(page,'complete').click();const feedback=page.locator('#gi-complete-feedback');await expect(feedback).toBeVisible();await expect(feedback).toBeInViewport();await expect(feedback).toContainText('Saved just now');await expect(action(page,'complete')).toHaveText('Work saved as complete');
 const readComplete=()=>page.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(key=>key.endsWith(':genetic-information:v1')))).complete);expect(await readComplete()).toBe(true);
 await action(page,'complete').click();await expect(feedback).toContainText('Saved just now');
 await page.evaluate(()=>{window.originalStorageWrite=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new DOMException('Storage unavailable','QuotaExceededError');};});
 await action(page,'complete').click();await expect(feedback).toContainText('could not be saved');await expect(action(page,'complete')).toHaveText('Save completed explanation');
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalStorageWrite;});await action(page,'complete').click();await expect(feedback).toContainText('Saved just now');await expect(page.locator('.gi-storage')).toBeEmpty();
 await page.reload();await expect(feedback).toContainText('Your completed work is saved on this device');
 await page.locator('[data-writing="1"]').fill('DNA is copied for cell division. RNA carries the instructions used by a ribosome.');await expect(feedback).toBeEmpty();await expect(action(page,'complete')).toHaveText('Save completed explanation');expect(await readComplete()).toBe(false);
 await action(page,'complete').click();await expect(feedback).toContainText('Saved just now');await page.locator('.gi-final').screenshot({path:'tmp/genetics-review/completion-saved-390.png'});
 await page.locator('[data-writing="1"]').fill('Revised answer about DNA and RNA.');await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Storage unavailable','QuotaExceededError');};});await action(page,'complete').click();await expect(feedback).toContainText('could not be saved');await expect(feedback).toHaveClass(/gi-save-error/);expect(await readComplete()).toBe(false);
});
