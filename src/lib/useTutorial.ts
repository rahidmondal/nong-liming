import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'nong-liming-tutorial-done';

const TUTORIAL_STEPS: DriveStep[] = [
  {
    element: '#nav-unalome',
    popover: {
      title: '🗺️ The Unalome Path',
      description: 'Follow your guided curriculum path to Thai fluency! Unlock lessons and earn traditional Wai Kru offerings.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#nav-flashcards',
    popover: {
      title: '🃏 Flashcards',
      description: 'Practice Thai with spaced-repetition flashcards. Import Anki decks or create your own!',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#nav-tab-practice',
    popover: {
      title: '🛠️ Practice Hub',
      description: 'Access the dictionary, smart reading, tone trainer, and other tools here.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#nav-tab-profile',
    popover: {
      title: '👤 Profile & Settings',
      description: 'Check your stats, manage decks, and adjust settings here.',
      side: 'top',
      align: 'end',
    },
  },
];

export function useTutorial() {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const start = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const d = driver({
      showProgress: true,
      animate: true,
      showButtons: ['next', 'previous', 'close'],
      steps: TUTORIAL_STEPS,
      onDestroyed: () => {
        localStorage.setItem(STORAGE_KEY, 'true');
      },
      popoverClass: 'nong-liming-tutorial',
    });

    driverRef.current = d;
    d.drive();
  }, []);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => {
        start();
      }, 800);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [start]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { start };
}
