import type { ThaiTone } from '@/types/alphabet';

export const tones: ThaiTone[] = [
  {
    id: 'saman',
    thaiChar: '',
    thaiName: 'สามัญ — sǎa-man (Common)',
    english: 'Mid tone (no mark)',
    effect: 'The default tone — flat, mid-level pitch with no tone marker',
    diagram: 'mid',
  },
  {
    id: 'mai-ek',
    thaiChar: '่',
    thaiName: 'ไม้เอก — mái èek (First mark)',
    english: 'Low tone mark',
    effect: 'Produces a low tone on mid-class consonants, a falling tone on high-class consonants',
    diagram: 'low',
  },
  {
    id: 'mai-tho',
    thaiChar: '้',
    thaiName: 'ไม้โท — mái too (Second mark)',
    english: 'Falling tone mark',
    effect: 'Produces a falling tone on mid-class consonants, a high tone on high-class consonants',
    diagram: 'falling',
  },
  {
    id: 'mai-tri',
    thaiChar: '๊',
    thaiName: 'ไม้ตรี — mái dtrii (Third mark)',
    english: 'High tone mark',
    effect: 'Produces a high tone (used only with mid-class consonants)',
    diagram: 'high',
  },
  {
    id: 'mai-chattawa',
    thaiChar: '๋',
    thaiName: 'ไม้จัตวา — mái jàt-dtà-waa (Fourth mark)',
    english: 'Rising tone mark',
    effect: 'Produces a rising tone (used only with mid-class consonants)',
    diagram: 'rising',
  },
];
