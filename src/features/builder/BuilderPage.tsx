import { ModeToggle } from '@/components/mode-toggle';
import { AnimatePresence, motion } from 'framer-motion';
import { ThaiScriptIcon as Blocks, ThaiScriptIcon as PenLine } from '@/components/ThaiIcons';
import { ArrowLeft } from 'lucide-react';
import { lazy, useState } from 'react';
import { PageBoundary } from '@/components/PageBoundary';
import { Link } from 'react-router-dom';
import { WordBuilder } from './word-builder/WordBuilder';
const WritingPad = lazy(() => import('./writing-pad/WritingPad').then(module => ({ default: module.WritingPad })));

type Tab = 'word-builder' | 'writing-pad';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'word-builder',
    label: 'Word Builder',
    icon: <Blocks className="w-4 h-4" />,
  },
  {
    key: 'writing-pad',
    label: 'Writing Pad',
    icon: <PenLine className="w-4 h-4" />,
  },
];

export function BuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('word-builder');

  return (
    <div className="min-h-full flex flex-col p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Builder</h1>
        <ModeToggle />
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
          {activeTab === 'word-builder' && <WordBuilder />}
          {activeTab === 'writing-pad' && (
            <PageBoundary>
              <WritingPad />
            </PageBoundary>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
