import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonViewer } from '../LessonViewer';

const { put, speak } = vi.hoisted(() => ({ put: vi.fn(), speak: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: { lessonProgress: { put }, userStats: { get: vi.fn() } } }));
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => undefined }));
vi.mock('@/hooks/useTTS', () => ({ useTTS: () => ({ speak }) }));

function open(strict = false) {
  const view = (
    <MemoryRouter initialEntries={['/lessons/lesson-3']}>
      <Routes>
        <Route path="/lessons/:id" element={<LessonViewer />} />
      </Routes>
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{view}</StrictMode> : view);
}
async function finishTyping() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(800);
  });
}
async function reachLastReply() {
  open();
  await finishTyping();
  fireEvent.click(screen.getByRole('button', { name: /To Central World/ }));
  await finishTyping();
  fireEvent.click(screen.getByRole('button', { name: /Yes, take the tollway/ }));
  await finishTyping();
}

describe('dialogue session lifecycle and persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    put.mockResolvedValue('lesson-3');
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('only appends one opening message under StrictMode', async () => {
    open(true);
    await finishTyping();
    expect(screen.getAllByText('Where are you going?')).toHaveLength(1);
  });

  it('drops an old reply when restarting during the typing delay', async () => {
    open();
    await finishTyping();
    fireEvent.click(screen.getByRole('button', { name: /To Central World/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Restart lesson' }));
    await finishTyping();
    expect(screen.queryByText('The traffic is very bad. Take the tollway?')).not.toBeInTheDocument();
    expect(screen.getAllByText('Where are you going?')).toHaveLength(1);
  });

  it('does not speak a queued message after leaving the dialogue', async () => {
    const view = open();
    view.unmount();
    await finishTyping();
    expect(speak).not.toHaveBeenCalled();
  });

  it('accepts only one reply while its next message is pending', async () => {
    open();
    await finishTyping();
    const reply = screen.getByRole('button', { name: /To Central World/ });
    act(() => {
      reply.click();
      reply.click();
    });
    await finishTyping();
    expect(screen.getAllByText('To Central World, please.')).toHaveLength(1);
    expect(screen.getAllByText('The traffic is very bad. Take the tollway?')).toHaveLength(1);
  });

  it('waits for persistence and records the actual completed exchanges', async () => {
    let resolveSave!: (id: string) => void;
    put.mockImplementation(
      () =>
        new Promise<string>(resolve => {
          resolveSave = resolve;
        }),
    );
    await reachLastReply();
    fireEvent.click(screen.getByRole('button', { name: /Keep the change/ }));
    expect(screen.queryByText('Lesson Complete!')).not.toBeInTheDocument();
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: 'lesson-3',
        completed: true,
        exchangesCompleted: 3,
        selectedOptions: [
          { exchangeIndex: 0, selectedOptionId: 'c1', quality: 'good' },
          { exchangeIndex: 1, selectedOptionId: 'c4', quality: 'good' },
          { exchangeIndex: 2, selectedOptionId: 'c7', quality: 'good' },
        ],
      }),
    );
    await act(async () => {
      resolveSave('lesson-3');
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText('Lesson Complete!')).toBeInTheDocument();
  });

  it('retries a failed completion save without recording another reply', async () => {
    put.mockRejectedValueOnce(new Error('storage full')).mockResolvedValueOnce('lesson-3');
    await reachLastReply();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Keep the change/ }));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText('Lesson Complete!')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText('Lesson Complete!')).toBeInTheDocument();
    expect(screen.getAllByText('Here you go. Keep the change.')).toHaveLength(1);
    expect(put).toHaveBeenCalledTimes(2);
    expect(put.mock.calls[1][0]).toEqual(put.mock.calls[0][0]);
  });
});
