import {membership} from './membership.js';
import {assert,text} from './support.js';
import {publishedLab} from './access.js';
import {releaseReader,releaseContentType,runtimeHtml} from './release-files.js';
const publicCapability='public-lab-runtime-v1';
export async function publicLab(db,labId){
  const lab=await publishedLab(db,text(labId,'Lab',100));
  assert(lab.access==='free',402,'This lab requires teacher access. Free labs can be opened without an account.');
  assert([publicCapability,'membership-features-v1'].every(flag=>lab.manifest.capabilities?.includes(flag)),409,'The site owner needs to select the current membership-aware public runtime for this lab.');
  return lab;
}
function publicResource(lab,file){
  if(file.startsWith('assets/')||['manifest.json','icons/lab.svg','THIRD_PARTY_NOTICES.txt'].includes(file))return true;
  const declared=(lab.metadata.resources||[]).map(item=>item.url.replace(/^\.\//,''));
  if(declared.includes(file)||file.startsWith('resources/'+lab.id+'-'))return true;
  return ['light-photosynthesis','yeast-fermentation'].includes(lab.id)&&['resources/fermentation-model-evidence.html','resources/light-photosynthesis-worksheet.pdf','resources/yeast-fermentation-worksheet.pdf'].includes(file);
}
export function installPublicRuntime(app,db,config,{session}={}){
  const read=releaseReader(config);
  app.get('/api/public/labs/:labId',async(req,res)=>{
    const lab=await publicLab(db,req.params.labId),meta=lab.manifest.labs.find(item=>item.id===lab.id);assert(meta,404,'Public lab not found.');
    const url=new URL(`${config.apiUrl}/api/public/labs/${lab.id}/runtime/${lab.release_id}/${meta.entry}`);if(meta.entry==='investigation.html')url.searchParams.set('lab',lab.id);
    if(req.query.sources){const sources=text(req.query.sources,'Sources',200);assert(/^(virtual|classroom)(,(virtual|classroom))*$/.test(sources),400,'Invalid lab setup.');url.searchParams.set('sources',sources);}
    res.json({labId:lab.id,title:lab.title,summary:lab.summary,releaseId:lab.release_id,url:url.href,public:true});
  });
  app.get('/api/public/labs/:labId/runtime/:releaseId/{*file}',async(req,res)=>{
    const lab=await publicLab(db,req.params.labId);assert(lab.release_id===req.params.releaseId,409,'The public lab has been updated. Keep or download your work, then reopen the current public link.');
    const file=Array.isArray(req.params.file)?req.params.file.join('/'):req.params.file;
    const meta=lab.manifest.labs.find(item=>item.id===lab.id);assert(meta,404,'Lab not found.');
    const html=file===meta.entry||file==='activity.html'&&['light-photosynthesis','yeast-fermentation'].includes(lab.id);
    assert(html||publicResource(lab,file),404,'This resource is not part of the public lab.');
    if(file===meta.entry&&meta.entry==='investigation.html')assert(req.query.lab===lab.id,404,'This address is for a different lab.');
    const release={id:lab.release_id,manifest:lab.manifest,disabled_at:lab.disabled_at};let bytes=await read(release,file);res.type(releaseContentType(file));
    if(html){const user=await session?.(req),accountSave=Boolean(user?.emailVerified&&(await membership(db,user)).cloudPractice);const runtimeBase=`/api/public/labs/${lab.id}/runtime/${lab.release_id}/`;
      bytes=runtimeHtml(res,bytes,{mode:'public',accountSave,labId:lab.id,releaseId:lab.release_id,runtimeBase,appUrl:config.appUrl,cloudRevision:0,storage:{},readonly:false},config);
    }
    res.send(bytes);
  });
}
