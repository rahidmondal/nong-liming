import { ThemeProvider } from '@/components/theme-provider';
import { LandingPage } from '@/features/landing/LandingPage';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

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
  const renderwithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>,
    );
  };

  it('renders the greeting correctly', () => {
    renderwithProviders(<LandingPage />);
    expect(screen.getByText(/Hi, I am/i)).toBeInTheDocument();
    expect(screen.getByText(/Nong Li Ming/i)).toBeInTheDocument();
  });

  it('renders the Flashcards option', () => {
    renderwithProviders(<LandingPage />);
    expect(screen.getByText('Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Review your Flashcards')).toBeInTheDocument();
  });

  it('renders disabled options with Coming Soon badge', () => {
    renderwithProviders(<LandingPage />);

    expect(screen.getByText('Full View')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();

    const comingSoonBadges = screen.getAllByText('Soon');
    expect(comingSoonBadges).toHaveLength(2);
  });
});
