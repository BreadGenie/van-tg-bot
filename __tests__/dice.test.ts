import { matchStrings, matchStringArray } from '../src/helpers/dice';

describe('Dice co-efficient tests', () => {
  test('should find the most similar string from an array of strings', () => {
    const result = matchStringArray('bts', ['bts', 'tts', 'br0']);
    const matchedStrings = [
      { diceCoeff: 1, index: 0, matchString: 'bts' },
      { diceCoeff: 0.5, index: 1, matchString: 'tts' },
      { diceCoeff: 0, index: 2, matchString: 'br0' },
    ];
    const bestMatch = [{ diceCoeff: 1, index: 0, matchString: 'bts' }];
    expect(result).toStrictEqual({ matchedStrings, bestMatch });
  });

  test('should find the correct dice co-efficient comparing 2 strings', () => {
    const result = matchStrings('kami', 'komi');
    const matchedString = {
      diceCoeff: 0.3333333333333333,
      index: 0,
      matchString: 'komi',
    };
    expect(result).toStrictEqual(matchedString);
  });
});
