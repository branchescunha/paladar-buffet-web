import { describe, expect, it } from 'vitest';
import { centsFromCurrencyInput, currencyInputFromCents } from './currency';

describe('proposal currency helpers', () => {
  it('formats and parses BRL values without exposing cents', () => {
    expect(currencyInputFromCents(12990)).toBe('129,90');
    expect(centsFromCurrencyInput('129,90')).toBe(12990);
  });

  it('preserves a negative adjustment as a discount', () => {
    expect(centsFromCurrencyInput('-45,50', true)).toBe(-4550);
  });
});
