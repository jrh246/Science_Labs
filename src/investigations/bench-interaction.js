import {toolAnchors} from './bench-geometry.js';

export function installBenchPlacement(app,showMessage){
 let drag=null;
 let suppressGeneratedClick=false;

 function targetAt(x,y){
  return [...app.querySelectorAll('.bench-target,.gel-loading button')].find(button=>{
   const bounds=button.getBoundingClientRect();
   return x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom;
  });
 }

 app.addEventListener('pointerdown',event=>{
  suppressGeneratedClick=false;
  const source=event.target.closest('.bench-tools [data-act^="tool-"]');
  if(!source||source.disabled||event.button!==0)return;
  drag={pointerId:event.pointerId,tool:source.dataset.act,x:event.clientX,y:event.clientY,
   moved:false,icon:source.querySelector('svg').outerHTML,ghost:null,
   anchor:toolAnchors[source.dataset.toolType]||{x:32.5,y:32.5}};
 });

 app.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointerId)return;
  if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7){
   drag.moved=true;
   app.setPointerCapture(event.pointerId);
   drag.ghost=document.createElement('div');
   drag.ghost.className='bench-drag-ghost';
   drag.ghost.innerHTML=drag.icon;
   document.body.append(drag.ghost);
  }
  if(!drag.moved)return;
  event.preventDefault();
  drag.ghost.style.transform=`translate(${event.clientX-drag.anchor.x*1.2}px,${event.clientY-drag.anchor.y*1.2}px)`;
  app.querySelectorAll('.bench-drop-hover').forEach(button=>button.classList.remove('bench-drop-hover'));
  targetAt(event.clientX,event.clientY)?.classList.add('bench-drop-hover');
 });

 function release(event,cancelled=false){
  if(!drag||event.pointerId!==drag.pointerId)return;
  const current=drag;
  drag=null;
  current.ghost?.remove();
  app.querySelectorAll('.bench-drop-hover').forEach(button=>button.classList.remove('bench-drop-hover'));
  if(app.hasPointerCapture(event.pointerId))app.releasePointerCapture(event.pointerId);
  if(!current.moved)return;
  suppressGeneratedClick=true;
  if(cancelled)return;
  const target=targetAt(event.clientX,event.clientY);
  if(!target){showMessage('Place the tool tip on its marked work site. You can also select the tool, then select the site.');return;}
  const action=target.dataset.act;
  app.querySelector(`[data-act="${current.tool}"]`)?.click();
  const destination=app.querySelector(`[data-act="${action}"]`);
  if(destination&&!destination.disabled)destination.click();
  else showMessage('Choose the current tool and an empty work site.');
 }

 app.addEventListener('pointerup',event=>release(event));
 app.addEventListener('pointercancel',event=>release(event,true));
 app.addEventListener('click',event=>{
  if(!suppressGeneratedClick||event.detail===0)return;
  suppressGeneratedClick=false;
  event.preventDefault();
  event.stopImmediatePropagation();
 },true);
}
