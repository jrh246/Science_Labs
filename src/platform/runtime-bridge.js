import {freezeReport} from './report-document.js';
import {teacherReport} from './teacher-report.js';
import {mountTeacherLab} from './teacher-lab-runtime.js';
// Standalone labs have no injected context and keep their original storage.
const context=typeof window==='undefined'?null:window.__LAB_CONTEXT__;
let reportGetter=null,teacherAnswers=()=>({});
export function platformReport(report){return teacherReport(report,context?.teacherLab,teacherAnswers());}
export function setPlatformReport(getReport){if(context){reportGetter=()=>platformReport(getReport());document.dispatchEvent(new Event('science-platform-report-ready'));}}
export function canonicalStorageKey(key){return String(key).replace(/^science-labs:[^:]*:/,'science-labs:/:').replace(/^cell-lab:development:.*$/,'cell-lab');}
if(context){
  const guest=context.mode==='public',cloud=Boolean(context.assignmentId||context.practice);
  const prefix=guest?`science-guest:${context.labId}:${context.releaseId}:`:`science-platform:${context.userId}:${context.scopeId}:`;
  const rawGet=Storage.prototype.getItem,rawSet=Storage.prototype.setItem,rawRemove=Storage.prototype.removeItem;
  let local;try{local=window.localStorage;}catch{}
  const metaKey=prefix+'__sync',scoped=key=>prefix+canonicalStorageKey(key);
  let localState={},meta=null,deviceOk=Boolean(local),statusNode,submitButton,saving=false,timer=null;
  try{for(const key of Object.keys(local||{}))if(key.startsWith(prefix)&&key!==metaKey)localState[key.slice(prefix.length)]=rawGet.call(local,key);meta=JSON.parse(rawGet.call(local,metaKey)||'null');}catch{deviceOk=false;}
  meta||={baseRevision:context.cloudRevision||0,dirty:false};
  let conflict=cloud&&Boolean(meta.dirty&&meta.baseRevision!==context.cloudRevision);
  const message=value=>{if(statusNode)statusNode.textContent=value;};
  function stored(){return {...localState};}
  function remember(){
    try{
      if(!local)throw new Error('Device storage unavailable');
      for(const key of Object.keys(local))if(key.startsWith(prefix)&&key!==metaKey&&!Object.hasOwn(localState,key.slice(prefix.length)))rawRemove.call(local,key);
      for(const [key,value] of Object.entries(localState))rawSet.call(local,scoped(key),value);
      rawSet.call(local,metaKey,JSON.stringify(meta));deviceOk=true;return true;
    }catch{deviceOk=false;message('This browser could not save a device copy. Keep this tab open and download your work.'+(cloud?' Account saving is still available.':''));return false;}
  }
  function replaceFromCloud(){localState={...context.storage};meta={baseRevision:context.cloudRevision,dirty:false};remember();}
  // Never replace guest work on reload. Keep dirty account copies for review.
  if(cloud&&!meta.dirty)replaceFromCloud();
  const teacherKey='science-teacher-questions';
  teacherAnswers=()=>{try{return JSON.parse(localState[teacherKey]||'{}');}catch{return {};}};
  function changed(){meta.dirty=true;clearTimeout(timer);if(cloud)timer=setTimeout(()=>save(),1400);return remember();}
  Storage.prototype.getItem=function(key){return this===local?(localState[canonicalStorageKey(key)]??null):rawGet.call(this,key);};
  Storage.prototype.setItem=function(key,value){
    if(this!==local)return rawSet.call(this,key,value);
    const canonical=canonicalStorageKey(key);
    if(localState[canonical]===String(value)){
      if(!deviceOk&&!remember())throw new DOMException('Device storage unavailable','QuotaExceededError');
      return;
    }
    localState[canonical]=String(value);if(!changed())throw new DOMException('Device storage unavailable','QuotaExceededError');
  };
  Storage.prototype.removeItem=function(key){if(this!==local)return rawRemove.call(this,key);delete localState[canonicalStorageKey(key)];if(!changed())throw new DOMException('Device storage unavailable','QuotaExceededError');};
  Storage.prototype.clear=function(){if(this===local){localState={};if(!changed())throw new DOMException('Device storage unavailable','QuotaExceededError');}else for(const key of Object.keys(this))rawRemove.call(this,key);};
  async function save(){
    if(!cloud){if(remember()){meta.dirty=false;remember();message('Saved on this device. Download your report or device work before clearing browser data.');return true;}return false;}
    if(context.readonly){message('This assignment is closed. You can review and download your work.');return false;}
    if(conflict){message('Newer account work exists. Download this copy before choosing Reload cloud copy.');return false;}
    if(saving){await new Promise(resolve=>setTimeout(resolve,100));return save();}
    if(!context.reportStored&&reportGetter)meta.dirty=true;
    if(!meta.dirty){message('Your current work is saved to your account.');return true;}
    saving=true;message('Saving to your account…');
    const snapshot=stored(),report=reportGetter?freezeReport(reportGetter()):null;
    try{
      const path=context.assignmentId?`/api/assignments/${context.assignmentId}/attempt`:`/api/practice/${context.labId}/${context.releaseId}`;
      const response=await fetch(path,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({storage:snapshot,report,expectedRevision:meta.baseRevision}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok){if(response.status===409)conflict=true;throw new Error(result.error||'Account save failed.');}
      meta.baseRevision=result.revision;context.reportStored=Boolean(report);meta.dirty=JSON.stringify(snapshot)!==JSON.stringify(stored());remember();
      message(`Saved to your account at ${new Date(result.updated_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.${deviceOk?'':' This browser could not keep a device copy.'}`);
      if(meta.dirty)timer=setTimeout(()=>save(),1400);return true;
    }catch(error){message(navigator.onLine?error.message:deviceOk?'Offline: your work stays on this device. Keep this tab open. It will sync when you reconnect.':'Offline, and device storage is unavailable. Keep this tab open and download your work.');return false;}
    finally{saving=false;}
  }
  async function submit(){
    const report=reportGetter?.();if(report?.status!=='Complete'){message('Finish the lab and save its completed explanation before submitting.');return;}
    if(!context.reportStored)meta.dirty=true;
    clearTimeout(timer);submitButton.disabled=true;
    try{
      if(!await save())return;
      const response=await fetch(`/api/assignments/${context.assignmentId}/submit`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:meta.baseRevision})});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      message(`Submitted to your teacher at ${new Date(result.submittedAt).toLocaleString()}. You can still download your report.`);
      window.parent.postMessage({type:'science-labs-submitted',assignmentId:context.assignmentId},context.appUrl);
    }catch(error){message(error.message||'Submission failed. Your saved work is still available.');}finally{submitButton.disabled=false;}
  }
  function packet(){return {format:'science-labs-device-work',version:1,labId:context.labId,releaseId:context.releaseId,storage:stored(),report:reportGetter?freezeReport(reportGetter()):null};}
  function downloadLocal(){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(packet(),null,2)],{type:'application/json'}));link.href=url;link.download=context.labId+'-device-work.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function mount(){
    const bar=document.createElement('aside');bar.className='platform-work';bar.setAttribute('aria-label','Lab saving and sharing');
    const publicUrl=context.appUrl+'/platform.html#/run?lab='+encodeURIComponent(context.labId);
    bar.innerHTML=`<strong>${context.assignmentId?'Class assignment':guest?'Free lab · No account needed':'Practice lab'}</strong><div class="platform-work-buttons"><button data-cloud-save>${guest?'Save on this device':'Save progress'}</button>${context.assignmentId?'<button data-cloud-submit>Submit to teacher</button>':''}<button data-local-export>Download device work</button>${cloud?'<button data-cloud-reload>Reload cloud copy</button>':''}${guest?'<button data-public-copy>Copy public lab link</button>'+(context.accountSave?'<button data-save-account>Save to my account</button>':'')+'':''}<a href="${context.appUrl}/platform.html#/${context.assignmentId?'assignments':'catalog'}" target="_top">${context.assignmentId?'Back to dashboard':'Back to library'}</a></div><p role="status" aria-live="polite"></p>`;
    const style=document.createElement('style');style.textContent='.platform-work{position:relative;z-index:100;background:#eff6f2;color:#173f39;padding:12px 20px;border-bottom:2px solid #83a997;font:14px/1.5 system-ui}.platform-work-buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center}.platform-work button,.platform-work a{font:inherit;min-height:44px;padding:7px 12px;border:1px solid #9bb7aa;border-radius:7px;background:white;color:#173f39}.platform-work p{margin:6px 0 0}.platform-work button:focus-visible,.platform-work a:focus-visible{outline:3px solid #cf842c;outline-offset:2px}@media print{.platform-work{display:none}}';
    document.head.append(style);document.body.prepend(bar);mountTeacherLab(context,teacherAnswers,answers=>local.setItem(teacherKey,JSON.stringify(answers)));statusNode=bar.querySelector('p');submitButton=bar.querySelector('[data-cloud-submit]');
    const ready=()=>{if(submitButton)submitButton.disabled=!reportGetter||context.readonly;};ready();document.addEventListener('science-platform-report-ready',ready);
    bar.querySelector('[data-cloud-save]').onclick=()=>save();if(submitButton)submitButton.onclick=()=>submit();
    bar.querySelector('[data-local-export]').onclick=downloadLocal;
    if(cloud)bar.querySelector('[data-cloud-reload]').onclick=()=>{if(confirm('Replace this device copy with account work? Download your device work first if you need to keep it.')){replaceFromCloud();location.reload();}};
    if(guest){
      bar.querySelector('[data-public-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(publicUrl);message('Public lab link copied. Anyone can open it without signing in. It does not include your answers.');}catch{message('Public lab link: '+publicUrl+' — anyone can open it without signing in.');}};
      if(context.accountSave)bar.querySelector('[data-save-account]').onclick=()=>{try{window.parent.postMessage({type:'science-labs-save-personal',work:packet()},new URL(context.appUrl).origin);}catch{message('Download your device work before signing in. This browser could not prepare the transfer.');}};
    }
    message(!deviceOk?'This browser could not keep a device copy. Keep this tab open and download your work.':conflict?'Newer account work exists. Download this copy before choosing Reload cloud copy.':context.readonly?'This assignment is closed. You can review and download your work.':guest?'No sign-in needed. Work stays in this browser. Download your report to keep or share it.':cloud?context.assignmentId?'Changes save on this device and sync to your account. Submit when your completed report is ready.':'Changes save on this device and sync to your account. This practice work is not submitted to a teacher.':'Preview work stays on this device. Download your report to keep it.');
    import('../investigations/lab-report-pdf.js').catch(()=>{});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  window.addEventListener('online',()=>save());
  window.addEventListener('beforeunload',event=>{if(cloud&&meta.dirty){event.preventDefault();event.returnValue='';}});
  document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link)return;const url=new URL(link.href);if(url.origin===location.origin&&url.pathname.endsWith(context.runtimeBase||`/api/runtime/${context.releaseId}/`)&&url.hash){event.preventDefault();window.top.location.href=context.appUrl+'/platform.html#/catalog';}},true);
}
