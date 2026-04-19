import { motion } from 'framer-motion';
import { ArrowLeft, Clock, TrendingUp, HelpCircle, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SpacedRepetitionGuide() {
  return (
    <div className="min-h-full flex flex-col p-6 max-w-2xl mx-auto">
      <header className="flex items-center gap-3 py-4 mb-2">
        <Link to="/settings" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">How It Works</h1>
      </header>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
        <section className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-2xl flex items-start gap-4">
            <BrainCircuit className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">The Science of Memory</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                NongLiMing uses <strong>Spaced Repetition (SM-2)</strong>, a scientifically proven algorithm designed to
                combat the <em>forgetting curve</em>. Instead of cramming, the app predicts exactly when you are about
                to forget a word, and tests you right beforehand to maximize long-term retention.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            What is "Ease"?
          </h3>
          <div className="p-5 bg-card border border-border shadow-sm rounded-xl space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              Every flashcard has an internal multiplier called the <strong>Ease Factor</strong>. It starts at{' '}
              <strong>2.50</strong>. This number determines how quickly the interval between reviews grows.
            </p>
            <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-4 marker:text-muted-foreground">
              <li>
                An Ease of <strong>2.50</strong> means if you wait 10 days this time, you will wait 25 days next time.
              </li>
              <li>Rating a card "Hard" or "Again" reduces the Ease (making future intervals shorter).</li>
              <li>Rating a card "Easy" increases the Ease (making future intervals much longer).</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            What do the buttons actually do?
          </h3>
          <div className="grid gap-3">
            <div className="p-4 bg-card border border-border shadow-sm rounded-xl flex gap-3 items-start">
              <span className="w-16 shrink-0 inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs rounded text-center">
                AGAIN
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Total reset.</p>
                <p className="text-xs text-muted-foreground">
                  The card's interval drops back to 0 days (learning phase). The Ease multiplier drops significantly.
                  Use this when you go completely blank.
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border shadow-sm rounded-xl flex gap-3 items-start">
              <span className="w-16 shrink-0 inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-xs rounded text-center">
                HARD
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Small bump.</p>
                <p className="text-xs text-muted-foreground">
                  The interval slightly increases (current interval × 1.2), but the Ease multiplier drops. Use this when
                  you remember the answer, but it required heavy mental strain.
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border shadow-sm rounded-xl flex gap-3 items-start">
              <span className="w-16 shrink-0 inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded text-center">
                GOOD
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Normal growth.</p>
                <p className="text-xs text-muted-foreground">
                  The interval multiplies by the current Ease (e.g., × 2.5). The Ease multiplier stays the same.{' '}
                  <strong>This should be your most clicked button.</strong>
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border shadow-sm rounded-xl flex gap-3 items-start">
              <span className="w-16 shrink-0 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs rounded text-center">
                EASY
              </span>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Massive jump.</p>
                <p className="text-xs text-muted-foreground">
                  The interval gets a bonus multiplier (current interval × Ease × 1.3), and the Ease multiplier
                  permanently increases. Only use this for words you know natively well.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Learning vs. Review States
          </h3>
          <div className="p-5 bg-card border border-border shadow-sm rounded-xl space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              When you first see a card, it is in the <strong>Learning</strong> state. It won't use the multiplier math
              yet; instead, it uses hardcoded "steps" (like 10 minutes, then 1 day).
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Once you press "Good" enough times to pass the learning steps, the card <strong>Graduates</strong> into a
              "Review" card, and the full multiplier math takes over.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
