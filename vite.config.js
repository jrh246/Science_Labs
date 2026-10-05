import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hasLab = existsSync(resolve('lab.html'));
export default defineConfig({
  build: {rollupOptions: {input: {library: resolve('index.html'), ...(hasLab ? {lab: resolve('lab.html')} : {})}}},
  plugins: [{name: 'offline-cache', generateBundle(_, bundle) {
    const files = ['./', './index.html', ...(hasLab ? ['./lab.html'] : []), './manifest.json', './icons/lab.svg', ...Object.keys(bundle).map(x => './' + x)];
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
      return cache.match(new URL(${hasLab ? "url.pathname.endsWith('/lab.html') ? './lab.html' : './index.html'" : "'./index.html'"}, ROOT), {ignoreVary: true});
    }));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => await cache.match(event.request, {ignoreVary: true}) || fetch(event.request)));
});
`});
  }}],
});
