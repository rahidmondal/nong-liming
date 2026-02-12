import { describe, expect, it } from 'vitest';
import { getStreaks } from '../stats';

describe('getStreaks', () => {
  it('returns 0/0 for empty input', () => {
    const result = getStreaks([]);
    expect(result).toEqual({ current: 0, longest: 0 });
  });

  it('returns 1-day streak for a single review today', () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = getStreaks([today]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it('returns 1-day streak for a single review yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const result = getStreaks([yesterday]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it('returns 0 current streak if last review was 2+ days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const result = getStreaks([twoDaysAgo]);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(1);
  });

  it('counts consecutive days as a streak', () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    }
    const result = getStreaks(dates);
    expect(result.current).toBe(5);
    expect(result.longest).toBe(5);
  });

  it('deduplicates dates (multiple reviews same day count as 1)', () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = getStreaks([today, today, today]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it('finds longest streak even if current is broken', () => {
    const today = new Date().toISOString().slice(0, 10);
    // 3-day old streak (days 10-7 ago), gap, then today
    const dates = [today];
    for (let i = 7; i <= 10; i++) {
      dates.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    }
    const result = getStreaks(dates);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(4);
  });
});
