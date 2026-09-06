import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GuidedStudyPage } from '../GuidedStudyPage';
import { createRun, answerExercise } from '../missionEngine';
import { MISSIONS } from '../missionData';
import { saveMissionAction } from '../missionRepository';
import type { MissionProgress } from '../missionTypes';

vi.mock('../missionRepository', () => ({ saveMissionAction: vi.fn() }));
vi.mock('@/hooks/useTTS', () => ({ useTTS: () => ({ speak: vi.fn(), isAvailable: false, isSpeaking: false }) }));

function open(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/learn/${id}`]}>
      <Routes>
        <Route path="/learn/:missionId" element={<GuidedStudyPage />} />
      </Routes>
    </MemoryRouter>,
  );
}
function progress(missionId: string): MissionProgress {
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) throw new Error('Test mission missing');
  return {
    id: `practice-${missionId}`,
    missionId,
    run: { ...createRun(mission), started: true },
    updatedAt: 0,
    completedRuns: 0,
    bestIndependent: 0,
  };
}

describe('lesson resume and save failures', () => {
  beforeEach(() => vi.resetAllMocks());

  it('restores the selected phrase and feedback after reopening', async () => {
    const saved = progress('coffee');
    saved.run = answerExercise(MISSIONS[1], { ...saved.run, index: 2 }, ['request', 'sweet', 'polite']);
    vi.mocked(saveMissionAction).mockResolvedValue(saved);
    open('coffee');
    expect(await screen.findByText('You’ve got it.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove ขอ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove หวานน้อย' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove ครับ' })).toBeDisabled();
  });

  it('does not reveal lesson notes when recording help fails', async () => {
    vi.mocked(saveMissionAction)
      .mockResolvedValueOnce(progress('first-words'))
      .mockRejectedValueOnce(new Error('storage full'));
    open('first-words');
    fireEvent.click(await screen.findByRole('button', { name: 'Review lesson' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your progress could not be saved');
    expect(screen.queryByRole('link', { name: 'Explore the full reference' })).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
