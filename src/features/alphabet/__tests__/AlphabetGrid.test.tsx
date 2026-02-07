import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { consonants } from '../../../data/consonants';
import { AlphabetGrid } from '../AlphabetGrid';

describe('AlphabetGrid', () => {
  it('renders all consonant cards', () => {
    render(<AlphabetGrid />);
    consonants.forEach(c => {
      expect(screen.getByText(c.thaiChar)).toBeInTheDocument();
    });
  });

  it('renders the correct number of consonants', () => {
    render(<AlphabetGrid />);
    const thaiChars = consonants.map(c => c.thaiChar);
    thaiChars.forEach(char => {
      expect(screen.getByText(char)).toBeInTheDocument();
    });
    expect(thaiChars).toHaveLength(5);
  });
});
