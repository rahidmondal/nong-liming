import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Loader2, Play, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { PracticeSaveButton } from '@/components/PracticeSaveButton';

const DEFAULT_WORDS = [
  { word: 'ฉัน', meaning: 'I (female)' },
  { word: 'ผม', meaning: 'I (male)' },
  { word: 'คุณ', meaning: 'You' },
  { word: 'เขา', meaning: 'He / She / They' },
  { word: 'เรา', meaning: 'We / Us' },
  { word: 'กิน', meaning: 'Eat' },
  { word: 'ดื่ม', meaning: 'Drink' },
  { word: 'ไป', meaning: 'Go' },
  { word: 'มา', meaning: 'Come' },
  { word: 'ชอบ', meaning: 'Like' },
  { word: 'อยาก', meaning: 'Want to' },
  { word: 'ทำ', meaning: 'Do / Make' },
  { word: 'ข้าว', meaning: 'Rice / Food' },
  { word: 'น้ำ', meaning: 'Water' },
  { word: 'กาแฟ', meaning: 'Coffee' },
  { word: 'มาก', meaning: 'Very' },
  { word: 'ไม่', meaning: 'No / Not' },
  { word: 'อร่อย', meaning: 'Delicious' },
  { word: 'ดี', meaning: 'Good' },
  { word: 'อะไร', meaning: 'What' },
  { word: 'ที่ไหน', meaning: 'Where' },
];

export function SentenceBuilder() {
  const graduatedWords = useLiveQuery(() => db.graduatedWords.toArray());
  const [sentence, setSentence] = useState<string[]>([]);
  const { speak, isSpeaking } = useTTS('th-TH');

  if (graduatedWords === undefined) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Combine default words with graduated words, deduplicating by word
  const wordMap = new Map<string, string>();
  for (const dw of DEFAULT_WORDS) {
    wordMap.set(dw.word, dw.meaning);
  }
  for (const gw of graduatedWords) {
    wordMap.set(gw.word, gw.meaning);
  }

  const wordPool = Array.from(wordMap.entries()).map(([word, meaning]) => ({ word, meaning }));

  const handleAddWord = (word: string) => {
    setSentence(prev => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setSentence([]);
  };

  const handlePlay = () => {
    if (sentence.length > 0) {
      speak(sentence.join(' '));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Canvas */}
      <div className="bg-card rounded-2xl border-2 border-dashed border-border p-6 min-h-[160px] flex flex-col justify-between">
        <div className="flex flex-wrap gap-2 mb-4">
          {sentence.length === 0 ? (
            <p className="text-muted-foreground italic w-full text-center py-4">
              Tap words below to build a sentence...
            </p>
          ) : (
            sentence.map((word, i) => (
              <button
                key={i}
                onClick={() => {
                  handleRemoveWord(i);
                }}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-all outline-none rounded-xl text-lg font-sarabun font-bold shadow-sm"
              >
                {word}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <button
            onClick={handleClear}
            disabled={sentence.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handlePlay}
            disabled={sentence.length === 0 || isSpeaking}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Play Audio
          </button>
        </div>
      </div>

      <PracticeSaveButton
        kind="sentence"
        contentKey={sentence.join(' ')}
        label={sentence.join(' ')}
        disabled={sentence.length < 2 || sentence.join(' ').length > 800}
      />
      {/* Word Pool */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">Word Pool</h3>
        <div className="flex flex-wrap gap-2">
          {wordPool.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                handleAddWord(item.word);
              }}
              className="group relative px-4 py-2 bg-card border border-border rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-lg font-sarabun text-foreground">{item.word}</span>
              {/* Tooltip for meaning */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {item.meaning}
              </div>
            </button>
          ))}
        </div>
        {graduatedWords.length === 0 && (
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Review and graduate flashcards to add your own words to this pool!
          </p>
        )}
      </div>
    </div>
  );
}
