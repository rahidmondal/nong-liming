import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ThaiConsonant } from '../../../types/alphabet';
import { ConsonantCard } from '../ConsonantCard';

const midConsonant: ThaiConsonant = {
  id: 'test-mid',
  thaiChar: 'ก',
  thaiName: 'ก ไก่',
  hindiEquiv: 'क',
  class: 'mid',
  startSound: 'k',
  finalSound: 'k',
};

const highConsonant: ThaiConsonant = {
  id: 'test-high',
  thaiChar: 'ข',
  thaiName: 'ข ไข่',
  hindiEquiv: 'ख',
  class: 'high',
  startSound: 'kh',
  finalSound: 'k',
};

const lowConsonant: ThaiConsonant = {
  id: 'test-low',
  thaiChar: 'ค',
  thaiName: 'ค ควาย',
  hindiEquiv: 'ख',
  class: 'low',
  startSound: 'kh',
  finalSound: 'k',
};

describe('ConsonantCard', () => {
  it('renders the Thai character', () => {
    render(<ConsonantCard consonant={midConsonant} />);
    expect(screen.getByText('ก')).toBeInTheDocument();
  });

  it('renders the Hindi equivalent', () => {
    render(<ConsonantCard consonant={midConsonant} />);
    expect(screen.getByText('क')).toBeInTheDocument();
  });

  it('applies emerald border for mid class', () => {
    const { container } = render(<ConsonantCard consonant={midConsonant} />);
    expect(container.firstChild).toHaveClass('border-emerald-500/50');
  });

  it('applies amber border for high class', () => {
    const { container } = render(<ConsonantCard consonant={highConsonant} />);
    expect(container.firstChild).toHaveClass('border-amber-500/50');
  });

  it('applies sky border for low class', () => {
    const { container } = render(<ConsonantCard consonant={lowConsonant} />);
    expect(container.firstChild).toHaveClass('border-sky-500/50');
  });
});
