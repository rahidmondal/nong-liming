import { ThaiPavilionIcon as MessageSquareText } from '@/components/ThaiIcons';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SentenceBuilder } from './SentenceBuilder';

export function SentencePracticePage() {
  return (
    <div className="min-h-full flex flex-col p-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-primary" />
            Sentence Practice
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 mt-4">
        <p className="text-muted-foreground text-sm">
          Build sentences using your graduated flashcard words and hear them spoken aloud. Combine words from the pool
          below by clicking them.
        </p>

        <SentenceBuilder />
      </main>
    </div>
  );
}
