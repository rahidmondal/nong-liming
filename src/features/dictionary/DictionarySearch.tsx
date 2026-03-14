import { Search } from 'lucide-react';

interface DictionarySearchProps {
  query: string;
  setQuery: (q: string) => void;
}

export function DictionarySearch({ query, setQuery }: DictionarySearchProps) {
  return (
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all sm:text-sm shadow-sm"
        placeholder="Search for Thai or English meaning, pronunciation..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
        }}
      />
    </div>
  );
}
