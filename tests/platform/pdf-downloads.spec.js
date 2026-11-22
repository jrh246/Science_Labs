import {test,expect} from '@playwright/test';import {readFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('every local static PDF is delivered byte-for-byte as a PDF, and missing files return 404',async({request})=>{
 const files=(await readdir('public/resources')).filter(file=>file.endsWith('.pdf'));expect(files.length).toBeGreaterThan(0);
 for(const file of files){const response=await request.get('/resources/'+file);expect(response.status(),file).toBe(200);expect(response.headers()['content-type'],file).toContain('application/pdf');const bytes=await response.body();expect(bytes.subarray(0,5).toString(),file).toBe('%PDF-');expect(hash(bytes),file).toBe(hash(await readFile('public/resources/'+file)));}
 expect((await request.get('/resources/missing-for-download-regression.pdf')).status()).toBe(404);
});
test('bird student and teacher links download actual PDFs from standalone and public-platform pages',async({page,request})=>{
 const launch=await(await request.get('/api/public/labs/natural-selection')).json();
 for(const path of ['/investigation.html?lab=natural-selection','/platform.html#/run?lab=natural-selection']){
  await page.goto(path);const scope=path.startsWith('/platform')?page.frameLocator('.lab-frame'):page;
  for(const [name,kind] of [['Student worksheet (PDF)','worksheet'],['Teacher guide (PDF)','teacher-guide']]){const pending=page.waitForEvent('download');await scope.getByRole('link',{name,exact:true}).click();const file=await pending,stream=await file.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const bytes=Buffer.concat(chunks),source=await readFile('public/resources/natural-selection-'+kind+'.pdf');expect(hash(bytes)).toBe(hash(source));expect(file.suggestedFilename()).toBe('natural-selection-'+kind+'.pdf');}
 }
 for(const kind of ['worksheet','teacher-guide']){const response=await request.get(new URL('resources/natural-selection-'+kind+'.pdf',launch.url).href);expect(response.headers()['content-type']).toContain('application/pdf');expect(hash(await response.body())).toBe(hash(await readFile('public/resources/natural-selection-'+kind+'.pdf')));}
});
