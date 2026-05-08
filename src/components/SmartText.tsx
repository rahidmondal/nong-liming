import { useState, useMemo } from 'react';
import { DICTIONARY_DATA, type DictionaryEntryData } from '@/features/dictionary/dictionaryData';
import { AddFromDictionaryDialog } from '@/features/dictionary/AddFromDictionaryDialog';

declare namespace Intl {
  class Segmenter {
    constructor(locales?: string | string[], options?: { granularity?: 'grapheme' | 'word' | 'sentence' });
    segment(input: string): Segments;
  }
  interface Segments {
    containing(codeUnitIndex?: number): SegmentData;
    [Symbol.iterator](): IterableIterator<SegmentData>;
  }
  interface SegmentData {
    segment: string;
    index: number;
    input: string;
    isWordLike?: boolean;
  }
}

interface SmartTextProps {
  text: string;
  className?: string;
}

export function SmartText({ text, className = '' }: SmartTextProps) {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntryData | null>(null);

  const segments = useMemo(() => {
    try {
      const segmenter = new Intl.Segmenter('th-TH', { granularity: 'word' });
       
      const segmentsArray = Array.from(segmenter.segment(text));
      return segmentsArray.map(s => ({
        text: s.segment,
        isWordLike: Boolean(s.isWordLike),
      }));
    } catch (_e) {
      // Fallback if Intl.Segmenter is not available
      return [{ text, isWordLike: false }];
    }
  }, [text]);

  const handleWordClick = (word: string) => {
    const cleanWord = word.trim();
    const entry = DICTIONARY_DATA.find(e => e.word === cleanWord);
    if (entry) {
      setSelectedEntry(entry);
    }
  };

  return (
    <>
      <div className={`leading-relaxed ${className}`}>
        {segments.map((segment, idx) => {
          if (segment.isWordLike) {
            const hasEntry = DICTIONARY_DATA.some(e => e.word === segment.text.trim());
            return (
              <span
                key={idx}
                onClick={() => { handleWordClick(segment.text); }}
                className={
                  hasEntry
                    ? 'cursor-pointer text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all'
                    : 'text-foreground'
                }
              >
                {segment.text}
              </span>
            );
          }
          return (
            <span key={idx} className="text-foreground">
              {segment.text}
            </span>
          );
        })}
      </div>

      <AddFromDictionaryDialog
        open={selectedEntry !== null}
        entry={selectedEntry}
        onClose={() => {
          setSelectedEntry(null);
        }}
        onAdded={() => {
          setSelectedEntry(null);
        }}
      />
    </>
  );
}
