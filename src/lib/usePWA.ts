import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: false,
  });

  const update = useCallback(() => {
    void updateServiceWorker(true);
  }, [updateServiceWorker]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  const checkForUpdates = useCallback(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then(reg => {
        void reg?.update();
      });
    }
  }, []);

  return { needRefresh, update, dismiss, checkForUpdates };
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return undefined;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setCanInstall(false);
    }

    deferredPromptRef.current = null;
  }, []);

  return { canInstall, isInstalled, install };
}
