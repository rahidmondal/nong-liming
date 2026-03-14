export interface ToneQuestion {
  id: string;
  syllable: string;
  romanization: string;
  tone: 'mid' | 'low' | 'falling' | 'high' | 'rising';
}

export const TONE_QUESTIONS: ToneQuestion[] = [
  { id: '1', syllable: 'คา', romanization: 'kaa', tone: 'mid' },
  { id: '2', syllable: 'ข่า', romanization: 'kàa', tone: 'low' },
  { id: '3', syllable: 'ค่า', romanization: 'kâa', tone: 'falling' },
  { id: '4', syllable: 'ค้า', romanization: 'káa', tone: 'high' },
  { id: '5', syllable: 'ขา', romanization: 'kǎa', tone: 'rising' },
  { id: '6', syllable: 'ปา', romanization: 'bpaa', tone: 'mid' },
  { id: '7', syllable: 'ป่า', romanization: 'bpàa', tone: 'low' },
  { id: '8', syllable: 'ป้า', romanization: 'bpâa', tone: 'falling' },
  { id: '9', syllable: 'ป๊า', romanization: 'bpáa', tone: 'high' },
  { id: '10', syllable: 'ป๋า', romanization: 'bpǎa', tone: 'rising' },
  { id: '11', syllable: 'ทำ', romanization: 'tam', tone: 'mid' },
  { id: '12', syllable: 'มาก', romanization: 'mâak', tone: 'falling' },
  { id: '13', syllable: 'ช้าง', romanization: 'cháang', tone: 'high' },
  { id: '14', syllable: 'สวย', romanization: 'sǔay', tone: 'rising' },
  { id: '15', syllable: 'ดี', romanization: 'dee', tone: 'mid' },
];
