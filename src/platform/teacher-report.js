import {freezeReport} from './report-document.js';

// The original lab evidence stays intact. Teacher additions have their own IDs
// and responses, and never substitute invented answers for the base activity.
export function teacherReport(report,snapshot,answers={}){
  if(!snapshot||report.teacherLab)return report;
  const frozen=freezeReport(report),base=frozen.document||frozen;
  const content=snapshot.content;
  const responses=content.questions.map(question=>({...question,response:typeof answers[question.id]==='string'?answers[question.id]:''}));
  const status=report.status==='Complete'&&responses.every(item=>!item.required||item.response.trim())?'Complete':'In progress';
  const teacherLab={teacherLabId:snapshot.teacherLabId,revisionId:snapshot.revisionId,revision:snapshot.revision,contentHash:snapshot.contentHash,baseTitle:base.title,responses};
  const sections=[...base.sections,
    {heading:'Teacher lab directions and goals',blocks:[{type:'paragraph',text:content.directions||'Use the original lab directions.'},...content.learningGoals.map(text=>({type:'paragraph',text})),{type:'paragraph',text:`${snapshot.preview?'Draft preview':'Published revision'} ${snapshot.revision}. Original investigation: ${base.title}.`}]},
    {heading:'Teacher questions',blocks:responses.length?responses.map(item=>({type:'response',prompt:item.prompt,text:item.response||'Not recorded'})):[{type:'paragraph',text:'No additional questions assigned.'}]},
  ];
  const document={...base,title:content.title,status,sections};
  return report.sections?{...frozen,...document,teacherLab}:{...frozen,title:content.title,status,teacherLab,document};
}
