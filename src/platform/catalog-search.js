const normalize=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
const choice=(value,options)=>options.includes(value)?value:'';
export function catalogFilters(params=new URLSearchParams()){
 return {q:(params.get('q')||'').trim().slice(0,160),course:params.get('course')||'',unit:params.get('unit')||'',mode:choice(params.get('mode'),['virtual','classroom','virtual-only']),access:choice(params.get('access'),['free','subscription']),sort:choice(params.get('sort'),['title'])};
}
export function catalogQuery(filters){const params=new URLSearchParams();for(const key of ['q','course','unit','mode','access','sort'])if(filters[key])params.set(key,filters[key]);return params.toString();}
export function filterCatalog(data,filters){
 const units=new Map(data.units.map(unit=>[unit.id,unit])),courses=new Map(data.courses.map(course=>[course.id,course])),words=normalize(filters.q).split(/\s+/).filter(Boolean);
 const result=data.labs.filter(lab=>{
  const unit=units.get(lab.unit_id),course=courses.get(unit?.course_id),metadata=lab.metadata||{},modes=(metadata.modes||[]).map(normalize);
  if(filters.course&&unit?.course_id!==filters.course||filters.unit&&lab.unit_id!==filters.unit||filters.access&&lab.access!==filters.access)return false;
  if(filters.mode==='virtual-only'&&!metadata.virtualOnly||filters.mode==='virtual'&&!modes.includes('virtual')&&!metadata.virtualOnly||filters.mode==='classroom'&&(metadata.virtualOnly||!modes.includes('classroom')))return false;
  const text=normalize([lab.title,lab.summary,unit?.title,course?.title,metadata.chapterTitle,...(metadata.tags||[])].join(' '));return words.every(word=>text.includes(word));
 });
 return filters.sort==='title'?result.sort((a,b)=>a.title.localeCompare(b.title)):result;
}
