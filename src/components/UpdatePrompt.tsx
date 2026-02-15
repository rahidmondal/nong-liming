import { usePWAUpdate } from '@/lib/usePWA';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export function UpdatePrompt() {
  const { needRefresh, update, dismiss } = usePWAUpdate();

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="shrink-0 p-2 bg-primary/10 rounded-lg">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Update available</p>
              <p className="text-xs text-muted-foreground">Refresh to get the latest version.</p>
            </div>
            <button
              onClick={update}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={dismiss}
              className="shrink-0 p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Dismiss update"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
