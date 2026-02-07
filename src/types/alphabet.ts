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
