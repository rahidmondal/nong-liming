import { SpeedPill } from '@/components/PlaybackSpeedSelector';
import { ModeToggle } from '@/components/mode-toggle';
import { consonants } from '@/data/consonants';
import { numbers } from '@/data/numbers';
import { tones } from '@/data/tones';
import { vowels } from '@/data/vowels';
import { ConsonantChart } from '@/features/reference/components/ConsonantChart';
import { ThaiCard } from '@/features/reference/components/ThaiCard';
import { ToneDiagram } from '@/features/reference/components/ToneDiagram';
import { VowelChart } from '@/features/reference/components/VowelChart';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Hash, Languages, Music, Type } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type Tab = 'consonants' | 'vowels' | 'numbers' | 'tones';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'consonants', label: 'Consonants', icon: <Type className="w-4 h-4" /> },
  { key: 'vowels', label: 'Vowels', icon: <Languages className="w-4 h-4" /> },
  { key: 'numbers', label: 'Numbers', icon: <Hash className="w-4 h-4" /> },
  { key: 'tones', label: 'Tones', icon: <Music className="w-4 h-4" /> },
];

export function ReferencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('consonants');
  const userStats = useLiveQuery(() => db.userStats.get(1));

  return (
    <div className="min-h-full flex flex-col p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-4 mb-2">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">Reference</h1>
        <div className="flex items-center gap-3">
          {userStats && (
            <SpeedPill
              currentSpeed={userStats.playbackSpeed}
              onSpeedChange={speed => void db.userStats.update(1, { playbackSpeed: speed })}
            />
          )}
          <ModeToggle />
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
            }}
            className={`
              flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap
              ${
                activeTab === tab.key
                  ? 'bg-card text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {activeTab === 'consonants' && <ConsonantChart consonants={consonants} />}
          {activeTab === 'vowels' && <VowelChart vowels={vowels} />}
          {activeTab === 'numbers' && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
                Thai Numerals
                <span className="text-sm font-normal text-muted-foreground">({numbers.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {numbers.map(n => (
                  <ThaiCard
                    key={n.id}
                    thaiChar={n.thaiChar}
                    english={`${n.arabicEquivalent} — ${n.english}`}
                    hindiEquiv={n.pronunciation}
                    audioText={n.thaiName}
                  />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'tones' && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
                Tone Marks
                <span className="text-sm font-normal text-muted-foreground">({tones.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tones.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 p-5 bg-card rounded-xl border border-border shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-bold text-foreground">{t.thaiChar ? `ก${t.thaiChar}` : '—'}</span>
                      <span className="text-sm font-semibold text-primary">{t.english}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{t.thaiName}</p>
                    <p className="text-xs text-muted-foreground">{t.effect}</p>
                    {/* Tone diagram */}
                    <div className="mt-1 px-3 py-2 bg-secondary/50 rounded-lg">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                        Tone Contour
                      </p>
                      <ToneDiagram type={t.diagram} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
