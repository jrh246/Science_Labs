// A single-locus prediction for the documented corn cross, separate from observed counts.
export const emptyPunnett=()=>({cells:['','','',''],purple:'',yellow:''});
export function restorePunnett(value){
 const p=emptyPunnett();
 if(Array.isArray(value?.cells)&&value.cells.length===4)p.cells=value.cells.map(v=>['PP','Pp','pp'].includes(v)?v:'');
 for(const key of ['purple','yellow'])if(['0','1','2','3','4'].includes(value?.[key]))p[key]=value[key];
 return p;
}
export function checkPunnett(p){
 if(p.cells.some(v=>!v))return 'Complete all four boxes by combining the allele above each box with the allele beside its row.';
 if(p.cells.some((v,i)=>v!==['PP','Pp','Pp','pp'][i]))return 'Recheck the allele combinations. Each offspring receives one allele from each parent. Write the capital letter first when the alleles differ.';
 if(p.purple===''||p.yellow==='')return 'Your genotype combinations are correct. Now count how many of the four boxes predict each kernel color.';
 if(p.purple!=='3'||p.yellow!=='1')return 'Your genotype combinations are correct. P is dominant: PP and Pp predict purple; only pp predicts yellow. Count the boxes again.';
 return 'Your prediction is consistent: 1 PP : 2 Pp : 1 pp, giving 3 purple : 1 yellow (75% : 25%). For 48 kernels, that predicts 36 purple and 12 yellow on average. Real sample counts can differ by chance; these are probabilities, not a repeating sequence of four kernels.';
}
export function punnettMarkup(p){
 const select=(key,value,values,label)=>`<select data-punnett="${key}" aria-label="${label}"><option value="">Choose…</option>${values.map(v=>`<option value="${v}" ${value===v?'selected':''}>${v}</option>`).join('')}</select>`;
 return `<section class="punnett-panel" aria-labelledby="punnett-heading"><h3 id="punnett-heading">Build your inheritance prediction</h3><p><strong>Parent cross: Pp × Pp.</strong> In this simplified model, P is dominant for purple and p is recessive; pp kernels are yellow. Each parent contributes either P or p, with equal probability.</p><p>Complete the Punnett square by combining one allele from each parent. Each box is an equally likely offspring genotype, not an observed kernel.</p><table class="punnett-square"><caption>Punnett square: Parent 1 across the top; Parent 2 down the side</caption><thead><tr><td></td><th scope="col">P</th><th scope="col">p</th></tr></thead><tbody>${['P','p'].map((allele,row)=>`<tr><th scope="row">${allele}</th>${['P','p'].map((top,col)=>`<td>${select(String(row*2+col),p.cells[row*2+col],['PP','Pp','pp'],`Offspring genotype: Parent 2 ${allele}, Parent 1 ${top}`)}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="punnett-ratio"><label>Purple outcomes out of 4${select('purple',p.purple,['0','1','2','3','4'],'Purple outcomes out of 4')}</label><label>Yellow outcomes out of 4${select('yellow',p.yellow,['0','1','2','3','4'],'Yellow outcomes out of 4')}</label></div><button type="button" data-act="check-punnett">Check my Punnett square</button><p id="punnett-feedback" role="status"></p><p>Use your square to explain your prediction below. What counts would you expect in a 48-kernel sample, and why might the observed counts differ?</p></section>`;
}
export function punnettReport(p){return `Punnett square prediction (Pp × Pp):\nRows P, p; columns P, p\n${p.cells.slice(0,2).map(v=>v||'blank').join(' | ')}\n${p.cells.slice(2).map(v=>v||'blank').join(' | ')}\nPurple outcomes out of 4: ${p.purple||'blank'}; yellow: ${p.yellow||'blank'}\n`;}
