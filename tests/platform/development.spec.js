import {test,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
const checks='.platform-build/local-preview-checks';
async function login(page){await page.goto('/platform.html#/login');await page.getByLabel('Email address',{exact:true}).fill('owner@example.test');await page.getByLabel('Password',{exact:true}).fill('ScienceLabs!Local2026');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();}
test('local owner can browse registered builds and launch owner previews without changing publication',async({page})=>{
 const latest=JSON.parse(await readFile('.platform-build/latest-release.json','utf8')),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await login(page);const before=await (await page.request.get('/api/catalog')).json();
 await page.getByRole('navigation').getByRole('link',{name:'Development labs',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Development labs',exact:true})).toBeVisible();
 const catalog=await(await page.request.get('/api/owner/catalog')).json(),release=catalog.releases.find(r=>r.id===latest.id);expect(release).toBeTruthy();
 await expect(page.getByLabel('Registered local build',{exact:true})).toHaveValue(latest.id);
 await expect(page.locator('[data-development-lab]')).toHaveCount(release.manifest.labs.length);
 await expect(page.getByRole('status')).toContainText(release.manifest.labs.length+' built labs');
 for(const id of ['immune-memory','reserve-design']){
  await page.locator('[data-development-lab="'+id+'"]').getByRole('link',{name:'Preview lab',exact:true}).click();
  await expect(page.locator('.lab-frame')).toHaveAttribute('data-lab',id);await expect(page.locator('.lab-frame')).toHaveAttribute('data-release',latest.id);
  const frame=page.frameLocator('.lab-frame');await expect(frame.getByLabel('Name (optional)',{exact:true})).toBeVisible();await expect(frame.getByRole('button',{name:'Download lab report (PDF)',exact:true})).toBeVisible();
  await page.goto('/platform.html#/development-labs');await expect(page.locator('[data-development-lab]')).toHaveCount(release.manifest.labs.length);
 }
 const older=catalog.releases.find(r=>!r.disabled_at&&r.id!==latest.id);if(older){await page.getByLabel('Registered local build',{exact:true}).selectOption(older.id);await expect(page).toHaveURL(new RegExp('release='+older.id));await expect(page.locator('[data-development-lab]')).toHaveCount(older.manifest.labs.length);}
 await page.goto('/platform.html#/development-labs');await page.setViewportSize({width:390,height:844});await expect(page.locator('[data-development-lab]')).toHaveCount(release.manifest.labs.length);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await mkdir(checks,{recursive:true});await page.screenshot({path:checks+'/development-phone.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:checks+'/development-desktop.png',fullPage:true});
 expect(await(await page.request.get('/api/catalog')).json()).toEqual(before);expect(errors).toEqual([]);
});
test('development library stays hidden from guests and hosted owners',async({browser})=>{
 const guest=await browser.newContext(),page=await guest.newPage();await page.goto('/platform.html#/catalog');await expect(page.getByRole('navigation').getByRole('link',{name:'Development labs',exact:true})).toHaveCount(0);expect((await page.request.get('/api/owner/catalog')).status()).toBe(401);
 await page.goto('/platform.html#/development-labs');await expect(page.getByRole('heading',{name:'Welcome back',exact:true})).toBeVisible();await guest.close();
 const hosted=await browser.newContext(),owner=await hosted.newPage();await owner.route('**/api/health',async route=>{const response=await route.fetch(),health=await response.json();await route.fulfill({json:{...health,environment:'production'}});});await login(owner);
 let privateReads=0;owner.on('request',request=>{if(request.url().endsWith('/api/owner/catalog'))privateReads++;});await expect(owner.getByRole('navigation').getByRole('link',{name:'Development labs',exact:true})).toHaveCount(0);
 await owner.goto('/platform.html#/development-labs');await expect(owner.getByRole('alert')).toHaveText('Development labs are available only to the site owner on localhost.');expect(privateReads).toBe(0);await hosted.close();
});
