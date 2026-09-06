import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TUTORIAL_STEPS } from './tutorialSteps';

const DONE_KEY = 'nong-liming-tutorial-done';
const DISMISSED_KEY = 'nong-liming-tutorial-dismissed';
const REPLAY_EVENT = 'nong-liming-replay-tutorial';
const ROUTE_READY_EVENT = 'nong-liming-tutorial-route-ready';

/** The router-level controller owns navigation and the active tour. */
export function replayTutorial() {
  localStorage.removeItem(DONE_KEY);
  localStorage.removeItem(DISMISSED_KEY);
  window.dispatchEvent(new Event(REPLAY_EVENT));
}

function waitForTarget(selector: string, routeReady: () => boolean, signal: AbortSignal): Promise<'ready' | 'timeout' | 'aborted'> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: 'ready' | 'timeout' | 'aborted') => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      document.removeEventListener(ROUTE_READY_EVENT, check);
      resolve(result);
    };
    const check = () => {
      const target = document.querySelector(selector);
      if (routeReady() && target?.isConnected && !target.closest('[hidden]')) finish('ready');
    };
    const abort = () => { finish('aborted'); };
    const observer = new MutationObserver(check);
    const timeout = setTimeout(() => { finish('timeout'); }, 5000);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    signal.addEventListener('abort', abort, { once: true });
    document.addEventListener(ROUTE_READY_EVENT, check);
    if (signal.aborted) abort();
    else check();
  });
}

export function useTutorial() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useRef(navigate);
  const pathname = useRef(location.pathname);
  const startRef = useRef<() => void>(() => undefined);

  useLayoutEffect(() => {
    navigation.current = navigate;
    pathname.current = location.pathname;
    document.dispatchEvent(new Event(ROUTE_READY_EVENT));
  }, [navigate, location.pathname]);

  useEffect(() => {
    let activeDriver: ReturnType<typeof driver> | null = null;
    let pending: AbortController | null = null;
    let currentIndex = -1;
    let transitioning = false;
    let disposed = false;

    const stop = (reason: 'dismiss' | 'finish' | 'cleanup' | 'restart') => {
      pending?.abort();
      pending = null;
      transitioning = false;
      const previous = activeDriver;
      activeDriver = null;
      // Clear ownership before destroying: cleanup and replay are not dismissals.
      if (reason === 'dismiss') localStorage.setItem(DISMISSED_KEY, 'true');
      if (reason === 'finish') {
        localStorage.setItem(DONE_KEY, 'true');
        localStorage.removeItem(DISMISSED_KEY);
      }
      previous?.destroy();
    };

    const show = async (index: number) => {
      const active = activeDriver;
      const step = TUTORIAL_STEPS.at(index);
      if (!active || !step || disposed) return;
      pending?.abort();
      const request = new AbortController();
      pending = request;
      transitioning = true;
      if (pathname.current !== step.route) void navigation.current(step.route, { replace: true });
      const result = await waitForTarget(step.element, () => pathname.current === step.route, request.signal);
      if (result === 'aborted' || activeDriver !== active) return;
      transitioning = false;
      if (result === 'timeout') {
        active.highlight({
          popover: {
            title: 'This stop is not ready yet',
            description: 'This part of the page has not appeared. Choose Try again to wait for it, or close the tour and replay it later from Settings.',
            showButtons: ['next', 'close'],
            nextBtnText: 'Try again',
            onNextClick: () => { void show(index); },
            onCloseClick: () => { stop('dismiss'); },
          },
        });
        return;
      }
      currentIndex = index;
      active.drive(index);
    };

    const start = () => {
      stop('restart');
      currentIndex = -1;
      const steps: DriveStep[] = TUTORIAL_STEPS.map((step) => ({
        element: step.element,
        popover: { title: step.title, description: step.description, side: 'bottom', align: 'center' },
      }));
      activeDriver = driver({
        steps,
        showProgress: true,
        animate: false,
        showButtons: ['next', 'previous', 'close'],
        doneBtnText: 'Finish tour',
        disableActiveInteraction: true,
        popoverClass: 'nong-liming-tutorial',
        onNextClick: () => {
          if (transitioning) return;
          if (currentIndex === TUTORIAL_STEPS.length - 1) stop('finish');
          else void show(currentIndex + 1);
        },
        onPrevClick: () => {
          if (!transitioning && currentIndex > 0) void show(currentIndex - 1);
        },
        onCloseClick: () => { stop('dismiss'); },
        onDestroyed: () => {
          // Escape and overlay dismissal also arrive here through driver.js.
          if (activeDriver) {
            pending?.abort();
            activeDriver = null;
            localStorage.setItem(DISMISSED_KEY, 'true');
          }
        },
      });
      void show(0);
    };

    startRef.current = start;
    window.addEventListener(REPLAY_EVENT, start);
    if (pathname.current === '/' && !localStorage.getItem(DONE_KEY) && !localStorage.getItem(DISMISSED_KEY)) start();
    return () => {
      disposed = true;
      window.removeEventListener(REPLAY_EVENT, start);
      startRef.current = () => undefined;
      stop('cleanup');
    };
  }, []);

  return { start: useCallback(() => { startRef.current(); }, []) };
}
