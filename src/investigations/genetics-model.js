export const labId='genetic-information';
export const title='DNA to RNA to Protein';
export const phases=['Orient','Replicate DNA','Transcribe RNA','Process & export','Translate','Explain'];
export const coding='ATGGCTTTTTAA';
export const complement=sequence=>[...sequence].map(b=>({A:'T',T:'A',C:'G',G:'C'}[b])).join('');
export const template=complement(coding);
export const rna=coding.replaceAll('T','U');
export const codons=['AUG','GCU','UUU','UAA'];
export const stopCodons=['UAA','UAG','UGA'];
export const carriers=[
 {id:'met',name:'Methionine',short:'Met',anticodon:'UAC',codon:'AUG',color:'#cb9951'},
 {id:'ala',name:'Alanine',short:'Ala',anticodon:'CGA',codon:'GCU',color:'#63a898'},
 {id:'phe',name:'Phenylalanine',short:'Phe',anticodon:'AAA',codon:'UUU',color:'#9a85bb'},
 {id:'lys',name:'Lysine',short:'Lys',anticodon:'UUU',codon:'AAA',color:'#ba7874'}
];
export const checks={
 replication:{prompt:'What strands are in each new DNA molecule?',choices:['Two newly made strands','One original strand and one new strand','Two original strands'],correct:1,feedback:'Each original strand guides a new partner. Each new DNA molecule keeps one original strand. This is called semiconservative replication.'},
 transfer:{context:'Replication makes a new copy of DNA. Transcription uses a gene’s DNA instructions to make messenger RNA (mRNA).',prompt:'Must a cell replicate (copy) its DNA each time it wants to transcribe an mRNA message?',choices:['Yes. It must copy the DNA before making each mRNA message.','No. It can transcribe the same gene many times using the DNA already in the nucleus.'],correct:1,feedback:'The cell can use the DNA already in its nucleus to make mRNA. It can read the same gene many times. Replication copies DNA before a cell divides.'}
};
export const explanationPrompts=[
 'Follow the message. Where did replication, transcription, and translation happen? What moved through the nuclear pore? What stayed in the nucleus?',
 'What did each process make: replication, transcription, and translation? Use your DNA, mRNA, and amino acid chain as evidence. How did base pairs, codons, and the stop signal guide your work?'
];
export const limits='This virtual model follows one gene in a cell with a nucleus. Shapes, colors, sizes, and speeds help show the steps. They are not to scale. The DNA and RNA sections are much shorter than real genes. The promoter and intron are markers, not full sequences. RNA parts outside the code are shortened or left out. Primers and many helper proteins are provided. Tail-cutting helpers are also provided. Opening DNA and copying it can happen together in cells. RNA processing can begin while RNA is still being made. At each fork, the leading strand is copied continuously. The lagging strand is copied in short pieces called Okazaki fragments. Primase starts each piece with an RNA primer. DNA polymerase adds DNA. Other enzymes replace the RNA primers with DNA. DNA ligase seals the joins. These extra steps are not shown in this model. The first tRNA starts in the ribosome’s P site. Later tRNAs enter its A site. The model provides the helpers for these steps. The three amino acids make a short peptide, not a full working protein. This model does not show bacteria, mitochondria, or chloroplasts.';
export function freshGenetics(){return {version:1,attemptId:globalThis.crypto?.randomUUID?.()||'genetics-'+Date.now().toString(36),phase:0,locations:{},opened:false,repEnzyme:false,repBases:'',transEnzyme:false,rnaBases:'',rnaFinished:false,processing:{cap:false,splice:false,tail:false},exported:false,ribosomeLoaded:false,peptide:[],released:false,checks:{},history:[],prediction:'',explanations:['',''],studentName:'',studentClass:'',complete:false};}
export function phaseReady(s){return [!!s.prediction.trim(),s.repBases.length===6&&s.checks.replication===1,s.rnaFinished,s.exported,s.released,false][s.phase];}
export function canCompleteGenetics(s){return s.phase===5&&s.released&&s.checks.transfer===1&&s.explanations.every(x=>x.trim())&&!!s.prediction.trim();}

// Only this transition function changes the biological sequence. Replaying its
// events restores progress without trusting saved completion or phase flags.
// UI placements name both the component and its physical work site.
// Older action names remain supported when replaying saved attempts.
export function resolvePlacement(s,value){
 const parts=String(value).split('@');if(parts.length!==2)return {message:'Choose a component and place it at a marked work site.'};
 const [token,site]=parts,[kind,id]=token.split(':');
 if(s.phase===1&&s.locations[1]){
  if(['fork','primer'].includes(site)&&kind==='tool')return {action:'place-enzyme',value:id+'@'+site};
  if(site==='growing-dna'&&kind==='base')return {action:'base',value:id};
  return {message:'Place an enzyme at its work site, or add a nucleotide at the growing DNA end.'};
 }
 if(s.phase===2&&s.locations[2]){
  if(!s.transEnzyme&&site==='promoter'&&kind==='tool')return {action:'tool',value:id};
  if(!s.transEnzyme&&site==='gene-body')return {message:'Start at the promoter (1). It marks where RNA polymerase begins reading this gene.'};
  if(site==='growing-rna'&&kind==='base')return {action:'base',value:id};
  return {message:'Place RNA polymerase at the promoter. Then add RNA nucleotides at the growing 3′ end.'};
 }
 if(s.phase===3){
  if(site==='pore'&&kind==='molecule')return {action:'export',value:id};
  const expected={cap:'five-prime',splice:'intron',tail:'three-prime'};
  if(kind==='tool'&&expected[id]){
   if(expected[id]===site)return {action:'tool',value:id};
   return {message:{cap:'Capping enzymes work at the RNA’s 5′ end (1). Put them there to add the cap.',splice:'Place the spliceosome on the intron (2), the RNA part to remove.',tail:'Poly(A) polymerase adds an A tail at the RNA’s 3′ end (3). Place it there.'}[id]};
  }
  return {message:'Match each enzyme or team to its RNA work site. Move the prepared mRNA through the pore.'};
 }
 if(s.phase===4&&s.locations[4]){
  if(!s.ribosomeLoaded&&site==='mrna-groove'&&kind==='molecule')return {action:'load',value:id};
  if(s.ribosomeLoaded&&site==='ribosome-site'&&kind==='trna')return {action:'trna',value:id};
  if(s.ribosomeLoaded&&site==='ribosome-site'&&kind==='release')return {action:'release',value:id};
  return {message:'First put mRNA in the ribosome’s groove. Then place a tRNA or release factor at the current codon.'};
 }
 return {message:'Answer the location question before placing a component.'};
}
export function interact(s,action,value='',record=true){
 if(action==='place'){
  const resolved=resolvePlacement(s,value),result=resolved.action?interact(s,resolved.action,resolved.value,false):{state:{...s},accepted:false,message:resolved.message};
  if(record)result.state.history=[...s.history,{phase:s.phase,action,value:String(value),accepted:result.accepted}];
  return result;
 }

 const n={...s,locations:{...s.locations},processing:{...s.processing},peptide:[...s.peptide],checks:{...s.checks}};
 let accepted=false,message='That step is not ready yet. Follow the current direction.';
 const yes=text=>{accepted=true;message=text;};
 if(action==='next'&&s.phase<5){if(phaseReady(s)){n.phase++;yes('The next process is ready. Check where it happens and what to do.');}else message='Finish this task and answer the required checkpoint before you continue.';}
 else if(action==='location'&&[1,2,4].includes(s.phase)){
  const expected=s.phase===4?'cytoplasm':'nucleus';
  if(value===expected){n.locations[s.phase]=value;yes(s.phase===4?'Correct: this ribosome is in the cytoplasm. Read the mRNA here.':'Correct. This process uses DNA inside the nucleus.');}
  else message=s.phase===4?'The mRNA has left the nucleus. This model translates it at a ribosome in the cytoplasm.':'This model follows a nuclear gene: a gene in the nucleus. The DNA stays there during replication and transcription.';
 }
 else if(action==='place-enzyme'&&s.phase===1&&s.locations[1]){
  const [enzyme,site]=value.split('@');
  if(enzyme==='helicase'){
   if(site!=='fork')message='Helicase works at the strand junction (1), where paired DNA separates. The primer is a starting point for DNA polymerase.';
   else if(s.opened)message='Helicase has already opened this window. Place DNA polymerase at the primer’s 3′ end (2).';
   else{n.opened=true;yes('Helicase opens the paired DNA at the fork. It breaks hydrogen bonds between bases. The DNA backbones stay whole.');}
  }else if(enzyme==='dna-polymerase'){
   if(!s.opened)message='Open the DNA with helicase first. DNA polymerase needs an exposed template and an existing primer.';
   else if(site!=='primer')message='DNA polymerase extends a new strand from a primer’s 3′ end (2). Place it there, rather than at the strand junction.';
   else if(s.repEnzyme)message='DNA polymerase is already in place. Add a complementary nucleotide.';
   else{n.repEnzyme=true;yes('DNA polymerase binds at the primer’s 3′ end. Choose matching nucleotides and watch new DNA grow.');}
  }else message='Use helicase to separate DNA or DNA polymerase to copy it. RNA polymerase makes an RNA transcript.';
 }
 // Keep legacy tool events replayable so previously saved student work is retained.
 else if(action==='tool'&&s.phase===1&&s.locations[1]){
  if(value==='helicase'&&!s.opened){n.opened=true;yes('Helicase separates the paired strands; it does not cut their sugar-phosphate backbones.');}
  else if(value==='dna-polymerase'&&s.opened&&!s.repEnzyme){n.repEnzyme=true;yes('DNA polymerase extends a new DNA strand 5′ to 3′. Primase has already supplied a primer outside this window.');}
  else message=!s.opened?'Separate the paired strands with helicase first.':'To copy DNA into DNA, choose DNA polymerase. RNA polymerase makes RNA; a ribosome reads mRNA.';
 }
 else if(action==='base'&&s.phase===1&&s.repEnzyme&&s.repBases.length<6){
  const expected='ATGTTA'[s.repBases.length];
  if(value===expected){n.repBases+=value;yes(n.repBases.length===3?'The first short section is done. Now follow the other template from its 3′ end.':n.repBases.length===6?'Both short sections are correct. The model fills in the rest and shows two new DNA molecules.':'Correct DNA partner. Add the next nucleotide at the new strand’s 3′ end.');}
  else message=value==='U'?'DNA uses thymine (T), not uracil (U). Match A–T and C–G.':'Use the DNA template beside the polymerase: A pairs with T, and C pairs with G. New DNA grows 5′ to 3′.';
 }
 else if(action==='tool'&&s.phase===2&&s.locations[2]&&!s.transEnzyme){
  if(value==='rna-polymerase'){n.transEnzyme=true;yes('RNA polymerase starts reading the DNA. It builds RNA 5′ to 3′. The DNA stays in place.');}
  else message='Choose RNA polymerase to make RNA. DNA polymerase makes DNA. A ribosome links amino acids.';
 }
 else if(action==='base'&&s.phase===2&&s.transEnzyme&&s.rnaBases.length<3){
  if(value==='AUG'[s.rnaBases.length]){n.rnaBases+=value;yes(n.rnaBases.length===3?'AUG is ready. Let RNA polymerase finish the rest of this short gene.':'Correct RNA partner. Continue building RNA 5′ to 3′.');}
  else message=value==='T'?'RNA uses uracil (U) instead of thymine (T). A in the template pairs with U in RNA.':'Pair with the DNA template using RNA nucleotides: T→A, A→U, C→G, G→C.';
 }
 else if(action==='finish-rna'&&s.phase===2&&s.rnaBases==='AUG'){n.rnaFinished=true;yes('The first RNA copy, called pre-mRNA, is ready. It has exons and an intron marker. The DNA stays whole.');}
 else if(action==='tool'&&s.phase===3){
  if(['cap','splice','tail'].includes(value)&&!s.processing[value]){n.processing[value]=true;yes({cap:'A special G cap is added at the 5′ end. It protects the RNA and helps the ribosome use the message.',splice:'The spliceosome removes the intron and joins the exons. The exons stay in the message.',tail:'An A tail is added at the 3′ end. It helps protect the RNA. The tail is outside the code for this amino acid chain.'}[value]);}
  else message='Use the cap, spliceosome or tail-adding complex on the RNA. DNA is not the molecule being processed.';
 }
 else if(action==='export'&&s.phase===3){
  if(value!=='mrna')message='Move the mature mRNA message. Nuclear DNA stays in the nucleus in this model.';
  else if(!Object.values(s.processing).every(Boolean))message='Complete the cap, splicing and poly(A) tail before exporting this message.';
  else{n.exported=true;yes('The prepared mRNA passes through a nuclear pore into the cytoplasm. The DNA stays in the nucleus.');}
 }
 else if(action==='load'&&s.phase===4&&s.locations[4]){
  if(value==='mrna'){n.ribosomeLoaded=true;yes('The ribosome is positioned at AUG. Use the codon guide to choose a matching amino-acid carrier.');}
  else message='Load mRNA into the ribosome. The DNA template stays in the nucleus.';
 }
 else if(action==='trna'&&s.phase===4&&s.ribosomeLoaded&&!s.released){
  const carrier=carriers.find(t=>t.id===value),codon=codons[s.peptide.length];
  if(codon==='UAA')message='UAA is a stop codon. It has no matching tRNA and adds no amino acid. Use a release factor.';
  else if(carrier?.codon===codon){n.peptide.push(carrier.short);yes(`${carrier.name} added. ${n.peptide.length===3?'The ribosome now reaches UAA.':'The ribosome advances one codon along mRNA, 5′ to 3′.'}`);}
  else message=`Read ${codon} on the mRNA. Choose the tRNA with its complementary anticodon; anticodons here are written 3′ to 5′.`;
 }
 else if(action==='release'&&s.phase===4){
  if(s.peptide.length===3&&!s.released){n.released=true;yes('The release factor recognizes UAA and frees the amino acid chain. Stop adds no amino acid.');}
  else message='A release factor acts when a stop codon reaches the ribosome. Complete the amino-acid sequence first.';
 }
 else if(action==='check'&&((s.phase===1&&s.repBases.length===6)||(s.phase===5&&s.released))){
  const id=s.phase===1?'replication':'transfer',q=checks[id],choice=Number(value);
  if(Number.isInteger(choice)&&q.choices[choice]){n.checks[id]=choice;accepted=choice===q.correct;message=accepted?'Correct. '+q.feedback:'Try again: '+q.feedback;}
 }
 if(record)n.history=[...s.history,{phase:s.phase,action,value:String(value),accepted}];
 return {state:n,accepted,message};
}
export function restoreGenetics(raw){
 try{
  const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.history)||data.history.length>20000)throw Error();
  let s=freshGenetics();for(const f of ['prediction','studentName','studentClass'])s[f]=typeof data[f]==='string'?data[f]:'';
  if(Array.isArray(data.explanations)&&data.explanations.length===2&&data.explanations.every(x=>typeof x==='string'))s.explanations=[...data.explanations];
  s.attemptId=typeof data.attemptId==='string'?data.attemptId:s.attemptId;
  for(const event of data.history){if(!event||typeof event.action!=='string'||typeof event.value!=='string')throw Error();s=interact(s,event.action,event.value).state;}
  s.complete=data.complete===true&&canCompleteGenetics(s);return s;
 }catch{return freshGenetics();}
}
