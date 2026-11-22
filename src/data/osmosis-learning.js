export const predictionPrompt = 'Predict which tubes will gain mass, lose mass, or change very little. Use the sugar concentrations inside and outside each tube to explain your prediction.';

export const reasoningQuestions = [
  {
    id: 'concentration-and-change',
    goal: 'Explain water movement using evidence',
    prompt: 'Use one tube that gained mass and one that lost mass. Give each tube\'s inside and outside sugar concentrations and mass change. Explain the net direction of water movement.'
  },
  {
    id: 'equal-concentrations',
    goal: 'Explain equal concentrations',
    prompt: 'Tubes A and D have equal sugar concentrations on both sides. Use their mass changes to explain what equal concentrations mean. Does water stop moving, or move both ways at similar rates?'
  },
  {
    id: 'controls-and-limits',
    goal: 'Evaluate the comparison',
    prompt: 'Compare tubes B, C, D, and E. Which conditions were kept the same? Explain one limit of using these supplied masses to predict what a real cell will do.'
  }
];

export const osmosisModelNote = 'The masses come from supplied observations with small measurement variation. The model uses the starting sugar concentrations to explain water movement. It does not calculate the final masses from those concentrations.';
export const osmosisSource = 'https://openstax.org/books/biology-2e/pages/5-2-passive-transport';
