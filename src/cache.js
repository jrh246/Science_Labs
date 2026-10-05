import {site} from './site.js';
// Clear only this lab's offline caches. Refill from network, keeping offline
// copies as fallback so a classroom reset still works without a connection.
export async function refreshLabCache(){
 if(!('caches' in window))return;
 const names=(await caches.keys()).filter(name=>name.startsWith(site.cachePrefix));
 for(const name of names){
  const cache=await caches.open(name);
  const entries=await Promise.all((await cache.keys()).map(async request=>[request,await cache.match(request)]));
  await caches.delete(name);
  const refreshed=await caches.open(name);
  await Promise.all(entries.map(async([request,previous])=>{
   let response;
   try{response=await fetch(request,{cache:'reload',signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error('Unavailable');}
   catch{response=previous;}
   if(response)await refreshed.put(request,response);
  }));
 }
 if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.getRegistration(site.root.href);registration?.update().catch(()=>{});}
}
