import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/components/toast-provider';
import { exportAndDownload, importBackup } from '@/lib/backup-utils';
import { APP_VERSION } from '@/lib/constants';
import { db } from '@/lib/db';
import { usePWAInstall, usePWAUpdate } from '@/lib/usePWA';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  HelpCircle,
  Info,
  Monitor,
  Moon,
  RefreshCw,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Theme = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const { checkForUpdates } = usePWAUpdate();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ usage: number; quota: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      void navigator.storage.estimate().then(est => {
        setStorageUsage({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
      });
    }
  }, []);

  const handleExportData = useCallback(async () => {
    const id = toast.show('Exporting full backup…', { type: 'loading', persistent: true });
    try {
      await exportAndDownload();
      toast.update(id, { type: 'success', message: 'Backup exported!', persistent: false });
    } catch {
      toast.update(id, { type: 'error', message: 'Export failed', persistent: false });
    }
  }, [toast]);

  const handleImportData = useCallback(
    async (file: File) => {
      const id = toast.show('Restoring backup…', { type: 'loading', persistent: true });
      try {
        const result = await importBackup(file);
        toast.update(id, {
          type: 'success',
          message: 'Backup restored! Reloading…',
          detail: `${String(result.deckCount)} decks, ${String(result.cardCount)} cards, ${String(result.mediaCount)} media files`,
          persistent: false,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (e) {
        toast.update(id, {
          type: 'error',
          message: 'Import failed',
          detail: e instanceof Error ? e.message : 'Invalid .nong file',
          persistent: false,
        });
      }
    },
    [toast],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleImportData(file);
      }
      e.target.value = '';
    },
    [handleImportData],
  );

  const handleClearHistory = useCallback(async () => {
    const id = toast.show('Clearing study history…', { type: 'loading', persistent: true });
    try {
      await db.transaction('rw', db.studySessions, db.reviewLogs, async () => {
        await db.studySessions.clear();
        await db.reviewLogs.clear();
      });
      setShowClearHistoryConfirm(false);
      toast.update(id, { type: 'success', message: 'Study history cleared', persistent: false });
    } catch {
      toast.update(id, { type: 'error', message: 'Failed to clear history', persistent: false });
    }
  }, [toast]);

  const handleResetData = useCallback(async () => {
    setIsResetting(true);
    const id = toast.show('Resetting all data…', { type: 'loading', persistent: true });
    try {
      await db.delete();
      toast.update(id, { type: 'success', message: 'All data cleared. Reloading…', persistent: false });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      toast.update(id, { type: 'error', message: 'Reset failed', persistent: false });
      setIsResetting(false);
    }
  }, [toast]);

  const handleCheckUpdate = useCallback(() => {
    checkForUpdates();
    toast.show('Checking for updates…', { type: 'loading' });
  }, [checkForUpdates, toast]);

  const handleInstall = useCallback(() => {
    void install();
  }, [install]);

  const handleStartTutorial = useCallback(() => {
    localStorage.removeItem('nong-liming-tutorial-done');
    toast.show('Tutorial will start on the home page', { type: 'success' });
  }, [toast]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full flex flex-col p-6 max-w-lg mx-auto">
      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".nong" onChange={handleFileChange} className="hidden" />

      {/* Header */}
      <header className="flex items-center gap-3 py-4 mb-6">
        <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </header>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* ── Appearance ── */}
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Appearance</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4">
              <p className="text-sm font-medium text-foreground mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTheme(opt.value);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      theme === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── App ── */}
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">App</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {/* Install */}
            {!isInstalled && canInstall && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Install App</p>
                  <p className="text-xs text-muted-foreground">Add to your home screen</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            {isInstalled && (
              <div className="flex items-center gap-3 p-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">App Installed</p>
                  <p className="text-xs text-muted-foreground">Running as standalone</p>
                </div>
              </div>
            )}

            {/* Check Updates */}
            <button
              onClick={handleCheckUpdate}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Check for Updates</p>
                <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Tutorial */}
            <button
              onClick={handleStartTutorial}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Replay Tutorial</p>
                <p className="text-xs text-muted-foreground">See the guided tour again</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.section>

        {/* ── Data Management ── */}
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Data</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {/* Export */}
            <button
              onClick={() => void handleExportData()}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Export Full Backup</p>
                <p className="text-xs text-muted-foreground">Download a .nong backup (data + media)</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Import Backup</p>
                <p className="text-xs text-muted-foreground">Restore from a .nong backup file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Clear Study History */}
            {!showClearHistoryConfirm ? (
              <button
                onClick={() => {
                  setShowClearHistoryConfirm(true);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Clear Study History</p>
                  <p className="text-xs text-muted-foreground">Reset progress, keep decks & cards</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <div className="p-4 bg-amber-500/5">
                <p className="text-sm font-medium text-foreground mb-3">Clear all sessions and review logs?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleClearHistory()}
                    className="flex-1 px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Yes, clear history
                  </button>
                  <button
                    onClick={() => {
                      setShowClearHistoryConfirm(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reset */}
            {!showResetConfirm ? (
              <button
                onClick={() => {
                  setShowResetConfirm(true);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-left"
              >
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Reset All Data</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all progress</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ) : (
              <div className="p-4 bg-destructive/5">
                <p className="text-sm font-medium text-foreground mb-3">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleResetData()}
                    disabled={isResetting}
                    className="flex-1 px-4 py-2 text-sm font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {isResetting ? 'Resetting…' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Storage Usage */}
            {storageUsage && (
              <div className="flex items-center gap-3 p-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Database className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Storage</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(storageUsage.usage)} of {formatBytes(storageUsage.quota)} used
                  </p>
                </div>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${String(Math.min((storageUsage.usage / storageUsage.quota) * 100, 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── About ── */}
        <motion.section variants={item}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">About</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="flex items-center gap-3 p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">NongLiMing</p>
                <p className="text-xs text-muted-foreground">Version {APP_VERSION}</p>
              </div>
            </div>
            <a
              href="https://github.com/rahidmondal/nong-liming"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 bg-muted rounded-lg">
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Source Code</p>
                <p className="text-xs text-muted-foreground">View on GitHub</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
