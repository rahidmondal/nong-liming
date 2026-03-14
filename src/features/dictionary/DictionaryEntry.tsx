import { Plus } from 'lucide-react';
import { ToneDiagram } from '../reference/components/ToneDiagram';
import type { DictionaryEntryData } from './dictionaryData';

const TONE_NAMES = ['mid', 'low', 'falling', 'high', 'rising'];

interface DictionaryEntryProps {
  entry: DictionaryEntryData;
  onAdd: (entry: DictionaryEntryData) => void;
}

export function DictionaryEntry({ entry, onAdd }: DictionaryEntryProps) {
  const toneName = TONE_NAMES[entry.tone] || 'mid';

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl font-bold font-sarabun text-primary">{entry.word}</h3>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {entry.pronunciation}
          </span>
          <div className="w-12 h-6 shrink-0">
            <ToneDiagram type={toneName} />
          </div>
        </div>
        <p className="text-base text-foreground font-medium mb-1">{entry.meaning}</p>
        {entry.example && <p className="text-sm text-muted-foreground italic">e.g. {entry.example}</p>}
      </div>
      <button
        onClick={() => {
          onAdd(entry);
        }}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium transition-colors sm:w-auto w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add to Deck
      </button>
    </div>
  );
}
