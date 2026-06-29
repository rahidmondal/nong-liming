import { ThemeProvider } from '@/components/theme-provider';
import { LandingPage } from '@/features/landing/LandingPage';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/stats/lib/stats', () => ({
  getOverallStats: vi.fn().mockResolvedValue({
    totalDecks: 0,
    totalCards: 0,
    totalNotes: 0,
    totalReviews: 0,
    currentStreak: 0,
    longestStreak: 0,
    reviewsToday: 0,
    cardBreakdown: { new: 0, learning: 0, review: 0, relearning: 0 },
  }),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('LandingPage', () => {
  const renderWithProviders = async (component: React.ReactNode) => {
    render(
      <ThemeProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>,
    );
    // Wait for async state updates (getOverallStats) to flush
    await waitFor(() => undefined);
  };

  it('renders the greeting correctly', async () => {
    await renderWithProviders(<LandingPage />);
    expect(screen.getByText(/Sawasdee krub!/i)).toBeInTheDocument();
    expect(screen.getByText(/น้องลีมิง/i)).toBeInTheDocument();
  });

  it('renders the Start Daily Session CTA', async () => {
    await renderWithProviders(<LandingPage />);
    expect(screen.getByText(/Start Daily Session/i)).toBeInTheDocument();
  });
});
