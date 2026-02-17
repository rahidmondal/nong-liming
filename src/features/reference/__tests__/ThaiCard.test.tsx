import { ThemeProvider } from '@/components/theme-provider';
import { ThaiCard } from '@/features/reference/components/ThaiCard';
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

const mockSpeak = vi.fn();
const mockCancel = vi.fn();
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
    getVoices: vi.fn().mockReturnValue([]),
    pause: vi.fn(),
    resume: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
});

const renderCard = (props: React.ComponentProps<typeof ThaiCard>) => {
  return render(
    <ThemeProvider>
      <BrowserRouter>
        <ThaiCard {...props} />
      </BrowserRouter>
    </ThemeProvider>,
  );
};

describe('ThaiCard', () => {
  it('renders the Thai character prominently', () => {
    renderCard({ thaiChar: 'ก', english: 'k' });
    expect(screen.getByText('ก')).toBeInTheDocument();
  });

  it('renders English transliteration', () => {
    renderCard({ thaiChar: 'ก', english: 'k' });
    expect(screen.getByText('k')).toBeInTheDocument();
  });

  it('renders Hindi equivalent when provided', () => {
    renderCard({ thaiChar: 'ก', english: 'k', hindiEquiv: 'क' });
    expect(screen.getByText('क')).toBeInTheDocument();
  });

  it('does not render Hindi section when not provided', () => {
    renderCard({ thaiChar: 'ก', english: 'k' });
    const topRow = screen.getByText('k').parentElement;
    expect(topRow?.children).toHaveLength(1);
  });

  it('renders start and final sounds when provided', () => {
    renderCard({ thaiChar: 'ก', english: 'k', startSound: 'k', finalSound: 'k' });
    expect(screen.getAllByText('k')).toHaveLength(3);
  });

  it('renders audio button', () => {
    renderCard({ thaiChar: 'ก', english: 'k' });
    expect(screen.getByRole('button', { name: /speak ก/i })).toBeInTheDocument();
  });

  it('applies accent color when provided', () => {
    const { container } = renderCard({
      thaiChar: 'ก',
      english: 'k',
      accentColor: '#3b82f6',
    });
    const card = container.firstChild as HTMLElement;
    expect(card.style.borderColor).toBe('rgb(59, 130, 246)');
  });
});
