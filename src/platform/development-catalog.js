// The owner preview is separate from the public catalog and publication state.
export const canBrowseDevelopment=(health,me)=>health?.environment==='local'&&me?.owner===true;
export function developmentCatalog(data,requestedRelease=''){
  const releases=[...(data.releases||[])].filter(r=>!r.disabled_at&&Array.isArray(r.manifest?.labs)).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  const release=requestedRelease?releases.find(r=>r.id===requestedRelease):releases[0];
  if(requestedRelease&&!release)throw new Error('That registered development build is unavailable.');
  return {releases,release,labs:release?[...release.manifest.labs].sort((a,b)=>(a.position??0)-(b.position??0)||a.title.localeCompare(b.title)):[]};
}
export const developmentPreviewPath=(labId,releaseId)=>`/run?lab=${encodeURIComponent(labId)}&release=${encodeURIComponent(releaseId)}&preview=1`;
