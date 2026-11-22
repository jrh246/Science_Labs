const empty='Not recorded';
export const reportText=value=>value===null||value===undefined||value===''?empty:String(value);
const escape=value=>reportText(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function reportFilename(report,format='pdf'){
 const clean=String(report.student.name||'').normalize('NFKC').replace(/[<>:"/\\|?*\p{Cc}\p{Cf}]/gu,' ').trim().replace(/\s+/gu,'-').replace(/-+/g,'-').replace(/^[.\s-]+|[.\s-]+$/g,'');
 const name=[...clean].slice(0,80).join('').replace(/[.\s-]+$/g,'');
 const suffix=format==='json'?'responses.json':format==='txt'?'lab-report.txt':'lab-report.pdf';
 return `${report.labId}${name?'-'+name:''}-${suffix}`;
}
export function formatReportDateTime(value, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC') {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Not recorded';
  const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric',
    minute: '2-digit', hour12: true, timeZoneName: 'short', timeZone };
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date).replace(/[\u00a0\u202f]/g, ' ');
  } catch {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date).replace(/[\u00a0\u202f]/g, ' ');
  }
}

export function studentReportText(report) {
  const lines = [report.title, `Name: ${report.student.name || 'Not provided'}`,
    `Class / period: ${report.student.class || 'Not provided'}`, `Status: ${report.status}`,
    `Exported: ${report.exportedAtDisplay}`, '', report.question];
  for (const part of report.sections) {
    lines.push('', part.heading);
    for (const block of part.blocks) {
      if (block.type === 'table') {
        lines.push(block.columns.join(' | '), ...block.rows.map(row => row.map(reportText).join(' | ')));
      } else if (block.type === 'response') {
        lines.push(block.prompt, block.text, '');
      } else {
        lines.push(block.text);
      }
    }
  }
  lines.push('', 'Recorded on this device. Written explanations are available for teacher review.');
  return lines.join('\n');
}

export function reportSnapshot(lab,state,sections,{complete=Boolean(state.complete),exportedAt=new Date().toISOString(),timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}={}){
 const exportedAtDisplay=formatReportDateTime(exportedAt,timeZone);
 return structuredClone({schemaVersion:2,labId:lab.id,title:lab.title,question:lab.question,student:{name:state.studentName||'',class:state.studentClass||''},status:complete?'Complete':'In progress',grading:'not_graded',exportedAt,exportTimeZone:timeZone,exportedAtDisplay,sections});
}
export const paragraph=text=>({type:'paragraph',text:reportText(text)});
export const response=(prompt,text)=>({type:'response',prompt,text:reportText(text)});
export const table=(columns,rows)=>({type:'table',columns,rows});
export const section=(heading,...blocks)=>({heading,blocks});

export function studentReportHtml(r){
 const render=block=>block.type==='table'?`<table><thead><tr>${block.columns.map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row=>`<tr>${row.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:block.type==='response'?`<div class="student-report-response${block.prompt.length+block.text.length<600?' short-response':''}"><h3>${escape(block.prompt)}</h3><p>${escape(block.text)}</p></div>`:`<p>${escape(block.text)}</p>`;
 const renderSection=s=>{const heading=`<h2>${escape(s.heading)}</h2>`;return `<section>${s.keepFirst?`<div class="student-report-sample-summary">${heading}${s.blocks.slice(0,s.keepFirst).map(render).join('')}</div>${s.blocks.slice(s.keepFirst).map(render).join('')}`:heading+s.blocks.map(render).join('')}</section>`;};
 return `<article class="student-report-print" id="student-report-print" aria-label="Student lab report"><header><p class="report-eyebrow">SCIENCE LABS / STUDENT LAB REPORT</p><h1>${escape(r.title)}</h1><p><strong>Name:</strong> ${escape(r.student.name||'Not provided')}<br><strong>Class / period:</strong> ${escape(r.student.class||'Not provided')}<br><strong>Status:</strong> ${escape(r.status)} · ${escape(r.gradingDisplay||'Not graded')}<br><strong>Exported:</strong> ${escape(r.exportedAtDisplay)}</p><p>${escape(r.question)}</p><p class="report-note">${escape(r.recordNote||'Recorded on this device. Not graded or submitted automatically.')}</p></header>${r.sections.map(renderSection).join('')}</article>`;
}

export function studentReportPdf(r){
 let responseId=0;
 const bodyCell=value=>({text:reportText(value),margin:[0,1,0,1]});
 const render=block=>block.type==='table'?{table:{headerRows:1,keepWithHeaderRows:1,widths:block.columns.map(()=>'*'),body:[block.columns.map(text=>({text,bold:true,fillColor:'#eaf0e8',margin:[0,3,0,3]})),...block.rows.map(row=>row.map(bodyCell))]},layout:'lightHorizontalLines',fontSize:9,margin:[0,3,0,9]}:block.type==='response'?(()=>{const id=++responseId;return{stack:[{id:`report-prompt-${id}`,text:block.prompt,bold:true,margin:[0,0,0,4]},{id:`report-answer-${id}`,text:block.text}],unbreakable:block.prompt.length+block.text.length<600,margin:[0,0,0,9]};})():{stack:[{text:block.text}],unbreakable:block.text.length<400,margin:[0,0,0,7]};
 const renderSection=s=>{const heading={text:s.heading,style:'heading',...(s.blocks[0]?.type==='response'?{id:`report-section-before-${responseId+1}`}:{})},first=s.blocks[0],keep=s.keepFirst||((first?.type==='paragraph'&&first.text.length<1500||first?.type==='response'&&first.prompt.length+first.text.length<600)?1:0);return keep?[{stack:[heading,...s.blocks.slice(0,keep).map(render)],unbreakable:true},...s.blocks.slice(keep).map(render)]:[heading,...s.blocks.map(render)];};
 return {pageBreakBefore:(node,container)=>node.id?.startsWith('report-section-before-')?!container.getFollowingNodesOnPage().some(next=>next.id===node.id.replace('report-section-before-','report-answer-')):node.id?.startsWith('report-prompt-')&&!container.getFollowingNodesOnPage().some(next=>next.id===node.id.replace('report-prompt-','report-answer-')),info:{title:r.title+' - Student lab report',author:'Science Labs',subject:'Student observations and explanations'},pageSize:'LETTER',pageMargins:[42,42,42,46],defaultStyle:{font:'Roboto',fontSize:10,lineHeight:1.15,color:'#203d35'},styles:{heading:{fontSize:14,bold:true,color:'#24594b',margin:[0,12,0,6]}},footer:(page,pages)=>({text:`Science Labs | ${r.status} | ${page} / ${pages}\n${r.recordNote||'Recorded on this device. Not graded or submitted automatically.'}`,alignment:'right',fontSize:7.5,color:'#56675e',margin:[42,8,42,0]}),content:[
  {text:'SCIENCE LABS / STUDENT LAB REPORT',fontSize:9,color:'#56675e',margin:[0,0,0,8]},
  {text:r.title,fontSize:23,bold:true,margin:[0,0,0,12]},
  {text:`Name: ${r.student.name||'Not provided'}\nClass / period: ${r.student.class||'Not provided'}\nStatus: ${r.status} | ${r.gradingDisplay||'Not graded'}\nExported: ${r.exportedAtDisplay}`,margin:[0,0,0,12]},
  {text:r.question,bold:true,margin:[0,0,0,8]},
  ...r.sections.flatMap(renderSection)
 ]};
}
