import {platformReport} from './platform/runtime-bridge.js';
import {evidenceSection,revisionSection} from './investigations/report-evidence.js';
import {feedbackSummaries,recordedFeedback} from './investigations/report-feedback.js';
import {labConfig as config} from './data/labConfig.js';
import {reasoningQuestions,osmosisModelNote} from './data/osmosis-learning.js';
import {ids,correct,canComplete,predictionRecord} from './state.js';
import {reportSnapshot,section,paragraph,response,table} from './investigations/student-report.js';

export function osmosisStudentReport(state,options={}){
 const measured=state.run.filter(tube=>state.initial[tube.id]&&state.final[tube.id]&&state.elapsed).length;
 const checked=state.run.filter(tube=>state.valid[tube.id]&&correct(state.run,tube.id,state.answers[tube.id])).length;
 const writing=reasoningQuestions.map(question=>({id:question.id,prompt:question.prompt,response:state.reasoning?.[question.id]||''}));
 const explained=writing.filter(answer=>answer.response.trim()).length;
 const prediction=predictionRecord(state);
 const predictionBlocks=[response('Prediction',state.prediction)];
 if(prediction&&prediction.text!==state.prediction)predictionBlocks.push(response('First recorded prediction',prediction.text));
 predictionBlocks.push(paragraph(prediction?.timing==='before-experiment'
  ?'The first prediction was recorded before the experiment ran.'
  :prediction?'The first available prediction was recorded after results were available.'
  :'An earlier prediction was not recorded for this attempt.'));
 const observations=state.run.map(tube=>[
  tube.id,config.beakers.find(beaker=>beaker.id===tube.id).sugarPercent,tube.sugarPercent,
  state.initial[tube.id]?tube.initialMass.toFixed(2):null,
  state.final[tube.id]&&state.elapsed?tube.finalMass.toFixed(2):null,
  state.answers[tube.id],state.valid[tube.id]&&correct(state.run,tube.id,state.answers[tube.id])?'Correct':state.attempts[tube.id]?'Needs review':'Not checked'
 ]);
 const evidence=[
  {id:'measurements',goal:'Compare concentration and mass',purpose:'Use the inside and outside sugar concentrations with the measured masses.',status:measured?'Results recorded':'Awaiting measurements',summary:`${measured} of 5 tubes have initial and final masses recorded.`},
  {id:'signed-change',goal:'Calculate mass change',purpose:'Subtract initial mass from final mass. Keep the sign.',status:checked===5?'Calculations checked':'In progress',summary:`${checked} of 5 current answers pass the calculation check.`},
  {id:'water-movement',goal:'Explain water movement',purpose:'Connect concentration differences, mass changes, and the comparison limits.',status:explained===3?'Explanations recorded':'In progress',summary:`${explained} of 3 explanations are recorded for teacher review.`}
 ];
 const report=reportSnapshot({id:'osmosis-homeostasis',version:2,title:'Osmosis and Cell Homeostasis',question:'How do different sugar concentrations affect water movement across a selectively permeable membrane?'},state,[
  section('Your prediction',...predictionBlocks),evidenceSection(evidence),
  section('Investigation conditions',paragraph(`Dialysis tubing represents a cell. Experiment duration: ${state.elapsed?config.experimentHours+' hours elapsed':'not yet completed'}. Concentration is shown as % w/v, or grams of sugar per 100 mL of solution. The model treats added sugar as having no effect on the stated volume.`)),
  section('Your measurements and calculations',paragraph('Only recorded masses are included. Your entered mass change is preserved.'),table(['Tube','Outside sugar (%)','Inside sugar (%)','Initial mass (g)','Final mass (g)','Your change (g)','Calculation feedback'],observations)),
  section('Your explanations',...writing.map(answer=>response(answer.prompt,answer.response))),revisionSection(state),
  section('Model and evidence limits',paragraph(osmosisModelNote),paragraph('Water crosses the modeled membrane while sugar stays on its side. The 24-hour experiment uses a faster clock. A and D have equal starting sugar concentrations inside and outside. Small measured mass changes do not mean water stopped moving.'))
 ],{complete:Boolean(state.complete)&&canComplete(state),...options});
 report.evidence=evidence;
 report.responses=writing;
 report.prediction={current:state.prediction||'',initial:prediction,unrecorded:!prediction};
 report.feedback=feedbackSummaries(state);
 report.data={source:config.dataStatus,observations,feedbackHistory:recordedFeedback(state)};
 return platformReport(report);
}
