import type { ThaiTone } from '@/types/alphabet';

export const tones: ThaiTone[] = [
  {
    id: 'saman',
    thaiChar: '',
    thaiName: 'สามัญ — sǎa-man (Common)',
    english: 'No tone mark',
    effect: 'An unmarked syllable is not always mid tone. Its tone depends on the initial consonant class, live/dead syllable type, and sometimes vowel length. The contour below shows the mid tone as one example.',
    diagram: 'mid',
  },
  {
    id: 'mai-ek',
    thaiChar: '่',
    thaiName: 'ไม้เอก — mái èek (First mark)',
    english: 'Mai ek — first tone mark',
    effect: 'Produces a low tone with mid- or high-class initials, and a falling tone with low-class initials. The contour below shows the low-tone case.',
    diagram: 'low',
  },
  {
    id: 'mai-tho',
    thaiChar: '้',
    thaiName: 'ไม้โท — mái too (Second mark)',
    english: 'Mai tho — second tone mark',
    effect: 'Produces a falling tone with mid- or high-class initials, and a high tone with low-class initials. The contour below shows the falling-tone case.',
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
