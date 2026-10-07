export const molecules = {
  co2:{label:'6 CO₂',name:'Carbon dioxide',atoms:[6,0,12],drawing:['O','C','O']},
  water:{label:'6 H₂O',name:'Water',atoms:[0,12,6],drawing:['H','O','H']},
  glucose:{label:'1 C₆H₁₂O₆',name:'Glucose',atoms:[6,12,6],drawing:['C','C','C','C','C','C']},
  oxygen:{label:'6 O₂',name:'Oxygen',atoms:[0,0,12],drawing:['O','O']},
};
export const zones = [
  {id:'photo-in',label:'Photosynthesis inputs',accept:['co2','water']},
  {id:'photo-help',label:'Light absorption',accept:['light','chlorophyll']},
  {id:'photo-out',label:'Photosynthesis outputs',accept:['glucose','oxygen']},
  {id:'resp-out',label:'Respiration outputs',accept:['co2','water']},
  {id:'resp-place',label:'Respiration location',accept:['mitochondrion']},
  {id:'resp-in',label:'Respiration inputs',accept:['glucose','oxygen']},
  {id:'resp-energy',label:'Energy transferred out',accept:['atp','heat']},
];
// Two copies let students build both complete equations at once. Copies are interchangeable.
export const cards = ['oxygen','water','glucose','co2'].flatMap(type=>[1,2].map(n=>({id:`${type}-${n}`,type,...molecules[type]}))).concat([
  {id:'heat',type:'heat',label:'HEAT',name:'Energy to the surroundings'},
  {id:'chlorophyll',type:'chlorophyll',label:'CHLOROPHYLL',name:'Light-absorbing pigment'},
  {id:'atp',type:'atp',label:'ATP',name:'Energy for cell work'},
  {id:'light',type:'light',label:'LIGHT',name:'Energy from sunlight'},
  {id:'mitochondrion',type:'mitochondrion',label:'MITOCHONDRION',name:'Organelle symbol'},
]);
export function validPlacements(value){
  return Object.fromEntries(cards.filter(c=>zones.some(z=>z.id===value?.[c.id])).map(c=>[c.id,value[c.id]]));
}
export function evaluateCycle(placements){
  const results=zones.map(z=>{
    const placed=cards.filter(c=>placements[c.id]===z.id);
    const correct=placed.length===z.accept.length&&z.accept.every(type=>placed.filter(c=>c.type===type).length===1);
    return {...z,correct,atoms:placed.reduce((sum,c)=>sum.map((n,i)=>n+(c.atoms?.[i]||0)),[0,0,0])};
  });
  return {zones:results,complete:results.every(z=>z.correct)};
}
