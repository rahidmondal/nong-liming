import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToneTrainerPage } from './ToneTrainerPage';
import { recordPractice } from '@/lib/practice-activity';

vi.mock('@/lib/practice-activity', () => ({ recordPractice: vi.fn() }));
vi.mock('./ToneQuiz', () => ({
  ToneQuiz: ({ onNext }: { onNext: (correct: boolean) => void }) => (
    <button
      onClick={() => {
        onNext(true);
        onNext(true);
      }}
    >
      Answer correctly
    </button>
  ),
}));

describe('persistent tone answers', () => {
  beforeEach(() => vi.resetAllMocks());
  it('saves before advancing and ignores duplicate answer callbacks', async () => {
    let resolveSave: ((value: boolean) => void) | undefined;
    vi.mocked(recordPractice).mockImplementation(
      () =>
        new Promise(resolve => {
          resolveSave = resolve;
        }),
    );
    render(
      <MemoryRouter>
        <ToneTrainerPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Answer correctly' }));
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    expect(recordPractice).toHaveBeenCalledOnce();
    expect(recordPractice).toHaveBeenCalledWith(expect.objectContaining({ kind: 'tone', outcome: 'correct' }));
    resolveSave?.(true);
    await waitFor(() => { expect(screen.getByText('2 / 10')).toBeInTheDocument(); });
  });
  it('retries the same answer ID after a storage failure', async () => {
    vi.mocked(recordPractice).mockRejectedValueOnce(new Error('full')).mockResolvedValueOnce(true);
    render(
      <MemoryRouter>
        <ToneTrainerPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Answer correctly' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved');
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving answer' }));
    await waitFor(() => { expect(screen.getByText('2 / 10')).toBeInTheDocument(); });
    expect(vi.mocked(recordPractice).mock.calls[0][0].id).toBe(vi.mocked(recordPractice).mock.calls[1][0].id);
  });
});
