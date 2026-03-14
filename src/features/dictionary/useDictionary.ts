import { useState, useMemo } from 'react';
import { DICTIONARY_DATA } from './dictionaryData';

export function useDictionary() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return DICTIONARY_DATA;

    const lowerQuery = query.toLowerCase();
    return DICTIONARY_DATA.filter(
      entry =>
        entry.word.includes(lowerQuery) ||
        entry.meaning.toLowerCase().includes(lowerQuery) ||
        entry.pronunciation.toLowerCase().includes(lowerQuery),
    );
  }, [query]);

  return {
    query,
    setQuery,
    results,
  };
}
