import {studentReportHtml,studentReportPdf} from './student-report.js';
import {title,labId,phases,coding,template,rna,codons,checks,explanationPrompts,limits} from './genetics-model.js';
import {escape as e} from './visuals.js';

export function formatReportDateTime(value,timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone){
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return 'Not recorded';
 const options={month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true,timeZoneName:'short',timeZone:timeZone||'UTC'};
 try{return new Intl.DateTimeFormat('en-US',options).format(date).replace(/[\u00a0\u202f]/g,' ');}
 catch{return new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(date).replace(/[\u00a0\u202f]/g,' ');}
}
export function geneticsReportFilename(report,format='pdf'){
 const clean=String(report.student?.name||'').normalize('NFKC').replace(/[<>:"\/\\|?*\p{Cc}\p{Cf}]/gu,' ').trim().replace(/\s+/gu,'-').replace(/-+/g,'-').replace(/^[.\s-]+|[.\s-]+$/g,'');
 const name=[...clean].slice(0,80).join('').replace(/[.\s-]+$/g,'');
 return `${labId}${name?'-'+name:''}-${format==='json'?'responses.json':'lab-report.pdf'}`;
}
const humanList=items=>items.length<2?items.join(''):items.slice(0,-1).join(', ')+' and '+items.at(-1);
const locationLabel=value=>value?value[0].toUpperCase()+value.slice(1):'Not selected';
const statusLabels={shown:'Shown in the model',shown_after_feedback:'Shown after feedback',in_progress:'In progress',review_needed:'Review needed',not_recorded:'Not yet recorded'};

// Group recorded choices by the concept they can support. Navigation, replay,
// and repeated clicks never become claims of learning. At stop, a tRNA error
// belongs to stop recognition rather than to amino-acid codon matching.
function conceptEvents(history){
 const groups=Object.fromEntries(['locations','enzymes','dna-pairing','rna-pairing','rna-processing','message-carrier','codon-matching','stop-signal'].map(id=>[id,[]]));
 let translated=0;
 for(const h of history){
  let kind='',id=String(h.value||''),domain=null;
  if(h.action==='place'){
   const token=id.split('@')[0];[kind,id]=token.split(':');
  }else if(h.action==='place-enzyme'){kind='tool';id=id.split('@')[0];}
  else if(['tool','base','trna'].includes(h.action))kind=h.action;
  else if(['export','load'].includes(h.action))kind='molecule';
  else if(h.action==='release')kind='release';
  if(h.action==='location')domain='locations';
  else if(kind==='tool'&&[1,2].includes(h.phase))domain='enzymes';
  else if(kind==='base'&&h.phase===1)domain='dna-pairing';
  else if(kind==='base'&&h.phase===2)domain='rna-pairing';
  else if(kind==='tool'&&h.phase===3)domain='rna-processing';
  else if(kind==='molecule'&&[3,4].includes(h.phase))domain='message-carrier';
  else if(kind==='trna'&&h.phase===4)domain=translated>=3?'stop-signal':'codon-matching';
  else if(kind==='release'&&h.phase===4)domain='stop-signal';
  if(domain)groups[domain].push({...h,component:id});
  if(kind==='trna'&&h.phase===4&&h.accepted)translated++;
 }
 return groups;
}
function learningEvidence(s,d){
 const grouped=conceptEvents(s.history||[]);
 const row=(id,concept,complete,progress,summary,review)=>{
  const events=grouped[id],revised=events.some(h=>!h.accepted),observed=events.some(h=>h.accepted);
  const status=complete&&observed?(revised?'shown_after_feedback':'shown'):progress?'in_progress':revised?'review_needed':'not_recorded';
  return {id,concept,status,statusLabel:statusLabels[status],summary:status==='not_recorded'?'No evidence recorded for this task yet.':summary,review:revised?review:''};
 };
 const places=[d.locations[1]==='nucleus',d.locations[2]==='nucleus',d.locations[4]==='cytoplasm'];
 const enzymes=[d.enzymes.helicase,d.enzymes.dnaPolymerase,d.enzymes.rnaPolymerase];
 const enzymeNames=['helicase to open DNA','DNA polymerase to copy DNA','RNA polymerase to make RNA'].filter((_,i)=>enzymes[i]);
 const processing=['cap','splice','tail'].filter(k=>d.processing[k]);
 const dnaErrors=grouped['dna-pairing'].some(h=>!h.accepted&&h.component==='U');
 const rnaErrors=grouped['rna-pairing'].some(h=>!h.accepted&&h.component==='T');
 return [
  row('locations','Cell locations',places.every(Boolean),places.some(Boolean),places.every(Boolean)?'Placed replication and transcription in the nucleus and translation at a ribosome in the cytoplasm.':`Correct locations recorded for ${places.filter(Boolean).length} of the three processes.`,'Where replication, transcription, and translation take place.'),
  row('enzymes','Enzyme roles',enzymes.every(Boolean),enzymes.some(Boolean),enzymeNames.length?'Selected '+humanList(enzymeNames)+'.':'Correct enzyme choices are not yet recorded.','Which enzyme opens DNA, copies DNA, or makes RNA, and where it works.'),
  row('dna-pairing','DNA base pairing',d.replicationComplete,!!d.replicationWindows,'Built '+(d.replicationComplete?'both requested DNA sections using complementary bases.':`${d.replicationWindows.length} of the six DNA bases requested in the short sections.`),dnaErrors?'DNA base pairing, including the use of T rather than U.':'Complementary DNA base pairing.'),
  row('rna-pairing','RNA base pairing',d.studentRNAWindow==='AUG',!!d.studentRNAWindow,d.studentRNAWindow==='AUG'?`Built AUG from the DNA template ${template.slice(0,3)}, including U in the RNA message.`:d.studentRNAWindow?`Built ${d.studentRNAWindow} so far; the RNA section is not finished.`:'An RNA section has not yet been built.',rnaErrors?'RNA base pairing, including the use of U rather than T.':'Matching RNA nucleotides to a DNA template.'),
  row('rna-processing','RNA preparation',processing.length===3,!!processing.length,processing.length===3?'Added the cap and A tail and removed the intron to join the exons.':`Completed ${processing.length} of the three RNA preparation tasks.`,'The work sites for capping enzymes, the spliceosome, and poly(A) polymerase.'),
  row('message-carrier','Information carried by mRNA',d.exported&&d.ribosomeLoaded,d.exported||d.ribosomeLoaded,d.exported&&d.ribosomeLoaded?'Chose mRNA for export through the nuclear pore and for loading at the ribosome.':d.exported?'Exported mRNA; loading at the ribosome is not yet recorded.':'mRNA export and ribosome loading are not yet complete.','mRNA carries the message to a ribosome while DNA stays in the nucleus.'),
  row('codon-matching','Codons and tRNAs',d.peptide.length===3,!!d.peptide.length,d.peptide.length===3?'Matched tRNAs to AUG, GCU, and UUU to build Met - Ala - Phe.':d.peptide.length?`Matched ${d.peptide.length} codon${d.peptide.length===1?'':'s'} and built ${d.peptide.join(' - ')} so far.`:'Correct tRNA matches are not yet recorded.','Matching a tRNA anticodon to the current mRNA codon.'),
  row('stop-signal','Recognizing a stop signal',d.released,false,d.released?'Used a release factor at UAA and released the peptide without adding another amino acid.':'Release of the peptide at a stop codon is not yet recorded.','A stop codon uses a release factor rather than an amino-acid-carrying tRNA.')
 ];
}
function resultRows(d){
 const dna=d.replicationWindows?[d.replicationWindows.slice(0,3)||'not started',d.replicationWindows.slice(3)||'not started'].join(' / '):'not built yet';
 const finished=[['cap','cap addition'],['splice','intron removal and exon joining'],['tail','A-tail addition']].filter(([key])=>d.processing[key]).map(([,label])=>label);
 const preparation=finished.length?`Completed ${humanList(finished)}.`:'RNA preparation is not yet recorded.';
 return [
  {process:'DNA replication',result:`Student-built DNA sections (5′ to 3′): ${dna}. ${d.replicationComplete?'The model completed the remaining DNA in two copies.':'The two DNA copies are not yet complete.'} Location selected: ${locationLabel(d.locations[1])}.`},
  {process:'Transcription',result:`Student-built RNA section: ${d.studentRNAWindow||'not built yet'}. ${d.matureCodingSequence?'Coding message after model extension and splicing: '+d.matureCodingSequence.match(/.{1,3}/g).join(' ')+'.':d.transcriptComplete?'The model made pre-mRNA; the final coding message awaits splicing.':'Model extension of the RNA is not yet complete.'} Location selected: ${locationLabel(d.locations[2])}.`},
  {process:'RNA preparation and export',result:preparation+' '+(d.exported?'mRNA was exported to the cytoplasm.':'Export of mRNA is not yet recorded.')},
  {process:'Translation',result:(d.peptide.length?`Student-built peptide: ${d.peptide.join(' - ')}. `:'No peptide is built yet. ')+(d.released?'Released at UAA; stop added no amino acid.':'Stop recognition and release are not yet complete.')+` Location selected: ${locationLabel(d.locations[4])}.`}
 ];
}
export function geneticsReport(s,options={}){
 const exportedAt=options.exportedAt||new Date().toISOString(),exportTimeZone=options.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
 const records={locations:{...s.locations},enzymes:{helicase:s.opened,dnaPolymerase:s.repEnzyme,rnaPolymerase:s.transEnzyme},replicationWindows:s.repBases,replicationComplete:s.repBases.length===6,daughterDNA:s.repBases.length===6?[{original:'template',sequence:template,newPartner:coding},{original:'coding',sequence:coding,newPartner:template}]:[],studentRNAWindow:s.rnaBases,transcriptComplete:s.rnaFinished,matureCodingSequence:s.processing.splice&&s.rnaFinished?rna:'',processing:{...s.processing},exported:s.exported,ribosomeLoaded:s.ribosomeLoaded,peptide:[...s.peptide],released:s.released};
 return {schemaVersion:2,activityVersion:2,labId,title,attemptId:s.attemptId,exportedAt,exportTimeZone,exportedAtDisplay:formatReportDateTime(exportedAt,exportTimeZone),source:'Virtual model only',status:s.complete?'Complete':'In progress',grading:'not_graded',student:{name:s.studentName,class:s.studentClass},prediction:s.prediction,stage:phases[s.phase],records,results:resultRows(records),evidence:learningEvidence(s,records),checkpoints:Object.entries(checks).map(([id,q])=>{
  const history=s.history.filter(h=>h.action==='check'&&h.phase===(id==='replication'?1:5)),answered=Number.isInteger(s.checks[id]),correct=answered?s.checks[id]===q.correct:null,revised=history.some(h=>!h.accepted);
  return {id,prompt:q.prompt,context:q.context||'',correct,feedback:answered?q.feedback:'',response:answered?q.choices[s.checks[id]]:'Not answered',result:correct===true?(revised?'Correct after feedback':'Correct'):correct===false?'Review needed':'Not answered',choices:q.choices,history:history.map(h=>({...h}))};
 }),explanations:explanationPrompts.map((prompt,i)=>({id:i===0?'locations-and-molecules':'compare-processes',prompt,response:s.explanations[i]})),history:s.history.map(h=>({...h})),limits};
}
const evidenceIntro='These observations summarize work in the model and topics revisited after feedback. The written explanations record the student’s own reasoning.';
const modelNote='Students built short DNA and RNA sections; the model supplied the remaining bases and some helper molecules. Full Okazaki-fragment processing and joining by DNA ligase were not shown. The product is a three-amino-acid peptide, not a complete working protein.';
const footerNote='Model tasks are checked automatically. Written explanations are for teacher review; no overall grade is assigned.';
const created=r=>r.exportedAtDisplay||formatReportDateTime(r.exportedAt,r.exportTimeZone);
const textOrBlank=text=>text?.trim()?text:'Not answered';
export function geneticsReportHtml(r){
 if(r.document)return studentReportHtml(r.document).replace('class="student-report-print"','class="student-report-print gi-print"');
 return `<article class="gi-print"><header class="gi-report-heading"><p>SCIENCE LABS / GENETICS / STUDENT LAB REPORT</p><h1>${e(r.title)}</h1><p><b>Name:</b> ${e(r.student.name||'Not provided')}<br><b>Class / period:</b> ${e(r.student.class||'Not provided')}<br><b>Work status:</b> ${e(r.status)}<br><b>Report created:</b> ${e(created(r))}</p></header>
 <section><h2>Initial prediction</h2><p class="gi-written-response">${e(textOrBlank(r.prediction))}</p></section>
 <section><h2>Results from the model</h2><table class="gi-report-table"><thead><tr><th scope="col">Process</th><th scope="col">Recorded result</th></tr></thead><tbody>${r.results.map(row=>`<tr><th scope="row">${e(row.process)}</th><td>${e(row.result)}</td></tr>`).join('')}</tbody></table></section>
 <section><h2>Evidence of learning and revisions</h2><p class="gi-report-caption">${e(evidenceIntro)}</p><table class="gi-report-table gi-evidence-table"><thead><tr><th scope="col">Learning goal</th><th scope="col">Evidence recorded</th><th scope="col">Result</th></tr></thead><tbody>${r.evidence.map(row=>`<tr><th scope="row">${e(row.concept)}</th><td>${e(row.summary)}${row.review?`<span class="gi-report-review"><b>Revisited:</b> ${e(row.review)}</span>`:''}</td><td>${e(row.statusLabel)}</td></tr>`).join('')}</tbody></table></section>
 <section><h2>Concept checks</h2>${r.checkpoints.map(q=>`<section class="gi-report-check"><h3>${e(q.prompt)}</h3><p><b>Student answer:</b> ${e(q.response)}<br><b>Result:</b> ${e(q.result)}</p>${q.feedback?`<p class="gi-report-caption"><b>Lab feedback:</b> ${e(q.feedback)}</p>`:''}</section>`).join('')}</section>
 <section><h2>Written explanations</h2>${r.explanations.map(q=>`<section><h3>${e(q.prompt)}</h3><p class="gi-written-response">${e(textOrBlank(q.response))}</p></section>`).join('')}</section>
 <section><h2>About this model</h2><p class="gi-report-caption">${e(modelNote)}</p></section><footer>${e(footerNote)}</footer></article>`;
}
function pdfTable(headers,rows,widths){
 return {margin:[0,5,0,8],table:{headerRows:1,keepWithHeaderRows:1,dontBreakRows:true,widths,body:[headers.map(text=>({text,bold:true,fillColor:'#e5eee1',color:'#244c36'})),...rows.map(cells=>cells.map(cell=>typeof cell==='string'?{text:cell}:cell))]},fontSize:9,lineHeight:1.15,layout:{hLineWidth:()=>.5,vLineWidth:()=>0,hLineColor:()=>'#ccd9c7',paddingTop:()=>6,paddingBottom:()=>6,paddingLeft:()=>6,paddingRight:()=>6}};
}
export function geneticsReportPdf(r){
 if(r.document)return studentReportPdf(r.document);
 const bytes=new TextEncoder().encode(JSON.stringify(r,null,2));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 const heading=text=>({text,style:'heading'});
 return {pageSize:'LETTER',pageMargins:[44,40,44,43],info:{title:r.title+' - student lab report',author:r.student.name||'Student'},defaultStyle:{font:'Roboto',fontSize:10,lineHeight:1.25,color:'#244336'},styles:{heading:{fontSize:13,bold:true,margin:[0,15,0,7],color:'#386b51'},prompt:{fontSize:10,bold:true,margin:[0,10,0,5]},caption:{fontSize:9,color:'#496452',lineHeight:1.2}},content:[
  {text:'SCIENCE LABS / GENETICS / STUDENT LAB REPORT',fontSize:9,color:'#587867'},
  {text:r.title,fontSize:24,bold:true,margin:[0,8,0,12]},
  {text:`Name: ${r.student.name||'Not provided'}\nClass / period: ${r.student.class||'Not provided'}\nWork status: ${r.status}\nReport created: ${created(r)}`},
  heading('Initial prediction'),{text:textOrBlank(r.prediction)},
  heading('Results from the model'),pdfTable(['Process','Recorded result'],r.results.map(row=>[{text:row.process,bold:true},row.result]),[86,'*']),
  heading('Evidence of learning and revisions'),{text:evidenceIntro,style:'caption'},
  pdfTable(['Learning goal','Evidence recorded','Result'],r.evidence.map(row=>[{text:row.concept,bold:true},row.summary+(row.review?'\nRevisited: '+row.review:''),row.statusLabel]),[83,'*',75]),
  heading('Concept checks'),...r.checkpoints.map(q=>({unbreakable:true,stack:[{text:q.prompt,style:'prompt'},{text:[{text:'Student answer: ',bold:true},q.response,'\n',{text:'Result: ',bold:true},q.result]},...(q.feedback?[{text:'Lab feedback: '+q.feedback,style:'caption',margin:[0,5,0,0]}]:[])]})),
  heading('Written explanations'),...r.explanations.flatMap(q=>[{text:q.prompt,style:'prompt'},{text:textOrBlank(q.response)}]),
  heading('About this model'),{text:modelNote,style:'caption'}
 ],footer:(page,total)=>({stack:[{text:footerNote,fontSize:7,color:'#58705f'},{text:`Science Labs | Student lab report | ${r.status} | Page ${page} of ${total}`,fontSize:8,margin:[0,3,0,0]}],alignment:'center',margin:[44,8,44,0]}),files:{responses:{src:'data:application/json;base64,'+btoa(binary),name:'genetic-information-responses.json',description:'Structured student responses and supporting model evidence'}},pageBreakBefore:(node,container)=>['heading','prompt'].includes(node.style)&&container.getFollowingNodesOnPage().length===0};
}
