export function downloadDeviceWork(){
  const storage={};for(const key of Object.keys(localStorage))if(key==='cell-lab'||key.startsWith('cell-lab:development:')||key.startsWith('science-labs:'))storage[key]=localStorage.getItem(key);
  const url=URL.createObjectURL(new Blob([JSON.stringify({format:'science-labs-device-work',version:1,storage},null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='science-labs-device-work.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
