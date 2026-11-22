import {catalogFilters,catalogQuery,filterCatalog} from './catalog-search.js';
function options(items,selected,e){return items.map(([value,label])=>`<option value="${e(value)}"${value===selected?' selected':''}>${e(label)}</option>`).join('');}
function courseOptions(data,filters,e){return options([['','All courses'],...data.courses.filter(course=>data.labs.some(lab=>data.units.some(unit=>unit.id===lab.unit_id&&unit.course_id===course.id))).map(course=>[course.id,course.title])],filters.course,e);}
function unitOptions(data,filters,e){return options([['','All units'],...data.units.filter(unit=>(!filters.course||unit.course_id===filters.course)&&data.labs.some(lab=>lab.unit_id===unit.id)).map(unit=>[unit.id,unit.title])],filters.unit,e);}
function results(data,filters,{e,card,owner}){
 const labs=filterCatalog(data,filters),count=`${labs.length} ${labs.length===1?'lab':'labs'}${labs.length===data.labs.length?' available':' found out of '+data.labs.length}`;
 let body;
 if(!data.labs.length)body='<div class="panel empty"><h2>The library is being prepared.</h2><p>Published labs will appear here.'+(owner?' Use Manage publishing to choose the first labs.':'')+'</p></div>';
 else if(!labs.length)body='<div class="panel empty"><h2>No labs match these filters.</h2><p>Try another topic or clear your filters to see all available labs.</p><button type="button" data-catalog-clear>Clear filters</button></div>';
 else if(filters.sort==='title')body='<div class="card-grid">'+labs.map(card).join('')+'</div>';
 else body=data.courses.map(course=>{const groups=data.units.filter(unit=>unit.course_id===course.id).map(unit=>{const items=labs.filter(lab=>lab.unit_id===unit.id);return items.length?'<section class="catalog-unit"><h3>'+e(unit.title)+'</h3><div class="card-grid">'+items.map(card).join('')+'</div></section>':'';}).join('');return groups?'<section><h2>'+e(course.title)+'</h2>'+groups+'</section>':'';}).join('');
 return '<p role="status" aria-live="polite" aria-atomic="true" data-catalog-count>'+e(count)+'</p>'+body;
}
export function catalogBrowser(data,filters,config){
 const {e,teaching}=config;
 return `<section aria-label="Find labs"><form class="panel catalog-search" data-catalog-search role="search"><label class="catalog-search-field">Search labs<input type="search" name="q" value="${e(filters.q)}" maxlength="160" placeholder="Try DNA, ecosystems, or a lab title" aria-controls="catalog-results"></label><div class="catalog-filters"><label>Course<select name="course" aria-label="Course">${courseOptions(data,filters,e)}</select></label><label>Unit<select name="unit" aria-label="Unit">${unitOptions(data,filters,e)}</select></label><label>Lab format<select name="mode" aria-label="Lab format">${options([['','All formats'],['virtual','Virtual'],['classroom','Classroom'],['virtual-only','Virtual only']],filters.mode,e)}</select></label>${teaching?'<label>Access<select name="access" aria-label="Access">'+options([['','All access'],['free','Free labs'],['subscription','Member labs']],filters.access,e)+'</select></label>':''}<label>Sort by<select name="sort" aria-label="Sort by">${options([['','Course and unit'],['title','Lab title: A to Z']],filters.sort,e)}</select></label></div><div class="toolbar"><button type="submit">Search labs</button><button type="button" class="secondary" data-catalog-clear>Clear filters</button></div></form><div id="catalog-results" data-catalog-results>${results(data,filters,config)}</div></section>`;
}
export function bindCatalogBrowser(root,data,config){
 const form=root.querySelector('[data-catalog-search]');if(!form)return;
 function apply(resetUnit=false){
  if(resetUnit)form.elements.unit.value='';
  const filters=catalogFilters(new URLSearchParams(new FormData(form)));
  form.elements.unit.innerHTML=unitOptions(data,filters,config.e);
  root.querySelector('[data-catalog-results]').innerHTML=results(data,filters,config);
  const query=catalogQuery(filters),url=new URL(location.href);url.hash='/catalog'+(query?'?'+query:'');history.replaceState(null,'',url);
 }
 form.addEventListener('submit',event=>{event.preventDefault();apply();});
 form.addEventListener('input',event=>{if(event.target.name==='q')apply();});
 form.addEventListener('change',event=>{if(event.target.tagName==='SELECT')apply(event.target.name==='course');});
 root.querySelector('[data-catalog-results]').addEventListener('click',event=>{if(event.target.closest('[data-catalog-clear]'))clear();});
 form.querySelector('[data-catalog-clear]').addEventListener('click',clear);
 function clear(){for(const element of form.elements)if(element.name)element.value='';apply();form.elements.q.focus();}
}
