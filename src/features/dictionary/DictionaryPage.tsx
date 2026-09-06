import { ThaiManuscriptIcon as BookA } from '@/components/ThaiIcons';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AddFromDictionaryDialog } from './AddFromDictionaryDialog';
import type { DictionaryEntryData } from './dictionaryData';
import { DictionaryEntry } from './DictionaryEntry';
import { DictionarySearch } from './DictionarySearch';
import { useDictionary } from './useDictionary';

export function DictionaryPage() {
  const { query, setQuery, results } = useDictionary();
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntryData | null>(null);

  return (
    <div className="min-h-full flex flex-col p-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookA className="w-6 h-6 text-primary" />
          Dictionary
        </h1>
      </header>

      <DictionarySearch query={query} setQuery={setQuery} />

      <main className="flex-1 flex flex-col gap-4">
        {results.length > 0 ? (
          results.map(entry => (
            <DictionaryEntry
              key={entry.id}
              entry={entry}
              onAdd={e => {
                setSelectedEntry(e);
              }}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No words found for "{query}"</p>
          </div>
        )}
      </main>

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
    </div>
  );
}
