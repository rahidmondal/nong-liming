import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PracticeSaveButton } from './PracticeSaveButton';
import { recordPractice } from '@/lib/practice-activity';

vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => ({ record: undefined }) }));
vi.mock('@/lib/practice-activity', () => ({ recordPractice: vi.fn() }));

describe('explicit practice entries', () => {
  beforeEach(() => vi.resetAllMocks());
  it('does not award activity for viewing a passage, and saves only once after confirmation', async () => {
    vi.mocked(recordPractice).mockResolvedValue(true);
    render(<PracticeSaveButton kind="reading" contentKey="nick" label="Nick’s story" />);
    expect(recordPractice).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'I practised this' }));
    expect(await screen.findByRole('button', { name: 'Saved to your progress today' })).toBeDisabled();
    expect(recordPractice).toHaveBeenCalledOnce();
    expect(recordPractice).toHaveBeenCalledWith(expect.objectContaining({ kind: 'reading', label: 'Nick’s story' }));
  });
  it('retains a retry after failure and permits a different sentence', async () => {
    vi.mocked(recordPractice).mockRejectedValueOnce(new Error('full')).mockResolvedValue(true);
    const view = render(<PracticeSaveButton kind="sentence" contentKey="ฉัน กิน" label="ฉัน กิน" />);
    fireEvent.click(screen.getByRole('button', { name: 'I practised this' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved');
    fireEvent.click(screen.getByRole('button', { name: 'I practised this' }));
    await screen.findByRole('button', { name: 'Saved to your progress today' });
    view.rerender(<PracticeSaveButton kind="sentence" contentKey="ฉัน ไป" label="ฉัน ไป" />);
    fireEvent.click(screen.getByRole('button', { name: 'I practised this' }));
    await waitFor(() => { expect(recordPractice).toHaveBeenCalledTimes(3); });
    expect(vi.mocked(recordPractice).mock.calls[0][0].id).toBe(vi.mocked(recordPractice).mock.calls[1][0].id);
    expect(vi.mocked(recordPractice).mock.calls[2][0].id).not.toBe(vi.mocked(recordPractice).mock.calls[0][0].id);
  });
});
