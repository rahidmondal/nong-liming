/**
 * Splits text into display graphemes without losing or normalizing any input.
 * These are not syllables or words: spacing vowels can be separate graphemes.
 * Older browsers fall back to codepoints, preserving surrogate pairs and marks.
 */
export function splitThaiString(text: string): string[] {
  if (!text) return [];
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), item => item.segment);
  }
  return Array.from(text);
}

/**
 * Extracts just the consonant base strings from a given text, ignoring vowels and tones.
 */
export function extractConsonants(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/[\u0E01-\u0E2E]/g);
  return matches ?? [];
}

/**
 * Checks if a string contains any Thai characters
 */
export function hasThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text);
}
