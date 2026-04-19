/**
 * Regular expressions for matching complete Thai characters (Consonant base + optional upper/lower vowel + optional tone mark)
 *
 * Thai Unicode blocks:
 * \u0E01-\u0E2E : Consonants
 * \u0E30-\u0E3A : Lower/Upper vowels
 * \u0E40-\u0E44 : Leading vowels
 * \u0E47-\u0E4E : Tone marks and diacritics
 */
const THAI_CHAR_REGEX = /([\u0E40-\u0E44]?[\u0E01-\u0E2E][\u0E30-\u0E3A]?[\u0E47-\u0E4E]?)/g;

/**
 * Splits a Thai string into meaningful functional chunks.
 * e.g., "เรียน" -> ["เ", "รี", "ย", "น"]
 */
export function splitThaiString(text: string): string[] {
  if (!text) return [];
  // Use regex to find all valid character clusters, filtering out empties
  const matches = text.match(THAI_CHAR_REGEX);
  if (!matches) return text.split('');
  return matches.filter(Boolean);
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
