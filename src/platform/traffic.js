let navigation=0,lastEvent='',memorySession=null;
export function trafficNavigation(){navigation++;}
export function trafficOptOut(){try{return localStorage.getItem('science-platform-traffic-opt-out')==='true';}catch{return true;}}
export function setTrafficOptOut(value){localStorage.setItem('science-platform-traffic-opt-out',String(value));}
function source(){
  let host;try{host=new URL(document.referrer).hostname;}catch{return 'direct';}
  if(host===location.hostname)return 'direct';
  if(/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com)$/.test(host))return 'search';
  if(/(^|\.)(facebook\.com|instagram\.com|reddit\.com|linkedin\.com|tiktok\.com|x\.com|t\.co)$/.test(host))return 'social';return 'other';
}
export function trackPage(page,labId,{base='',me,health}={}){
  if(!health?.metricsEnabled||me?.staff?.active||me?.owner||trafficOptOut()||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
  const key=navigation+':'+page+':'+(labId||'');if(key===lastEvent)return;lastEvent=key;
  try{
    let visit;try{visit=JSON.parse(sessionStorage.getItem('science-platform-traffic-session')||'null');}catch{}
    visit||=memorySession;const now=Date.now();
    if(!visit||now-visit.last>30*60*1000)visit={id:crypto.randomUUID(),last:now};visit.last=now;memorySession=visit;
    try{sessionStorage.setItem('science-platform-traffic-session',JSON.stringify(visit));}catch{}
    const body={eventId:crypto.randomUUID(),sessionId:visit.id,page,source:source(),device:innerWidth<=600?'phone':innerWidth<=1024?'tablet':'desktop',...(labId?{labId}:{})};
    // The response never controls lab access or saving. No URL, account ID,
    // writing, identity fields, class IDs, or invitation tokens are submitted.
    fetch(base+'/api/traffic',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).then(response=>response.text()).catch(()=>{});
  }catch{}
}
