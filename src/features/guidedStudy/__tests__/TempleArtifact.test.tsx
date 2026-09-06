import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TempleArtifact } from '../TempleArtifact';
import { mountTempleScene } from '../templeScene';

vi.mock('../templeScene', () => ({ mountTempleScene: vi.fn() }));

describe('temple artwork lifecycle', () => {
  const controller = { dispose: vi.fn(), rotate: vi.fn(), reset: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mountTempleScene).mockReturnValue(controller);
  });

  it('supports button rotation and releases the renderer when leaving the page', async () => {
    const view = render(<TempleArtifact />);
    expect(mountTempleScene).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Explore in 3D' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Rotate temple right' }));
    expect(controller.rotate).toHaveBeenCalledWith(0.3);
    fireEvent.click(screen.getByRole('button', { name: 'Reset temple view' }));
    expect(controller.reset).toHaveBeenCalledOnce();
    view.unmount();
    expect(controller.dispose).toHaveBeenCalledOnce();
  });

  it('keeps an illustration when GPU initialization fails', async () => {
    vi.mocked(mountTempleScene).mockImplementation(() => {
      throw new Error('WebGL unavailable');
    });
    render(<TempleArtifact />);
    fireEvent.click(screen.getByRole('button', { name: 'Explore in 3D' }));
    expect(await screen.findByText('Temple illustration')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Rotate temple right' })).not.toBeInTheDocument();
  });

  it('releases a lost graphics context and replaces the controls with the fallback', async () => {
    render(<TempleArtifact />);
    fireEvent.click(screen.getByRole('button', { name: 'Explore in 3D' }));
    await waitFor(() => {
      expect(mountTempleScene).toHaveBeenCalledOnce();
    });
    act(() => {
      vi.mocked(mountTempleScene).mock.calls[0][1]();
    });
    expect(await screen.findByText('Temple illustration')).toBeInTheDocument();
    expect(controller.dispose).toHaveBeenCalledOnce();
  });

  it('does not mount a late-loaded scene after navigation', async () => {
    const view = render(<TempleArtifact />);
    fireEvent.click(screen.getByRole('button', { name: 'Explore in 3D' }));
    view.unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mountTempleScene).not.toHaveBeenCalled();
  });
});
