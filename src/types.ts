export type result = string | string[];

export interface Idol {
  idolName: string;
  idolGroup: string;
  idolLink: string;
}

export interface Group {
  groupName: string;
  groupLink: string;
}

export interface MatchString {
  diceCoeff: number;
  matchString: string;
  index: number;
}

export interface MatchStringArray {
  matchedStrings: MatchString[];
  bestMatch: MatchString[];
}
