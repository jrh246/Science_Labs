import {studentReportHtml,studentReportPdf,reportFilename} from './student-report.js';
import './student-report.css';

export function studentReportControls(){return '<div class="student-report-controls"><div class="student-report-buttons"><button type="button" data-report-action="pdf">Download lab report (PDF)</button><button type="button" data-report-action="print">Print lab report</button><button type="button" data-report-action="json">Download responses (JSON)</button></div><p class="student-report-status" aria-live="polite" aria-atomic="true"></p><p class="student-report-help">Your report includes the work recorded so far. Missing responses are labeled. A completed report is not an automatic grade or submission.</p></div>';}

export function installStudentReports(root,getReport){
 let busy=false,printTitle=null;
 const status=text=>{const node=root.querySelector('.student-report-status');if(node)node.textContent=text;};
 function preparePrint(){
  const report=getReport();
  if(printTitle===null)printTitle=document.title;
  document.title=reportFilename(report).replace(/\.pdf$/,'');
  document.getElementById('student-report-print')?.remove();
  document.body.insertAdjacentHTML('beforeend',studentReportHtml(report));
  document.documentElement.classList.add('student-report-printing');
  document.body.classList.add('student-report-printing');
 }
 window.addEventListener('beforeprint',preparePrint);
 window.addEventListener('afterprint',()=>{document.documentElement.classList.remove('student-report-printing');document.body.classList.remove('student-report-printing');document.getElementById('student-report-print')?.remove();if(printTitle!==null){document.title=printTitle;printTitle=null;}});
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-report-action]');if(!button||button.disabled)return;
  if(button.dataset.reportAction==='print'){preparePrint();window.print();return;}
  if(button.dataset.reportAction==='json'){
    const snapshot=getReport();
    const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;
    link.download=reportFilename(snapshot,'json');
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    status('Response data downloaded.');
    return;
  }
  if(busy)return;
  busy=true;button.disabled=true;button.textContent='Preparing PDF…';status('Preparing your lab report…');
  try{const snapshot=getReport();const {downloadReportPdf}=await import('./lab-report-pdf.js');await downloadReportPdf(studentReportPdf(snapshot),reportFilename(snapshot));status('PDF report downloaded with your recorded work.');}
  catch(error){console.error('Lab report export failed',error);status('The PDF could not be generated. Use Print lab report to print or save your work as a PDF.');}
  finally{busy=false;for(const control of root.querySelectorAll('[data-report-action="pdf"]')){control.disabled=false;control.textContent='Download lab report (PDF)';}}
 });
}
