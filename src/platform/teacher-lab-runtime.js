export function mountTeacherLab(context,getAnswers,setAnswers){
  if(!context.teacherLab)return;
  const snapshot=context.teacherLab,content=snapshot.content;
  const intro=document.createElement('section');intro.className='teacher-lab-intro';intro.setAttribute('aria-label','Your teacher’s lab');
  const eyebrow=document.createElement('p');eyebrow.textContent=snapshot.preview?'PRIVATE DRAFT PREVIEW':`YOUR TEACHER’S LAB · REVISION ${snapshot.revision}`;
  const title=document.createElement('h1');title.textContent=content.title;intro.append(eyebrow,title);
  const directions=document.createElement('p');directions.className='teacher-directions';directions.textContent=content.directions;intro.append(directions);
  if(content.learningGoals.length){const heading=document.createElement('h2');heading.textContent='What you will explain';const list=document.createElement('ul');for(const goal of content.learningGoals){const item=document.createElement('li');item.textContent=goal;list.append(item);}intro.append(heading,list);}
  const info=document.createElement('p');info.textContent='Complete the original investigation, then answer your teacher’s questions below. Both parts are included in your lab report.';intro.append(info);
  const panel=document.createElement('section');panel.className='teacher-lab-questions';panel.setAttribute('aria-label','Teacher questions');
  const heading=document.createElement('h2');heading.textContent='Your teacher’s questions';panel.append(heading);
  const saved=document.createElement('p');saved.setAttribute('role','status');saved.setAttribute('aria-live','polite');
  for(const question of content.questions){
    const label=document.createElement('label');label.textContent=question.prompt+(question.required?' (required)':' (optional)');
    const input=document.createElement('textarea');input.maxLength=20000;input.rows=4;input.value=getAnswers()[question.id]||'';input.disabled=Boolean(context.readonly);input.required=question.required;
    input.addEventListener('input',()=>{try{setAnswers({...getAnswers(),[question.id]:input.value});saved.textContent='Your response is saved on this device. Use Save progress to check its account save.';}catch{saved.textContent='This device could not save the response. Keep this tab open and download your report.';}});
    label.append(input);panel.append(label);
  }
  if(!content.questions.length){const note=document.createElement('p');note.textContent='Your teacher did not add extra questions to this version.';panel.append(note);}
  panel.append(saved);document.querySelector('.platform-work').after(intro);document.body.append(panel);
  const style=document.createElement('style');style.textContent='.teacher-lab-intro,.teacher-lab-questions{max-width:1100px;margin:24px auto;padding:24px;background:#f0f5eb;border:1px solid #b6c9af;border-radius:12px;font:16px/1.6 system-ui;color:#203f38}.teacher-lab-intro h1{font-size:30px;line-height:1.25}.teacher-lab-intro h2,.teacher-lab-questions h2{font-size:21px}.teacher-directions{white-space:pre-wrap}.teacher-lab-questions label{display:block;margin:20px 0}.teacher-lab-questions textarea{display:block;width:100%;font:inherit;min-height:110px;margin-top:8px;padding:12px;border:1px solid #9bb7aa;border-radius:6px;box-sizing:border-box}.teacher-lab-questions textarea:focus-visible{outline:3px solid #cf842c;outline-offset:2px}@media(max-width:600px){.teacher-lab-intro,.teacher-lab-questions{margin:16px 12px;padding:18px}}@media print{.teacher-lab-intro,.teacher-lab-questions{display:none!important}}';document.head.append(style);
}
