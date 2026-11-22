// Activate a deliberate touch tap once, including a tap immediately after dragging.
// Browsers can suppress compatibility clicks after a pointer-drag gesture.
// Mouse and keyboard activation continue to use the button's native click.
export function installTouchButtons(root){
 let tap=null,generatedClick=false;
 root.addEventListener('pointerdown',event=>{
  generatedClick=false;
  const button=event.target.closest('button');
  tap=event.pointerType==='touch'&&button&&!button.disabled?{id:event.pointerId,button,x:event.clientX,y:event.clientY}:null;
 },true);
 root.addEventListener('pointermove',event=>{if(tap&&tap.id===event.pointerId&&Math.hypot(event.clientX-tap.x,event.clientY-tap.y)>8)tap=null;},true);
 root.addEventListener('pointercancel',()=>{tap=null;},true);
 root.addEventListener('pointerup',event=>{
  const current=tap;tap=null;
  if(!current||current.id!==event.pointerId||!current.button.isConnected||current.button.disabled)return;
  const at=document.elementFromPoint(event.clientX,event.clientY)?.closest('button');
  if(at!==current.button)return;
  // The native compatibility click can hit a replacement button after rendering.
  generatedClick=true;
  // Programmatic click runs the same action and readiness checks as keyboard/mouse.
  current.button.click();
 },true);
 // A compatibility mousedown can target newly rendered artwork and blur the
 // field just focused by the tap action, before the click guard can run.
 // A real new mouse/touch pointerdown resets this flag, so its focus remains native.
 root.addEventListener('mousedown',event=>{
  if(generatedClick&&event.isTrusted){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 root.addEventListener('click',event=>{
  if(generatedClick&&event.isTrusted&&event.detail>0){generatedClick=false;event.preventDefault();event.stopImmediatePropagation();return;}
 },true);
 return {suppressGeneratedClick(){generatedClick=true;}};
}
