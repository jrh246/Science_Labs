import {escape} from './visuals.js';
import './report-identity.css';

export function reportIdentityText(s){
 return `Name: ${s.studentName || 'Not provided'}\nClass / period: ${s.studentClass || 'Not provided'}`;
}
export function reportIdentityHtml(s){
 return `<p class="report-identity-summary"><strong>Name:</strong> ${escape(s.studentName || 'Not provided')}<br><strong>Class / period:</strong> ${escape(s.studentClass || 'Not provided')}</p>`;
}
export function reportIdentityFields(s){
 return `<fieldset class="report-identity"><legend>Report details (optional)</legend><div class="report-identity-inputs"><label>Name (optional)<input type="text" data-report-field="studentName" value="${escape(s.studentName)}" autocomplete="off"></label><label>Class / period (optional)<input type="text" data-report-field="studentClass" value="${escape(s.studentClass)}" autocomplete="off"></label><p>These details appear on your report and save with this lab on this device.</p></div><div class="report-identity-print">${reportIdentityHtml(s)}</div></fieldset>`;
}
