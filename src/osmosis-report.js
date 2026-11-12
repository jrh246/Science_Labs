import {evidenceSection,revisionSection} from './investigations/report-evidence.js';
import {feedbackSummaries,recordedFeedback} from './investigations/report-feedback.js';
import {labConfig as c} from './data/labConfig.js';
import {ids,all,correct} from './state.js';
import {reportSnapshot,section,paragraph,table} from './investigations/student-report.js';

export function osmosisStudentReport(s,options={}){
 const complete=s.step===6&&all(s.initial)&&all(s.final)&&ids.every(id=>correct(s.run,id,s.answers[id]));
 const report = reportSnapshot({id:'osmosis-homeostasis',title:'Osmosis and Cell Homeostasis',question:'How do different sugar concentrations affect water movement across a selectively permeable membrane?'},s,[
  section('Investigation conditions',paragraph(`Dialysis tubing represents a cell. Experiment duration: ${s.elapsed?c.experimentHours+' hours elapsed':'not yet completed'}. Sugar concentrations use % w/v, with the classroom approximation that adding sugar does not change the stated volume.`)),
  section('Your measurements and calculations',paragraph('Only recorded masses are included. Your entered mass change is preserved, including a response that needs revision.'),table(['Tube','Outside sugar (%)','Inside sugar (%)','Initial mass (g)','Final mass (g)','Your change (g)','Calculation feedback'],s.run.map(t=>[t.id,c.beakers.find(b=>b.id===t.id).sugarPercent,t.sugarPercent,s.initial[t.id]?t.initialMass.toFixed(2):null,s.final[t.id]&&s.elapsed?t.finalMass.toFixed(2):null,s.answers[t.id],s.valid[t.id]&&correct(s.run,t.id,s.answers[t.id])?'Correct':s.attempts[t.id]?'Needs review':'Not checked']))),
  section('About this report',paragraph('Completion records the procedure and mass-change calculations. Predictions and written explanations are not collected in this version of the lab. This report does not assign a grade.')),
  section('Model and evidence limits',paragraph('The before-and-after masses are based on teacher-supplied observations with illustrative measurement variation; they are not calculated predictions of osmosis. Water crosses the modeled membrane while sugar is retained. The 24-hour experiment uses an accelerated clock.'))
 ],{complete,...options});
 const measured=s.run.filter(t=>s.initial[t.id]&&s.final[t.id]&&s.elapsed).length;
 const checked=s.run.filter(t=>s.valid[t.id]&&correct(s.run,t.id,s.answers[t.id])).length;
 report.evidence=[
  {id:'measurements',goal:'Compare concentration and mass',purpose:'Use the inside and outside sugar concentrations with the measured masses.',status:measured?'Results recorded':'Awaiting measurements',summary:`${measured} of 5 tubes have initial and final masses recorded.`},
  {id:'signed-change',goal:'Calculate mass change',purpose:'Calculate final mass minus initial mass and keep the sign.',status:checked===5?'Calculations checked':'In progress',summary:`${checked} of 5 current answers pass the calculation check.`},
  {id:'water-movement',goal:'Explain water movement',purpose:'Use the concentration comparison and mass changes to explain water movement.',status:'Reasoning record unavailable',summary:'Written explanations can be supplied with the classroom worksheet.'}
 ];
 report.feedback=feedbackSummaries(s);
 report.data={source:'Virtual model',observations:report.sections[1].blocks[1].rows,feedbackHistory:recordedFeedback(s)};
 report.sections.splice(0,0,evidenceSection(report.evidence),revisionSection(s));
 return report;
}
