export type ConsonantClass = 'mid' | 'high' | 'low';

export interface ThaiConsonant {
  id: string;
  thaiChar: string;
  thaiName: string;
  hindiEquiv: string;
  sanskritRoot?: string;
  class: ConsonantClass;
  startSound: string;
  finalSound: string;
}

export type VowelType = 'mono' | 'dip' | 'special';

export interface ThaiVowel {
  id: string;
  thaiChar: string;
  thaiName: string;
  english: string;
  hindiEquiv?: string;
  type: VowelType;
}

export interface ThaiNumber {
  id: string;
  thaiChar: string;
  arabicEquivalent: string;
  english: string;
  pronunciation: string;
  thaiName: string;
}

export interface ThaiTone {
  id: string;
  thaiChar: string;
  thaiName: string;
  english: string;
  hindiEquiv?: string;
  effect: string;
  diagram: string;
}
