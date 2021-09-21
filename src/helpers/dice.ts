import { MatchString, MatchStringArray } from '../types';

const getBigrams = (str: string) => {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
};

const intersect = (set1, set2) => {
  return new Set([...set1].filter((x) => set2.has(x)));
};

const matchStrings = (
  mainString: string,
  matchString: string,
  index = 0
): MatchString => {
  if (mainString.length === 1) {
    if (mainString === matchString) {
      return {
        diceCoeff: 1,
        matchString,
        index,
      };
    } else {
      return {
        diceCoeff: 0,
        matchString: '',
        index,
      };
    }
  }
  const bigrams1 = getBigrams(mainString);
  const bigrams2 = getBigrams(matchString);
  return {
    diceCoeff:
      (2 * intersect(bigrams1, bigrams2).size) /
      (bigrams1.size + bigrams2.size),
    matchString,
    index,
  };
};

const matchStringArray = (
  str: string,
  arr: string[],
  options: { maxBestMatch: number } = { maxBestMatch: 1 }
): MatchStringArray => {
  const matchedStrings = arr.map((s, i) => matchStrings(str, s, i));
  const bestMatch: MatchString[] = [];

  // spreading done to avoid matchedStrings to be changed while splicing
  const tempMatchedStrings = [...matchedStrings];

  for (let i = 0; i < options.maxBestMatch; i++) {
    bestMatch.push(
      tempMatchedStrings.reduce((max, obj) => {
        return obj.diceCoeff > max.diceCoeff ? obj : max;
      })
    );

    tempMatchedStrings.splice(bestMatch[i].index - i, 1);
  }

  return { matchedStrings, bestMatch };
};

export { matchStrings, matchStringArray };
