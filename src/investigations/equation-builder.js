import {site} from '../site.js';

// Bundles preserve the quantities in the supplied 19-card molecule set.
export const equationCards = [
  {id:'oxygen',label:'6 O₂ · Oxygen',atoms:[0,0,12],photo:'products',resp:'reactants'},
  {id:'glucose',label:'1 C₆H₁₂O₆ · Glucose',atoms:[6,12,6],photo:'products',resp:'reactants'},
  {id:'water',label:'6 H₂O · Water',atoms:[0,12,6],photo:'reactants',resp:'products'},
  {id:'co2',label:'6 CO₂ · Carbon dioxide',atoms:[6,0,12],photo:'reactants',resp:'products'},
  {id:'heat',label:'Heat',photo:'unused',resp:'energy'},
  {id:'chlorophyll',label:'Chlorophyll',photo:'arrow',resp:'unused'},
  {id:'atp',label:'ATP',photo:'unused',resp:'energy'},
  {id:'light',label:'Light energy',photo:'arrow',resp:'unused'},
  {id:'mitochondrion',label:'Mitochondrion',photo:'unused',resp:'arrow'},
];
const zones={bank:'Card bank',reactants:'Reactants · matter in',arrow:'Above the reaction arrow',products:'Products · matter out',energy:'Energy transfer beside products',unused:'Set aside for this model'};
export function equationFeedback(mode, placements){
  const correct=equationCards.filter(c=>placements[c.id]===c[mode]).length;
  const totals=side=>equationCards.reduce((a,c)=>a.map((n,i)=>n+(placements[c.id]===side?(c.atoms?.[i]||0):0)),[0,0,0]);
  return {correct,reactants:totals('reactants'),products:totals('products')};
}
class EquationBuilder extends HTMLElement {
  connectedCallback(){
    if(this.shadowRoot)return;
    this.attachShadow({mode:'open'});
    this.mode=this.getAttribute('mode')==='resp'?'resp':'photo';
    this.placements={};this.checked=false;this.restore();this.render();
    this.shadowRoot.addEventListener('change',e=>{
      if(e.target.id==='mode'){this.mode=e.target.value;this.restore();this.render();return;}
      const card=e.target.dataset.card;if(!card)return;
      this.placements[card]=e.target.value;this.checked=false;this.save();this.render(card);
    });
    this.shadowRoot.addEventListener('click',e=>{
      if(e.target.id==='check'){this.checked=true;this.save();this.render();}
      if(e.target.id==='restart'){this.placements={};this.checked=false;this.save();this.render();}
    });
  }
  get key(){return `science-labs:${site.root.pathname}:equation-builder:v1:${this.mode}`;}
  restore(){
    this.placements={};this.checked=false;this.warning='';
    try{const state=JSON.parse(localStorage.getItem(this.key)||'{}');
      for(const c of equationCards)if(Object.hasOwn(zones,state.placements?.[c.id]))this.placements[c.id]=state.placements[c.id];
      this.checked=state.checked===true;
    }catch{this.warning='Practice could not be restored. This activity still works in this tab.';}
  }
  save(){try{localStorage.setItem(this.key,JSON.stringify({placements:this.placements,checked:this.checked}));}catch{this.warning='Practice could not be saved. Keep this tab open while working.';}}
  render(focus){
    const result=equationFeedback(this.mode,this.placements);
    const names=side=>equationCards.filter(c=>this.placements[c.id]===side).map(c=>c.label).join(' + ')||'Place cards here';
    this.shadowRoot.innerHTML=`<style>
      :host{display:block;color:#213c35;font-family:inherit}*{box-sizing:border-box}label{display:block;font-weight:600}select,button{font:inherit;padding:.65rem;border:1px solid #718e80;border-radius:8px;background:white;color:#213c35;max-width:100%}button{cursor:pointer;margin:.5rem .5rem .5rem 0}select:focus-visible,button:focus-visible{outline:3px solid #286ac5;outline-offset:2px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem}.card,.zone{padding:.85rem;border:1px dashed #769889;border-radius:10px;background:#f4f8f1}.card select{display:block;width:100%;margin-top:.5rem}.board{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin:1rem 0}.zone strong{display:block;margin-bottom:.4rem}.hint{font-size:.9rem}.feedback{background:#e8f1df;padding:1rem;border-radius:8px}h3{margin-top:1.3rem}@media(max-width:550px){.board{grid-template-columns:1fr}}
    </style><h2>Build the equation</h2>
    <p>Arrange the cutouts into a model of matter and energy. Each molecule card below is a bundle matching the paper set: 6 carbon dioxide, 6 water, 6 oxygen, and 1 glucose molecule (19 total). Use the location menus with a mouse, touch, or keyboard. Plus signs and the reaction arrow are supplied.</p>
    <label>Choose a model <select id="mode"><option value="photo" ${this.mode==='photo'?'selected':''}>Photosynthesis</option><option value="resp" ${this.mode==='resp'?'selected':''}>Cellular respiration</option></select></label>
    ${this.mode==='resp'?'<p><strong>Connection to the yeast lab:</strong> This models aerobic cellular respiration, which uses oxygen. Fermentation does not use oxygen and is not represented by this equation. Plants carry out cellular respiration too.</p>':''}
    <h3>Arrange the cards</h3><div class="cards">${equationCards.map(c=>`<div class="card"><label>${c.label}<select data-card="${c.id}" aria-label="Location for ${c.label}">${Object.entries(zones).map(([id,label])=>`<option value="${id}" ${(this.placements[c.id]||'bank')===id?'selected':''}>${label}</option>`).join('')}</select></label>${this.checked?`<p class="hint">${this.placements[c.id]===c[this.mode]?'✓ Correct location.':c.atoms?'Reconsider whether this matter enters or leaves the process.':'Is this symbol needed? Consider its role in light absorption, location, or energy transfer.'}</p>`:''}</div>`).join('')}</div>
    <h3>Your model · Reactants → Products</h3><div class="board">${Object.entries(zones).filter(([id])=>id!=='bank').map(([id,label])=>`<div class="zone"><strong>${label}</strong>${names(id)}</div>`).join('')}</div>
    <button id="check">Check arrangement</button><button id="restart">Reset this model</button>
    <div role="status">${this.checked?`<div class="feedback"><strong>${result.correct} / ${equationCards.length} card groups placed correctly.</strong><p>Atom inventory (C, H, O): reactants ${result.reactants.join(', ')}; products ${result.products.join(', ')}. A complete balanced model has 6 C, 12 H, and 18 O on each side. Balance alone does not establish the correct direction.</p>${result.correct===9?`<p>${this.mode==='photo'?'Light absorbed by chlorophyll supports the formation of glucose. Some light energy becomes chemical energy stored in glucose.':'Some chemical energy from glucose is transferred to ATP, and some is released as heat.'}</p>`:'<p>Use the feedback under each card, revise, and check again.</p>'}</div>`:''}${this.warning?`<p>${this.warning}</p>`:''}</div>
    <details><summary>Hints and model limits</summary><p>${this.mode==='photo'?'Identify the molecules plants take in to make sugar and the gas released. Light and chlorophyll belong above the arrow; they are not counted as reactant molecules.':'Start with the fuel and the gas used in aerobic respiration. Put the organelle above the arrow and energy-transfer symbols beside the products. Set light and chlorophyll aside.'}</p><p>Count only the four molecule bundles in this simplified matter equation. ATP is a molecule, but this ATP card is an energy-transfer annotation; ADP and phosphate are omitted. One ATP card does not mean one ATP molecule is produced. Respiration starts in the cytoplasm; most later stages in plant and animal cells occur in mitochondria. These overall equations do not show reaction stages or imply that respiration simply runs photosynthesis backward.</p></details><p class="hint">Optional introduction or follow-up · Practice saves separately in this browser · No grade is submitted. Use the worksheet cutouts for the same activity on paper.</p>`;
    if(focus)this.shadowRoot.querySelector(`[data-card="${focus}"]`).focus();
  }
}
customElements.define('equation-builder',EquationBuilder);
