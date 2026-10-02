// Experimental measurements supplied by the teacher in this conversation.
// Independent verification against the original interactive remains unavailable.
export const labConfig = {
  dataStatus: 'Teacher-supplied experimental data',
  experimentHours:24,
  dishMass:2.5, // Illustrative equipment mass; not supplied in original data.
  tolerance:0.02,
  measurementVariation:0.05, isotonicMaxChange:0.20,
  beakers:[
    {id:'A',waterMl:1000,sugarGrams:0,sugarPercent:0},
    {id:'B',waterMl:1000,sugarGrams:0,sugarPercent:0},
    {id:'C',waterMl:1000,sugarGrams:50,sugarPercent:5},
    {id:'D',waterMl:1000,sugarGrams:100,sugarPercent:10},
    {id:'E',waterMl:1000,sugarGrams:150,sugarPercent:15}
  ],
  tubes:[
    {id:'A',sugarPercent:0,initialMass:17.59,baselineFinalMass:17.66},
    {id:'B',sugarPercent:10,initialMass:8.75,baselineFinalMass:10.40},
    {id:'C',sugarPercent:10,initialMass:11.24,baselineFinalMass:12.10},
    {id:'D',sugarPercent:10,initialMass:10.71,baselineFinalMass:10.57},
    {id:'E',sugarPercent:10,initialMass:18.05,baselineFinalMass:15.60}
  ]
};
// % w/v classroom approximation: added sugar does not change stated volume.
// Measured small changes in isotonic tubes need not be exactly zero.
// A and D are isotonic; C gains mass. Some worksheets misidentify A/C.
