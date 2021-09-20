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

export interface ScrapedIdol {
  picLink: string;
  name?: string;
  group?: string;
  label?: string;
  nationality?: string;
  birthdate?: string;
  height?: string;
  weight?: string;
  position?: string;
}

export interface ScrapedGroup {
  picLink: string;
  group?: string;
  label?: string;
  debut?: string;
  members?: string[];
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
