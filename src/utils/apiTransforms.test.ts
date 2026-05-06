import { describe, it, expect } from 'vitest';
import { deserializeApiDates } from './apiTransforms';

describe('deserializeApiDates', () => {
  it('converts date strings to Date objects', () => {
    const input = { createdAt: '2024-01-15T10:00:00.000Z', title: 'test' };
    const result = deserializeApiDates(input);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect((result.createdAt as unknown as Date).toISOString()).toBe('2024-01-15T10:00:00.000Z');
    expect(result.title).toBe('test');
  });

  it('handles arrays', () => {
    const input = [
      { createdAt: '2024-01-15T10:00:00.000Z' },
      { createdAt: '2024-02-20T12:00:00.000Z' }
    ];
    const result = deserializeApiDates(input);
    const first = result[0] as Record<string, unknown>;
    const second = result[1] as Record<string, unknown>;
    expect(first.createdAt).toBeInstanceOf(Date);
    expect(second.createdAt).toBeInstanceOf(Date);
  });

  it('passes through null and undefined', () => {
    expect(deserializeApiDates(null)).toBeNull();
    expect(deserializeApiDates(undefined)).toBeUndefined();
  });

  it('passes through primitives', () => {
    expect(deserializeApiDates(42)).toBe(42);
    expect(deserializeApiDates('hello')).toBe('hello');
    expect(deserializeApiDates(true)).toBe(true);
  });

  it('does not convert non-date strings', () => {
    const input = { name: 'fochus', count: '42' };
    const result = deserializeApiDates(input);
    expect(result.name).toBe('fochus');
    expect(result.count).toBe('42');
  });

  it('handles nested objects', () => {
    const input = {
      user: {
        createdAt: '2024-01-15T10:00:00.000Z',
        nested: { updatedAt: '2024-03-01T08:00:00.000Z' }
      }
    };
    const result = deserializeApiDates(input);
    const user = result.user as Record<string, unknown>;
    expect(user.createdAt).toBeInstanceOf(Date);
    const nested = user.nested as Record<string, unknown>;
    expect(nested.updatedAt).toBeInstanceOf(Date);
  });

  it('returns empty object for empty input', () => {
    expect(deserializeApiDates({})).toEqual({});
  });
});
