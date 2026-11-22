const newAttemptId=()=>globalThis.crypto?.randomUUID?.()||'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
// A teaching model of crude extraction, not a prediction of DNA concentration.
export const extractionVersion = 3;
export const conditions = ['Complete extraction', 'No detergent control', 'No fruit blank'];
export const rubric = ['None', 'Faint', 'Clear', 'Abundant'];
export const steps = [
  {tool:'fruit',target:'bag',title:'Move the fruit into the bag',hint:'Drag the 10 g strawberry portion from the tray into the sample bag.',why:'Fruit tissue contains cells. The DNA is already present before extraction.'},
  {tool:'masher',target:'bag',title:'Break up the fruit',hint:'Drag the masher onto the bag and move it back and forth. Make three passes.',why:'Mashing breaks up tissue and cell walls. It can also rupture some cell and nuclear membranes, releasing some DNA before detergent is added.'},
  {tool:'water',target:'bag',title:'Add 9 mL water',hint:'Move the measured water to the bag.',why:'Water carries the dissolved ingredients and released cell contents.'},
  {tool:'salt',target:'bag',title:'Add 0.1 g salt',hint:'Move the measured salt to the bag.',why:'Salt helps DNA and other nucleic acids clump together when alcohol is added later.'},
  {tool:'soap',target:'bag',title:'Add 1 mL detergent',hint:'Move the detergent dropper to the bag.',why:'Detergent interacts with membrane lipids and pulls them out of the bilayer. This opens more cell and nuclear membranes, allowing DNA and other contents to enter the liquid.'},
  {tool:'mix',target:'bag',title:'Gently mix the contents',hint:'Use the mixing tool on the bag. Avoid vigorous foaming.',why:'Mixing brings the extraction solution into contact with the mashed tissue.'},
  {tool:'filter',target:'tube',title:'Place the filter and funnel',hint:'Move the filter funnel to the collection tube.',why:'Separate means sort parts of a mixture by size or by how easily they dissolve. The filter holds back large debris; dissolved molecules pass through.'},
  {tool:'sample',target:'funnel',title:'Pour the mixture through the filter',hint:'Drag the sample bag to the funnel. Collect a 5 mL portion of filtrate.',why:'Filtrate is the liquid that passes through the filter. It still contains dissolved DNA and other cell components. Filtration does not isolate pure DNA.'},
  {tool:'alcohol',target:'tube',title:'Layer 5 mL cold alcohol',hint:'Move the alcohol pipette to the tube wall. Let it run down gently.',why:'Precipitate means come out of solution as solid material. DNA is less soluble in the alcohol-rich liquid and can collect into visible clumps with other substances. Alcohol does not create DNA.'},
];
export const checkpoints = {
  4:{id:'membrane-barriers',title:'Stop and think: before detergent',question:'What must detergent disrupt to help release DNA?',choices:['Lipid membranes around the cell and nucleus','The DNA molecule itself','Only the seeds on the fruit surface'],correct:0,feedback:['Yes. Detergent disrupts lipid membranes. Mashing can already rupture some membranes, but detergent opens more of them. You can now add detergent.','Breaking DNA is not the aim. Think about the barriers around the cell and nucleus.','Fruit flesh contains cells with DNA too. Think about the membranes around those cells.']},
  8:{id:'dissolved-dna',title:'Stop and think: before alcohol',question:'The filtrate has no visible strands yet. Where could its DNA be?',choices:['It has not been made yet','Dissolved in the liquid, too small to see individually','All trapped in the coffee filter'],correct:1,feedback:['Extraction releases existing material; it does not make DNA.','Yes. Dissolved DNA can be present without visible strands. Alcohol helps it leave solution as a precipitate. You can now layer the alcohol.','The filter traps large debris; dissolved DNA can pass into the filtrate.']},
};
export function freshExtraction(seed=Date.now()>>>0){return {version:2,modelVersion:3,attemptId:newAttemptId(),studentName:'',studentClass:'',checkAttempts:{},seed:seed>>>0,route:'virtual',stage:0,step:0,passes:0,elapsed:0,prediction:'',checks:{},scores:[null,null,null],sources:['virtual','virtual','virtual'],notes:['','',''],claim:'',limit:'',complete:false};}
export function canUse(s){return !checkpoints[s.step]||s.checks[s.step]===checkpoints[s.step].correct;}
export function useTool(s,tool,target){
  const next=steps[s.step];
  if(s.stage!==1||!next||next.tool!==tool||next.target!==target||!canUse(s))return s;
  if(s.step===1&&s.passes<2)return {...s,passes:s.passes+1};
  return {...s,step:s.step+1,passes:s.step===1?3:s.passes,complete:false};
}
export function tickExtraction(s,seconds=1){return s.step===steps.length?{...s,elapsed:Math.min(300,s.elapsed+Math.max(0,seconds))}:s;}
export function modelVisibility(seed,condition,elapsed=300,modelVersion=3){
  if(condition===2)return 0;
  const x=(Math.imul(seed+condition*7919,1664525)+1013904223)>>>0;
  const end=condition===0?2+(x%3?1:0):modelVersion>=3?1:x%2;
  return Math.max(0,Math.min(3,Math.floor(end*Math.min(elapsed,300)/300)));
}
export function evidenceReady(s){return s.scores.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&s.notes.every(n=>n.trim())&&(s.elapsed===300||s.route==='classroom');}
export function canComplete(s){return evidenceReady(s)&&Boolean(s.claim.trim()&&s.limit.trim());}
export function restoreExtraction(raw){
  try{
    const s=JSON.parse(raw);
    if(!s||s.version!==2||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295||![0,1,2].includes(s.stage)||!Number.isInteger(s.step)||s.step<0||s.step>9||!Number.isInteger(s.passes)||s.passes<0||s.passes>3||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>300)throw Error();
    if(!['virtual','classroom'].includes(s.route)||!['prediction','claim','limit'].every(k=>typeof s[k]==='string')||!s.checks||typeof s.checks!=='object'||Array.isArray(s.checks))throw Error();
    for(const [k,v] of Object.entries(s.checks))if(!checkpoints[k]||!Number.isInteger(v)||v<0||v>2)throw Error();
    for(const key of ['scores','sources','notes'])if(!Array.isArray(s[key])||s[key].length!==3)throw Error();
    if(!s.scores.every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<=3))||!s.sources.every(v=>['virtual','classroom'].includes(v))||!s.notes.every(v=>typeof v==='string'))throw Error();
    if((s.step>1&&s.passes!==3)||(s.step>4&&s.checks[4]!==0)||(s.step>8&&s.checks[8]!==1)||(s.elapsed>0&&s.step!==9)||(s.stage===2&&s.route==='virtual'&&s.elapsed!==300)||(s.route==='classroom'&&s.sources.some(v=>v!=='classroom')))throw Error();
    const modelVersion=s.modelVersion??(s.scores.some(v=>v!==null)?2:3);
    const checkAttempts=s.checkAttempts??{};
    if(![2,3].includes(modelVersion)||!checkAttempts||typeof checkAttempts!=='object'||Array.isArray(checkAttempts))throw Error();
    for(const [k,a] of Object.entries(checkAttempts))if(!checkpoints[k]||!Array.isArray(a)||a.some(v=>!Number.isInteger(v)||v<0||v>2))throw Error();
    if(['studentName','studentClass','attemptId'].some(k=>s[k]!==undefined&&typeof s[k]!=='string'))throw Error();
    return {...s,modelVersion,checkAttempts,studentName:s.studentName??'',studentClass:s.studentClass??'',attemptId:s.attemptId??newAttemptId(),complete:s.complete===true&&canComplete(s)};
  }catch{return freshExtraction();}
}

export function answerCheckpoint(s,choice){
 const q=checkpoints[s.step];if(s.stage!==1||!q||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return s;
 const attempts=s.checkAttempts?.[s.step]||[];
 return {...s,checks:{...s.checks,[s.step]:choice},checkAttempts:{...s.checkAttempts,[s.step]:attempts.at(-1)===choice?attempts:[...attempts,choice]},complete:false};
}
