import { describe, expect, it } from 'vitest';
import { composeSyllable } from './composeSyllable';

describe('Thai spelling patterns', () => {
  it.each([
    ['ก', 'อะ', '', 'บ', 'กับ'],
    ['ค', 'โอะ', '', 'น', 'คน'],
    ['ก', 'อิ', '่', '', 'กิ่'],
    ['ด', 'เอะ', '', 'ก', 'เด็ก'],
    ['ก', 'อือ', '', 'น', 'กืน'],
    ['ส', 'อัว', '', 'น', 'สวน'],
  ])('places the signs for %s + %s correctly', (initial, vowel, tone, final, expected) => {
    expect(composeSyllable(initial, vowel, tone, final).text).toBe(expected);
  });
  it('does not invent unsupported closed diphthong spellings', () => {
    expect(composeSyllable('ก', 'เอียะ', '', 'น')).toMatchObject({ text: '', supported: false });
  });
  it('does not combine mai taikhu with a tone mark', () => {
    expect(composeSyllable('ก', 'เอะ', '่', 'น').supported).toBe(false);
  });
});
