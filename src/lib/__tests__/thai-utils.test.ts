import { afterEach, describe, expect, it, vi } from 'vitest';
import { splitThaiString } from '../thai-utils';

describe('Thai writing feedback segmentation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['น้ำ', ['น้ำ']],
    ['เข้า', ['เ', 'ข้', 'า']],
    ['เกี๊ยว', ['เ', 'กี๊', 'ย', 'ว']],
    ['กิ่', ['กิ่']],
    ['เรียน', ['เ', 'รี', 'ย', 'น']],
  ])('keeps the graphemes and vowels in %s', (text, expected) => {
    expect(splitThaiString(text)).toEqual(expected);
  });

  it.each(['น้ำ เข้า ๑๒ ฯ ๆ 🪷', 'ก\u0e4d\u0e32', '่', 'Thai ไทย', ''])('preserves the complete original text: %s', text => {
    expect(splitThaiString(text).join('')).toBe(text);
  });

  it('falls back to whole codepoints without dropping marks or splitting emoji', () => {
    vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined });
    expect(splitThaiString('น้ำ 🪷')).toEqual(['น', '้', 'ำ', ' ', '🪷']);
    expect(splitThaiString('')).toEqual([]);
  });
});
