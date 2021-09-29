export interface Idol {
  idolName: string;
  idolGroup: string;
  idolLink: string;
  diceCoeff?: number;
}

export interface Group {
  groupName: string;
  groupLink: string;
  diceCoeff?: number;
}

export interface ScrapedIdol {
  picLink: string;
  name?: string;
  description?: string;
  Group?: string;
  Label?: string;
  Nationality?: string;
  Birthdate?: string;
  Height?: string;
  Weight?: string;
  Position?: string;
  diceCoeff?: number;
}

export interface ScrapedGroup {
  picLink: string;
  Name?: string;
  Label?: string;
  Debut?: string;
  Members?: string[];
  diceCoeff?: number;
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
