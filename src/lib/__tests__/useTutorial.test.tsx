import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Config, DriveStep, DriverHook } from 'driver.js';
import { replayTutorial, useTutorial } from '../useTutorial';
import { TUTORIAL_STEPS } from '../tutorialSteps';

const view = vi.hoisted(() => ({ config: {} as Config, active: -1, highlights: [] as DriveStep[], drives: [] as number[] }));
vi.mock('driver.js', () => ({
  driver: (config: Config) => {
    view.config = config;
    return {
      drive: (index = 0) => { view.active = index; view.drives.push(index); },
      highlight: (step: DriveStep) => { view.highlights.push(step); },
      destroy: () => { call(view.config.onDestroyed); },
    };
  },
}));

function call(hook: DriverHook | undefined) {
  if (hook) Reflect.apply(hook, undefined, [undefined, {}, {}]);
}
function Page({ hideReference = false }: { hideReference?: boolean }) {
  useTutorial();
  const location = useLocation();
  return <>
    <output data-testid="route">{location.pathname}</output>
    <button onClick={replayTutorial}>Replay</button>
    {TUTORIAL_STEPS.filter((step) => step.route === location.pathname && !(hideReference && step.route === '/reference')).map((step) => <div key={step.element} id={step.element.slice(1)}>{step.title}</div>)}
  </>;
}
function mount(route = '/', hideReference = false, strict = false) {
  const app = <MemoryRouter initialEntries={[route]}><Page hideReference={hideReference} /></MemoryRouter>;
  return render(strict ? <StrictMode>{app}</StrictMode> : app);
}
async function next() {
  const expected = view.active + 1;
  act(() => { call(view.config.onNextClick); });
  await waitFor(() => { expect(view.active).toBe(expected); });
}

beforeEach(() => {
  localStorage.clear();
  view.config = {};
  view.active = -1;
  view.drives = [];
  view.highlights = [];
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('cross-route tutorial lifecycle', () => {
  it('does not interrupt a first visit through a deep link', () => {
    mount('/settings');
    expect(screen.getByTestId('route')).toHaveTextContent('/settings');
    expect(view.drives).toEqual([]);
  });

  it('navigates to the next route and waits for its target before highlighting', async () => {
    const app = mount('/', true);
    await waitFor(() => { expect(view.drives).toEqual([0]); });
    await next();
    await next();
    act(() => { call(view.config.onNextClick); });
    await waitFor(() => { expect(screen.getByTestId('route')).toHaveTextContent('/reference'); });
    expect(view.drives).toEqual([0, 1, 2]);
    app.rerender(<MemoryRouter initialEntries={['/']}><Page /></MemoryRouter>);
    await waitFor(() => { expect(view.drives).toEqual([0, 1, 2, 3]); });
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBeNull();
  });

  it('marks an early close dismissed, never completed, and does not immediately reopen', async () => {
    const app = mount();
    await waitFor(() => { expect(view.active).toBe(0); });
    act(() => { call(view.config.onCloseClick); });
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBeNull();
    expect(localStorage.getItem('nong-liming-tutorial-dismissed')).toBe('true');
    app.unmount();
    mount();
    expect(view.drives).toEqual([0]);
  });

  it('survives StrictMode cleanup and completes only on the final Finish action', async () => {
    mount('/', false, true);
    await waitFor(() => { expect(view.active).toBe(0); });
    for (let index = 1; index < TUTORIAL_STEPS.length; index += 1) {
      act(() => { call(view.config.onNextClick); });
      await waitFor(() => { expect(view.active).toBe(index); });
    }
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBeNull();
    act(() => { call(view.config.onNextClick); });
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBe('true');
    expect(localStorage.getItem('nong-liming-tutorial-dismissed')).toBeNull();
  });

  it('replays from Settings by navigating home immediately without reloading', async () => {
    localStorage.setItem('nong-liming-tutorial-done', 'true');
    localStorage.setItem('nong-liming-tutorial-dismissed', 'true');
    mount('/settings');
    fireEvent.click(screen.getByText('Replay'));
    await waitFor(() => { expect(screen.getByTestId('route')).toHaveTextContent('/'); });
    await waitFor(() => { expect(view.active).toBe(0); });
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBeNull();
    expect(localStorage.getItem('nong-liming-tutorial-dismissed')).toBeNull();
  });

  it('shows an explicit retry when a target is unavailable instead of skipping', async () => {
    mount('/', true);
    await waitFor(() => { expect(view.active).toBe(0); });
    await next();
    await next();
    vi.useFakeTimers();
    act(() => { call(view.config.onNextClick); });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(view.highlights.at(-1)?.popover?.title).toBe('This stop is not ready yet');
    expect(view.highlights.at(-1)?.popover?.nextBtnText).toBe('Try again');
    expect(view.active).toBe(2);
    expect(localStorage.getItem('nong-liming-tutorial-done')).toBeNull();
  });
});
