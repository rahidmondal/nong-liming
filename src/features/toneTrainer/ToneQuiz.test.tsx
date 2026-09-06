import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToneQuiz } from './ToneQuiz';
import { TONE_QUESTIONS } from './toneData';

const audio = vi.hoisted(() => ({ isAvailable: false, isSpeaking: false, speak: vi.fn() }));
vi.mock('@/hooks/useTTS', () => ({ useTTS: () => audio }));

describe('tone quiz audio and pending answers', () => {
  afterEach(() => vi.useRealTimers());
  it('offers written tone practice instead of a silent graded quiz', () => {
    audio.isAvailable = false;
    render(
      <MemoryRouter>
        <ToneQuiz question={TONE_QUESTIONS[0]} onNext={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Thai audio is unavailable');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/learn/tone-clues');
    expect(screen.queryByRole('button', { name: 'Play audio' })).not.toBeInTheDocument();
  });
  it('cancels pending answer advancement when leaving the quiz', () => {
    vi.useFakeTimers();
    audio.isAvailable = true;
    const onNext = vi.fn();
    const view = render(
      <MemoryRouter>
        <ToneQuiz question={TONE_QUESTIONS[0]} onNext={onNext} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /mid/i }));
    view.unmount();
    act(() => {
      vi.runAllTimers();
    });
    expect(onNext).not.toHaveBeenCalled();
  });
});
