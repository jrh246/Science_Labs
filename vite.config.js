import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hasLab = existsSync(resolve('lab.html'));
const hasInvestigation = existsSync(resolve('investigation.html'));
const resources=existsSync('public/resources')?readdirSync('public/resources').filter(x=>x.endsWith('.pdf')).map(x=>'./resources/'+x):[];
export default defineConfig({
  build: {rollupOptions: {input: {library: resolve('index.html'), ...(hasLab ? {lab: resolve('lab.html')} : {}), ...(hasInvestigation ? {investigation: resolve('investigation.html')} : {})}}},
  plugins: [{name: 'offline-cache', enforce: 'post', generateBundle: {order: 'post', handler(_, bundle) {
    const files = [...new Set(['./', './index.html', ...resources, ...(hasInvestigation?['./investigation.html']:[]), ...(hasLab ? ['./lab.html'] : []), './manifest.json', './icons/lab.svg', ...Object.keys(bundle).map(x => './' + x)])];
    const version = createHash('sha256').update(JSON.stringify(bundle)).digest('hex').slice(0, 12);
    this.emitFile({type: 'asset', fileName: 'sw.js', source: `
const ROOT = new URL(self.registration.scope);
const PREFIX = 'science-labs:' + ROOT.pathname + ':';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Root may control the first /dev/ visit. Leave that preview to the network or its own worker.
  if (event.request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname) || url.pathname.startsWith(ROOT.pathname + 'dev/')) return;
  if (event.request.cache === 'reload') { event.respondWith(fetch(event.request)); return; }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache: 'no-cache'}).then(async response => {
      if (!response.ok) throw new Error('Navigation unavailable');
      const cache = await caches.open(CACHE);
      await cache.put(event.request, response.clone());
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      const exact=await cache.match(event.request,{ignoreVary:true});if(exact)return exact;
      return cache.match(new URL(${hasInvestigation ? "url.pathname.endsWith('/investigation.html') ? './investigation.html' : " : ''}${hasLab ? "url.pathname.endsWith('/lab.html') ? './lab.html' : './index.html'" : "'./index.html'"}, ROOT), {ignoreVary: true});
    }));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => await cache.match(event.request, {ignoreVary: true}) || fetch(event.request)));
});
`});
  }}}],
});
