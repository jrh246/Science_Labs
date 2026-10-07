export const molecules = {
  co2:{label:'CO₂',name:'Carbon dioxide',atoms:[1,0,2],drawing:['O','C','O']},
  water:{label:'H₂O',name:'Water',atoms:[0,2,1],drawing:['H','O','H']},
  glucose:{label:'C₆H₁₂O₆',name:'Glucose',atoms:[6,12,6],drawing:['C','C','C','C','C','C']},
  oxygen:{label:'O₂',name:'Oxygen',atoms:[0,0,2],drawing:['O','O']},
};
export const zones = [
  {id:'photo-in',label:'Photosynthesis inputs',accept:{co2:6,water:6}},
  {id:'photo-help',label:'Light absorption',accept:{light:1,chlorophyll:1}},
  {id:'photo-out',label:'Photosynthesis outputs',accept:{glucose:1,oxygen:6}},
  {id:'resp-out',label:'Respiration outputs',accept:{co2:6,water:6}},
  {id:'resp-place',label:'Respiration location',accept:{mitochondrion:1}},
  {id:'resp-in',label:'Respiration inputs',accept:{glucose:1,oxygen:6}},
  {id:'resp-energy',label:'Energy transferred out',accept:{atp:1,heat:1}},
];
// Two complete sets: 38 individual molecules plus five annotations. Identical molecules are interchangeable.
export const cards = ['oxygen','water','glucose','co2'].flatMap(type=>Array.from({length:type==='glucose'?2:12},(_,i)=>({id:`${type}-${i+1}`,type,...molecules[type]}))).concat([
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
    const correct=placed.length===Object.values(z.accept).reduce((a,b)=>a+b,0)&&Object.entries(z.accept).every(([type,count])=>placed.filter(c=>c.type===type).length===count);
    return {...z,correct,atoms:placed.reduce((sum,c)=>sum.map((n,i)=>n+(c.atoms?.[i]||0)),[0,0,0])};
  });
  return {zones:results,complete:results.every(z=>z.correct)};
}
