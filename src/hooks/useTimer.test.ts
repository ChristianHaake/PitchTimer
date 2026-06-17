import { describe, expect, it } from 'vitest';
import { isSupportedTimeMode, secondsUntil } from './useTimer';

describe('secondsUntil', () => {
  it('rounds up partial seconds for countdown display', () => {
    expect(secondsUntil(2_001, 1_001)).toBe(1);
    expect(secondsUntil(2_001, 1_002)).toBe(1);
  });

  it('never returns a negative value after the deadline', () => {
    expect(secondsUntil(1_000, 1_001)).toBe(0);
  });
});

describe('isSupportedTimeMode', () => {
  it('accepts only the configured timer presets', () => {
    expect(isSupportedTimeMode(30)).toBe(true);
    expect(isSupportedTimeMode(60)).toBe(true);
    expect(isSupportedTimeMode(45)).toBe(false);
    expect(isSupportedTimeMode(-60)).toBe(false);
  });
});
