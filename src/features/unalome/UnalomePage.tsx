import { ArrowLeft, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UnalomeMap } from './UnalomeMap';

export function UnalomePage() {
  return (
    <div className="min-h-full flex flex-col p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          The Unalome Path
        </h1>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Your Journey to Fluency</h2>
          <p className="text-sm text-muted-foreground">
            Follow the path of the Unalome. Begin at the spiral of learning, navigate the weaving curves of practice, and reach the straight line of mastery.
          </p>
        </div>

        <UnalomeMap />
      </main>
    </div>
  );
}
