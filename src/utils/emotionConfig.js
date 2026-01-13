export const emotionMap = {
  anger: { color: '#FF0000', line: 'L1', audioProfile: 'intense' },
  sadness: { color: '#00008B', line: 'L5', audioProfile: 'ambient' },
  happiness: { color: '#FFFF00', line: 'L4', audioProfile: 'bright' },
  fear: { color: '#008000', line: 'L3', audioProfile: 'tense' },
  disgust: { color: '#800080', line: 'L2', audioProfile: 'dissonant' },
  surprise: { color: '#FFC0CB', line: 'L9', audioProfile: 'sudden' },
  contempt: { color: '#FFA500', line: 'L7', audioProfile: 'complex' }
};

export const emotionalParameters = {
  entropy: { min: 0, max: 1, default: 0.5 },
  vector: { min: 0, max: 360, default: 0 },
  metabolism: { min: 0.1, max: 1, default: 0.7 }
};
