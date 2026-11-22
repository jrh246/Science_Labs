const drafts=new Map();let active=null;
const questionId=()=>`q_${crypto.randomUUID().replaceAll('-','')}`;
window.addEventListener('beforeunload',event=>{if([...drafts.values()].some(draft=>draft.dirty)){event.preventDefault();event.returnValue='';}});

export async function teacherAuthoringRoute(path,parts,ctx){
  const {api,e,link,button,heading,shell,me,health,status}=ctx;
  if(path!=='/my-labs'&&parts[0]!=='teacher-lab'){active=null;return false;}
  if(path==='/my-labs'){
    active=null;const [labs,catalog]=await Promise.all([api('/teacher/labs'),api('/catalog')]);if(ctx.isCurrent&&!ctx.isCurrent())return true;
    shell(heading('Teacher authoring','My labs','Make a private copy, add your teaching directions and questions, then preview and publish a fixed version.')+
      `<div class="notice">The original investigation keeps its core questions, science checks, interactions, and visuals. Your additional directions and questions become part of the student’s completed report.</div>`+
      (me.organizations.length?`<form class="panel narrow" data-teacher-copy><h2>Copy a library lab</h2><label>Original lab<select name="labId" aria-label="Original lab" required><option value="">Choose a published lab</option>${catalog.labs.map(lab=>`<option value="${e(lab.id)}">${e(lab.title)}</option>`).join('')}</select></label><button>Make my private copy</button><p role="alert" class="error"></p></form>`:`<p>${link('/classes','Create your teaching workspace to start a copy.')}</p>`)+
      `<div class="card-grid">${labs.map(lab=>`<article class="panel"><span class="pill">Private draft ${lab.draft_version}${lab.published_revision_id?' · Published version available':''}</span><h2>${e(lab.draft.title)}</h2><p>Original: ${e(lab.base_title)}</p>${link('/teacher-lab/'+lab.id,'Edit my copy','button')}${lab.published_revision_id?`<p>${link('/run?teacherRevision='+lab.published_revision_id,'Preview published version')}</p>`:''}</article>`).join('')||'<p>No private copies yet.</p>'}</div>`,'My labs');
    const form=document.querySelector('[data-teacher-copy]');if(form)form.onsubmit=async event=>{event.preventDefault();const control=form.querySelector('button');control.disabled=true;try{const lab=await api('/teacher/labs',{labId:new FormData(form).get('labId')});location.hash='/teacher-lab/'+lab.id;}catch(error){form.querySelector('[role="alert"]').textContent=error.message;}finally{control.disabled=false;}};
    return true;
  }
  const data=await api('/teacher/labs/'+parts[1]);if(ctx.isCurrent&&!ctx.isCurrent())return true;
  let state=drafts.get(data.lab.id);
  if(!state?.dirty){state={content:structuredClone(data.lab.draft),version:data.lab.draft_version,dirty:false};drafts.set(data.lab.id,state);}
  active=state;
  function readContent(){
    const form=document.querySelector('[data-teacher-editor]');
    return {title:form.elements.title.value,directions:form.elements.directions.value,learningGoals:form.elements.learningGoals.value.split('\n').map(x=>x.trim()).filter(Boolean),questions:[...form.querySelectorAll('[data-question]')].map(row=>({id:row.dataset.question,prompt:row.querySelector('textarea').value,required:row.querySelector('input').checked}))};
  }
  function markDirty(){state.content=readContent();state.dirty=true;const node=document.querySelector('[data-draft-status]');if(node)node.textContent='Unsaved changes. Save before previewing or publishing.';}
  async function save(){
    state.content=readContent();const saved=await api('/teacher/labs/'+data.lab.id,{content:state.content,expectedVersion:state.version},'PUT');
    state.content=saved.draft;state.version=saved.draft_version;state.dirty=false;data.lab=saved;return saved;
  }
  function render(){
    const c=state.content;
    shell(heading('Private teacher copy',c.title,`Original investigation: ${data.base.title}. Published assignments keep their original version.`)+
      `<form data-teacher-editor><section class="panel"><label>Lab title<input name="title" maxlength="180" value="${e(c.title)}" required></label><label>Student directions<textarea aria-label="Student directions" name="directions" maxlength="12000" rows="5">${e(c.directions)}</textarea></label><label>Learning goals — one per line<textarea aria-label="Learning goals — one per line" name="learningGoals" rows="4">${e(c.learningGoals.join('\n'))}</textarea></label><p class="hint">Use two to four goals. Describe what students should explain using evidence. These goals appear above the original investigation.</p></section>`+
      `<section class="panel"><h2>Additional teacher questions</h2><p>These questions appear below the original lab. The original investigation’s required questions remain in place.</p><div data-questions>${c.questions.map((q,i)=>`<article class="teacher-question" data-question="${e(q.id)}"><label>Question ${i+1}<textarea aria-label="Question ${i+1}" maxlength="2500" rows="3" required>${e(q.prompt)}</textarea></label><label class="checkbox"><input type="checkbox" ${q.required?'checked':''}>Required before submitting</label><button type="button" class="secondary" data-teacher-action="remove-question" data-id="${e(q.id)}">Remove this question</button></article>`).join('')}</div><button type="button" class="secondary" data-teacher-action="add-question" ${c.questions.length>=8?'disabled':''}>Add a question</button></section>`+
      `<section class="panel"><div class="toolbar"><button type="submit">Save draft</button><button type="button" class="secondary" data-teacher-action="preview">Save and preview</button><button type="button" class="secondary" data-teacher-action="export">Download draft text</button><button type="button" class="secondary" data-teacher-action="reload">Reload saved draft</button></div><p data-draft-status role="status">${state.dirty?'Unsaved changes.':`Saved private draft ${state.version}.`}</p><p data-editor-error role="alert" class="error"></p></section></form>`+
      `<section class="panel"><h2>OpenAI draft assistant</h2><p>Ask for clearer directions, evidence-based goals, or follow-up questions. Suggestions do not change the original simulation or publish your lab.</p><label>What should change?<textarea aria-label="What should change?" data-ai-prompt rows="3" maxlength="6000" placeholder="Make the directions clearer for ninth graders and add a question about evidence."></textarea></label><label>Optional reference excerpt<textarea aria-label="Optional reference excerpt" data-ai-reference rows="3" maxlength="16000"></textarea></label><p class="hint">Paste source text you want considered. The assistant does not fetch OpenStax sections or websites in this version. Do not include student information.</p><button type="button" data-teacher-action="suggest" ${health.aiEnabled?'':'disabled'}>Suggest changes</button>${health.aiEnabled?'':'<p class="hint">The site owner has not enabled OpenAI yet. Manual editing, preview, and publishing are available.</p>'}<p data-ai-status role="status"></p><div data-ai-result></div>${(data.suggestions||[]).length?`<details><summary>Recent suggestions</summary>${data.suggestions.map(job=>`<div class="list-row"><span>Draft ${job.draft_version} · ${e(job.status)}${job.error?`<small>${e(job.error)}</small>`:''}</span>${job.status!=='failed'?`<button type="button" class="secondary" data-teacher-action="resume-suggestion" data-job="${job.id}">${job.status==='complete'?'Review saved suggestion':'Check suggestion'}</button>`:''}</div>`).join('')}</details>`:''}</section>`+
      `<section class="panel"><h2>Publish a fixed version</h2><p>Preview the saved draft. Check the student directions, original interaction, and final report before publishing. Publishing makes this version available for your class assignments; it does not list it in the public library.</p><label class="checkbox"><input type="checkbox" data-review="science">I checked the scientific meaning and learning goals.</label><label class="checkbox"><input type="checkbox" data-review="language">I reviewed the student wording for ninth-grade readers.</label><label class="checkbox"><input type="checkbox" data-review="interaction">I checked the interaction, visuals, and report in preview.</label><button type="button" data-teacher-action="publish">Publish version</button></section>`+
      `<section><h2>Published versions</h2>${data.revisions.map(r=>`<article class="panel list-row"><div><h3>${e(r.content.title)} · Revision ${r.revision}</h3><p>${e(new Date(r.published_at).toLocaleString())}</p></div>${link('/run?teacherRevision='+r.id,'Preview this version','button secondary')}</article>`).join('')||'<p>No version published yet.</p>'}</section>`,'Teacher lab editor');
    const form=document.querySelector('[data-teacher-editor]');form.addEventListener('input',markDirty);form.onsubmit=async event=>{event.preventDefault();try{await save();render();status('Private draft saved.');}catch(error){document.querySelector('[data-editor-error]').textContent=error.message;}};
    document.querySelector('main').addEventListener('click',async event=>{
      const control=event.target.closest('[data-teacher-action]');if(!control)return;const action=control.dataset.teacherAction;control.disabled=true;
      const errorNode=document.querySelector('[data-editor-error]');errorNode.textContent='';
      try{
        if(action==='reload'){if(!state.dirty||confirm('Replace this editor text with the saved draft? Download your draft text first if you need to keep it.')){drafts.delete(data.lab.id);await teacherAuthoringRoute(path,parts,ctx);}return;}
        if(action==='add-question'){state.content=readContent();state.content.questions.push({id:questionId(),prompt:'',required:true});state.dirty=true;render();document.querySelector('[data-questions] .teacher-question:last-child textarea')?.focus();}
        if(action==='remove-question'){state.content=readContent();state.content.questions=state.content.questions.filter(q=>q.id!==control.dataset.id);state.dirty=true;render();}
        if(action==='export'){state.content=readContent();const url=URL.createObjectURL(new Blob([JSON.stringify({format:'prepdrawer-teacher-draft',version:1,baseLabId:data.lab.base_lab_id,content:state.content},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='teacher-lab-'+data.lab.id+'-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
        if(action==='preview'){await save();active=null;location.hash='/run?teacherLab='+data.lab.id;}
        if(action==='publish'){
          if(state.dirty)throw new Error('Save and preview your changes before publishing.');
          const review=Object.fromEntries([...document.querySelectorAll('[data-review]')].map(node=>[node.dataset.review,node.checked]));
          const r=await api('/teacher/labs/'+data.lab.id+'/publish',{expectedVersion:state.version,review});data.revisions=[r,...data.revisions.filter(old=>old.id!==r.id)];render();status('Revision '+r.revision+' published for your class assignments. Existing assignments keep their version.');
        }
        if(action==='suggest'||action==='resume-suggestion'){
          const prompt=document.querySelector('[data-ai-prompt]').value,reference=document.querySelector('[data-ai-reference]').value;
          if(action==='suggest'&&!prompt.trim())throw new Error('Describe the change you want first.');
          document.querySelector('[data-ai-status]').textContent='Requesting an OpenAI suggestion. Your saved draft will stay unchanged.';
          let result=action==='resume-suggestion'?await api('/teacher/labs/'+data.lab.id+'/suggestions/'+control.dataset.job):await api('/teacher/labs/'+data.lab.id+'/suggest',{content:readContent(),expectedVersion:state.version,prompt,reference});
          if(!control.isConnected)return;const jobId=result.jobId;let polls=0;
          while(['queued','running'].includes(result.status)){
            await new Promise(resolve=>setTimeout(resolve,1500));
            result=await api('/teacher/labs/'+data.lab.id+'/suggestions/'+jobId);if(!control.isConnected)return;
            if(++polls>130)throw new Error('The suggestion is still processing. Reopen this editor and choose Check suggestion under Recent suggestions. Your saved draft is unchanged.');
          }
          if(result.status!=='complete')throw new Error(result.error||'The suggestion could not finish. Your draft is unchanged.');
          const s=result.suggestion,target=document.querySelector('[data-ai-result]');
          document.querySelector('[data-ai-status]').textContent='Suggestion ready. Review it before applying.';
          target.innerHTML=`<article class="ai-suggestion"><h3>Suggested draft</h3><p>Based on private draft ${result.baseVersion}. Review the complete suggestion before replacing your current editor text.</p><p class="verbatim">${e(s.changeSummary)}</p><h4>${e(s.content.title)}</h4><p class="verbatim">${e(s.content.directions)}</p><ul>${s.content.learningGoals.map(goal=>`<li>${e(goal)}</li>`).join('')}</ul><ol>${s.content.questions.map(q=>`<li>${e(q.prompt)} (${q.required?'required':'optional'})</li>`).join('')}</ol><p class="verbatim">${e(s.limitations)}</p><div class="toolbar"><button type="button" data-apply-suggestion>Apply to editor</button><button type="button" class="secondary" data-discard-suggestion>Discard suggestion</button></div></article>`;
          target.querySelector('[data-apply-suggestion]').onclick=()=>{state.content=s.content;state.dirty=true;render();status('Suggestion applied to the editor. Review, save, and preview before publishing.');};
          target.querySelector('[data-discard-suggestion]').onclick=()=>{target.replaceChildren();document.querySelector('[data-ai-status]').textContent='Suggestion discarded. Your draft was not changed.';};
        }
      }catch(error){errorNode.textContent=error.message;const ai=document.querySelector('[data-ai-status]');if(ai&&(action==='suggest'||action==='resume-suggestion'))ai.textContent='The suggestion was not applied. Your draft is unchanged.';}
      finally{if(control.isConnected)control.disabled=false;}
    });
  }
  render();return true;
}
