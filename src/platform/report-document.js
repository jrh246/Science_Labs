import {reportSnapshot,section,paragraph,response,table} from '../investigations/student-report.js';
import {extractionReportDocument} from '../investigations/extraction-report.js';

// Freeze the human-readable evidence with the lab release. Future portal code
// can format these sections without replacing old prompts or model-limit text.
export function freezeReport(report){
  if(report.sections||report.document)return report;
  let document;
  if(report.labId==='dna-replication')document=extractionReportDocument(report);
  else if(report.labId==='genetic-information'){
    document=reportSnapshot({id:report.labId,title:report.title,question:'How does a cell use information in DNA to build an amino-acid chain?'},
      {studentName:report.student.name,studentClass:report.student.class,complete:report.status==='Complete'},[
        section('Initial prediction',paragraph(report.prediction||'Not recorded')),
        section('Results from the model',table(['Process','Recorded result'],report.results.map(item=>[item.process,item.result]))),
        section('Evidence of learning and revisions',table(['Learning goal','Recorded evidence','Result'],report.evidence.map(item=>[item.concept,item.summary+(item.review?' Revisited: '+item.review:''),item.statusLabel]))),
        section('Concept checks',...report.checkpoints.map(item=>response(item.prompt,`${item.response}\n${item.result}${item.feedback?'\nFeedback: '+item.feedback:''}`))),
        section('Written explanations',...report.explanations.map(item=>response(item.prompt,item.response||'Not recorded'))),
        section('Model and evidence limits',paragraph(report.limits)),
      ],{exportedAt:report.exportedAt,timeZone:report.exportTimeZone});
  }
  return document?{...report,document}:report;
}
