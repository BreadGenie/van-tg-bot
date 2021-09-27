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
  group?: string;
  label?: string;
  nationality?: string;
  birthdate?: string;
  height?: string;
  weight?: string;
  position?: string;
  diceCoeff?: number;
}

export interface ScrapedGroup {
  picLink: string;
  name?: string;
  label?: string;
  debut?: string;
  members?: string[];
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
