import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'nong-liming-tutorial-done';

const TUTORIAL_STEPS: DriveStep[] = [
  {
    element: '#settings-link',
    popover: {
      title: '⚙️ Settings',
      description: 'Theme, data management, updates — all in one place.',
      side: 'bottom',
      align: 'end',
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
    element: '#nav-fullview',
    popover: {
      title: '📖 Full View',
      description: 'Browse the Thai alphabet, numbers, and tone marks with Indic phonetic mappings.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#nav-builder',
    popover: {
      title: '✏️ Builder',
      description: 'Build words and practice writing Thai characters with the drawing pad.',
      side: 'bottom',
      align: 'center',
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
