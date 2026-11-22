export function publicLabUrl(id){const url=new URL('platform.html',location.href);url.hash='/run?lab='+encodeURIComponent(id);return url.href;}
export function studentAssignmentUrl(id){const url=new URL('platform.html',location.href);url.hash='/assignment/'+id;return url.href;}
let classroomScript;
export async function showClassroomShare(node,{id,title,body,url}){
  if(location.protocol!=='https:'||['localhost','127.0.0.1'].includes(location.hostname))throw new Error('Use the hosted PrepDrawer site to share with Classroom. Localhost links are available only on this computer.');
  if(!window.gapi?.sharetoclassroom){
    classroomScript||=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://apis.google.com/js/platform.js';script.async=true;script.onload=resolve;script.onerror=()=>{classroomScript=null;reject(new Error('Classroom sharing could not load. Copy the student link instead.'));};document.head.append(script);});
    await classroomScript;
  }
  if(!window.gapi?.sharetoclassroom)throw new Error('Classroom sharing is unavailable. Copy the student link instead.');
  node.replaceChildren();window.gapi.sharetoclassroom.render(node,{url:url||studentAssignmentUrl(id),title,body,size:32});
}
