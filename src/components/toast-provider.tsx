import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type ToastType = 'loading' | 'success' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  detail?: string;
  persistent?: boolean;
}

interface ToastContextType {
  show: (message: string, options?: { type?: ToastType; detail?: string; persistent?: boolean; id?: string }) => string;
  update: (id: string, updates: Partial<Pick<Toast, 'type' | 'message' | 'detail' | 'persistent'>>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const show = useCallback(
    (message: string, options?: { type?: ToastType; detail?: string; persistent?: boolean; id?: string }) => {
      const id = options?.id ?? `toast-${String(++counterRef.current)}`;
      const toast: Toast = {
        id,
        type: options?.type ?? 'success',
        message,
        detail: options?.detail,
        persistent: options?.persistent,
      };

      setToasts(prev => {
        const existing = prev.findIndex(t => t.id === id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = toast;
          return updated;
        }
        return [...prev, toast];
      });

      if (!options?.persistent) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
      }

      return id;
    },
    [],
  );

  const update = useCallback(
    (id: string, updates: Partial<Pick<Toast, 'type' | 'message' | 'detail' | 'persistent'>>) => {
      setToasts(prev =>
        prev.map(t => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates };

          if (!updated.persistent && t.persistent) {
            setTimeout(() => {
              setToasts(p => p.filter(tt => tt.id !== id));
            }, 4000);
          }

          return updated;
        }),
      );
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto bg-card border border-border rounded-xl shadow-2xl px-4 py-3 flex items-start gap-3"
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-accent" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{toast.message}</p>
                {toast.detail && <p className="text-xs text-muted-foreground mt-0.5">{toast.detail}</p>}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => {
                  dismiss(toast.id);
                }}
                className="shrink-0 p-1 rounded-lg hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
