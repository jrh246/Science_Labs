import {codons,carriers,stopCodons} from './genetics-model.js';
import {polymeraseGeometry} from './genetics-geometry.js';

const replicationNote=[
 'This activity shows the general process. Real DNA replication uses more enzymes, proteins, and steps than this model shows.',
 'The two DNA strands run in opposite directions. DNA polymerase can build only 5′ to 3′. At each fork, the leading strand grows in one continuous stretch. The lagging strand grows in short pieces called Okazaki fragments.',
 'Primase makes a new RNA primer for each fragment. DNA polymerase adds DNA to the primer. Other enzymes remove the RNA primers and replace them with DNA. DNA ligase then seals the breaks between the pieces to make one continuous strand.'
];

export const componentNames={helicase:'Helicase','dna-polymerase':'DNA polymerase','rna-polymerase':'RNA polymerase',cap:'Capping enzymes',splice:'Spliceosome',tail:'Poly(A) polymerase',mrna:'mRNA message',dna:'DNA',release:'Release factor'};
export const componentNotes={helicase:'Opens paired DNA','dna-polymerase':'Builds new DNA','rna-polymerase':'Builds RNA',cap:'Adds a 5′ cap',splice:'RNA and protein team',tail:'Adds an A tail',mrna:'Carries the gene’s message',dna:'Stores the gene',release:'Stop codons: '+stopCodons.join(' · ')};
const site=(id,x,y,n,label)=>({id,x,y,n,label});
export const processed=s=>Object.values(s.processing).every(Boolean);
// A new attempt gets a new shuffled tray; selections, corrections, and reloads
// keep the same layout. Never reorder the biological carrier definitions.
export function translationTools(attemptId){
 const tools=carriers.map(carrier=>'trna:'+carrier.id);
 let seed=2166136261;
 for(const letter of String(attemptId||'genetics'))seed=Math.imul(seed^letter.charCodeAt(0),16777619)>>>0;
 const random=()=>{
  seed=(seed+0x6D2B79F5)>>>0;
  let value=Math.imul(seed^(seed>>>15),seed|1);
  value^=value+Math.imul(value^(value>>>7),value|61);
  return ((value^(value>>>14))>>>0)/4294967296;
 };
 for(let i=tools.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[tools[i],tools[j]]=[tools[j],tools[i]];}
 return [...tools,'release:release'];
}

export function workbench(s){
 const out={heading:'',paragraphs:[],sites:[],tools:[],nucleotideTray:false};
 if([1,2,4].includes(s.phase)&&!s.locations[s.phase])return out;
 if(s.phase===1){
  if(!s.opened)return {...out,heading:'Open the DNA',paragraphs:['Place helicase at the strand junction (1). This point is called a replication fork.','Watch helicase open the paired DNA. Each strand can then guide a new copy.'],sites:[site('fork',62,162,1,'Strand junction — replication fork')],tools:['tool:helicase','tool:dna-polymerase','tool:rna-polymerase']};
  if(!s.repEnzyme)return {...out,heading:'Choose the copying enzyme',paragraphs:['Place DNA polymerase at the primer’s 3′ end (2). A primer is a short starting strand.','Primase makes primers in cells. This model gives you a primer so you can focus on copying DNA.'],sites:[site('fork',628,162,1,'Strand junction — replication fork'),site('primer',64,116,2,'Primer — growing strand 3′ end')],tools:['tool:helicase','tool:dna-polymerase','tool:rna-polymerase']};
  if(s.repBases.length<6){const {second,x,targetY}=polymeraseGeometry('dna',s.repBases.length);return {...out,heading:'Build a new DNA partner',paragraphs:[second?'Now follow a second polymerase on the other original strand. Both new strands grow 5′ to 3′.':'DNA polymerase adds to the new strand’s 3′ end. The original strand guides which base fits.','Choose a matching nucleotide. Place it at DNA polymerase’s marked work site (3).'],sites:[site('growing-dna',x,targetY,3,'DNA polymerase — next nucleotide site')],tools:['base:A','base:T','base:C','base:G','base:U'],nucleotideTray:true};}
  return {...out,heading:'Two DNA molecules',note:replicationNote,paragraphs:['You built a short part of each new strand. The model filled in the rest.','Compare the purple original strands with the gold new strands. Answer the checkpoint before you continue.']};
 }
 if(s.phase===2){
  if(!s.transEnzyme)return {...out,heading:'Start an RNA message',paragraphs:['Place RNA polymerase at the promoter (1). A promoter is a DNA region that marks where to start a gene.','Helper proteins guide the enzyme in cells. This model provides those helpers. DNA can be read many times without being copied first.'],sites:[site('promoter',76,77,1,'Promoter — start of the gene'),site('gene-body',355,88,2,'DNA inside the gene')],tools:['tool:rna-polymerase','tool:dna-polymerase','tool:helicase']};
  if(s.rnaBases.length<3){const {x,targetY}=polymeraseGeometry('rna',s.rnaBases.length);return {...out,heading:'Build the RNA message',paragraphs:['RNA polymerase reads the DNA template and links RNA nucleotides. A template is a strand used as a guide.','Place each matching nucleotide at RNA polymerase’s marked work site (3). It adds to the RNA’s 3′ end. RNA uses U instead of T.'],sites:[site('growing-rna',x,targetY,3,'RNA polymerase — next nucleotide site')],tools:['base:A','base:T','base:C','base:G','base:U'],nucleotideTray:true};}
  if(!s.rnaFinished)return {...out,heading:'Let RNA polymerase finish',paragraphs:['Your first three RNA bases are AUG. Select the working enzyme’s play button in the model.','Watch it finish this short RNA message. The DNA stays in the nucleus.'],run:{x:267,y:120}};
  return {...out,heading:'The first RNA copy is ready',paragraphs:['This first copy is called pre-mRNA. It needs a few changes before it can be used.','Exons are parts kept in this message. The intron is a part that will be removed.']};
 }
 if(s.phase===3){
  if(!processed(s))return {...out,heading:'Prepare the RNA message',paragraphs:['Place each enzyme or team at its work site on the RNA.','Capping enzymes add a cap at the 5′ end (1). The spliceosome removes the intron (2) and joins the exons. Poly(A) polymerase adds an A tail at the 3′ end (3).'],sites:[...(!s.processing.cap?[site('five-prime',80,198,1,'RNA 5′ end — cap site')]:[]),...(!s.processing.splice?[site('intron',340,126,2,'Intron — splice site')]:[]),...(!s.processing.tail?[site('three-prime',600,198,3,'RNA 3′ end — tail site')]:[])],tools:['cap','splice','tail'].filter(x=>!s.processing[x]).map(x=>'tool:'+x)};
  return {...out,heading:s.exported?'The message has arrived':'Move through the nuclear pore',paragraphs:[s.exported?'The mRNA is now in the cytoplasm, the area outside the nucleus. The DNA stayed inside.':'Move the mRNA message through the nuclear pore (4). A pore is a passage through the membrane around the nucleus.','The model provides the helper proteins that move mRNA through the pore.'],sites:s.exported?[]:[site('pore',340,182,4,'Nuclear pore — passage to the cytoplasm')],tools:s.exported?[]:['molecule:mrna','molecule:dna']};
 }
 if(s.phase===4){
  if(!s.ribosomeLoaded)return {...out,heading:'Bring the message to a ribosome',paragraphs:['Place mRNA in the ribosome’s message groove (1).','The ribosome is made of RNA and proteins. This model provides the helpers that line up the AUG start codon.'],sites:[site('mrna-groove',250,238,1,'Ribosome — mRNA message groove')],tools:['molecule:mrna','molecule:dna']};
  if(s.released)return {...out,heading:'A short amino acid chain is released',paragraphs:['Met–Ala–Phe is a chain of three amino acids. Bonds called peptide bonds link them.','UAA is a stop signal. It adds no amino acid. Most proteins have much longer chains that must fold into a working shape.']};
  const stop=s.peptide.length===3;
  return {...out,heading:stop?'Read the stop signal':'Match the next codon',paragraphs:[stop?'UAA is a stop codon. Place a release factor at that codon (2).':'A codon is a group of three mRNA bases. Match it with the three-base anticodon on a tRNA. Each tRNA already carries an amino acid.',stop?'This helper protein recognizes UAA, UAG, and UGA at the ribosome. This message ends at UAA. Watch the chain come free.':s.peptide.length===0?'Place the first tRNA at AUG (2). It starts with methionine.':'Place the matching tRNA at the ribosome’s entry site (2). Watch the ribosome add its amino acid and move one codon.'],sites:[site('ribosome-site',112+s.peptide.length*139,205,2,stop?'Stop codon — release factor site':s.peptide.length===0?'AUG start codon — first tRNA site':'Current codon — tRNA entry site')],tools:translationTools(s.attemptId),codon:codons[s.peptide.length]};
 }
 return out;
}

export function motionFor(before,after,value){
 if(before.phase!==after.phase)return null;
 if(before.phase===1){
  if(!before.opened&&after.opened)return {kind:'unwind',duration:2700};
  if(!before.repEnzyme&&after.repEnzyme)return {kind:'bind',duration:1300};
  if(before.repBases.length<after.repBases.length)return {kind:'extend',duration:1600,beforeBases:before.repBases.length};
 }
 if(before.phase===2){
  if(!before.transEnzyme&&after.transEnzyme)return {kind:'rna-bind',duration:1700};
  if(before.rnaBases.length<after.rnaBases.length)return {kind:'rna-extend',duration:1700,beforeBases:before.rnaBases.length};
  if(!before.rnaFinished&&after.rnaFinished)return {kind:'rna-finish',duration:2300};
 }
 if(before.phase===3){
  for(const kind of ['cap','splice','tail'])if(!before.processing[kind]&&after.processing[kind])return {kind,duration:2400};
  if(!before.exported&&after.exported)return {kind:'export',duration:2600};
 }
 if(before.phase===4){
  if(!before.ribosomeLoaded&&after.ribosomeLoaded)return {kind:'load',duration:1900};
  if(before.peptide.length<after.peptide.length)return {kind:'deliver',duration:2900,beforePeptide:before.peptide.length,carrier:after.peptide.at(-1)};
  if(!before.released&&after.released)return {kind:'release',duration:2600};
 }
 return null;
}
export const motionCopy={
 unwind:['Helicase opens the DNA','Helicase moves along the strand junction. It breaks the weak hydrogen bonds between paired bases. The two DNA backbones stay whole.'],
 bind:['DNA polymerase finds the starting end','The enzyme binds where a primer meets the template. It can now add nucleotides to the primer’s 3′ end.'],
 extend:['New DNA grows','A matching nucleotide joins the new strand’s 3′ end. DNA polymerase links it to the backbone and moves to the next base.'],
 'rna-bind':['RNA polymerase starts at the gene','The enzyme binds at the promoter and opens a small part of the DNA. One DNA strand will guide the RNA copy.'],
 'rna-extend':['RNA polymerase adds a nucleotide','A matching RNA nucleotide joins the message’s 3′ end. The enzyme moves to the next DNA base.'],
 'rna-finish':['RNA polymerase finishes the message','The enzyme copies the rest of this short gene. The RNA copy comes free. The DNA strands pair again.'],
 cap:['Capping enzymes add a cap','The enzymes attach a special G cap to the RNA’s 5′ end. The cap protects the message and helps a ribosome use it.'],
 splice:['The spliceosome joins the exons','This team of RNA and proteins removes the intron. It joins the two exon sections into one message.'],
 tail:['Poly(A) polymerase adds the tail','The enzyme links A nucleotides at the RNA’s 3′ end. This tail helps protect the message.'],
 export:['The mRNA passes through the pore','The mRNA moves from the nucleus into the cytoplasm. Helper proteins guide it. The DNA stays in the nucleus.'],
 load:['The message enters the ribosome','The mRNA fits into the message groove. Helper proteins line up AUG, the start codon.'],
 deliver:['The ribosome reads a codon','The tRNA anticodon pairs with the mRNA codon. Its amino acid joins the growing chain. The ribosome moves to the next codon.'],
 release:['The finished chain comes free','The release factor recognizes UAA. It helps free the amino acid chain from the last tRNA. No amino acid is added at stop.']
};
