import {
  cn,
  generateId,
  delay,
  debounce,
  throttle,
  formatNumber,
  safeJSONParse,
  deepClone,
  isTradingDay,
  isTradingHours,
  getToday,
} from '../utils';

describe('cn', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('px-4', true && 'py-2', false && 'hidden')).toBe('px-4 py-2');
  });

  it('merges conflicting classes (last wins)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('handles array inputs', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });

  it('handles object inputs', () => {
    expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4');
  });
});

describe('generateId', () => {
  it('returns a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('returns unique values', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('returns string in expected format', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.startsWith('test-uuid-')).toBe(true);
  });
});

describe('delay', () => {
  it('resolves after specified milliseconds', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  it('returns a promise', () => {
    const result = delay(10);
    expect(result).toBeInstanceOf(Promise);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancels previous call on new invocation', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);
    debouncedFn();
    jest.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to the function', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes immediately on first call', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores calls during throttle period', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows new call after throttle period', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    jest.advanceTimersByTime(100);
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to the function', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1', 'arg2');

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('formatNumber', () => {
  it('formats number with default 2 decimals', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
  });

  it('formats number with specified decimals', () => {
    expect(formatNumber(1234.567, 3)).toBe('1,234.567');
  });

  it('formats number with 0 decimals', () => {
    expect(formatNumber(1234.567, 0)).toBe('1,235');
  });

  it('adds thousand separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000.00');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234.5)).toBe('-1,234.50');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });
});

describe('safeJSONParse', () => {
  it('parses valid JSON', () => {
    const result = safeJSONParse('{"key": "value"}', {});
    expect(result).toEqual({ key: 'value' });
  });

  it('parses valid JSON array', () => {
    const result = safeJSONParse('[1, 2, 3]', []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns default value on invalid JSON', () => {
    const defaultValue = { fallback: true };
    const result = safeJSONParse('invalid json', defaultValue);
    expect(result).toBe(defaultValue);
  });

  it('returns default value on empty string', () => {
    const defaultValue: unknown[] = [];
    const result = safeJSONParse('', defaultValue);
    expect(result).toBe(defaultValue);
  });

  it('parses nested objects', () => {
    const json = '{"a": {"b": {"c": 1}}}';
    const result = safeJSONParse(json, {});
    expect(result).toEqual({ a: { b: { c: 1 } } });
  });
});

describe('deepClone', () => {
  it('clones simple object', () => {
    const original = { a: 1, b: 2 };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
  });

  it('clones nested object', () => {
    const original = { a: { b: { c: 1 } } };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone.a).not.toBe(original.a);
  });

  it('clones array', () => {
    const original = [1, 2, { a: 3 }];
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone[2]).not.toBe(original[2]);
  });

  it('clones complex structure', () => {
    const original = {
      array: [1, 2, 3],
      object: { nested: 'value' },
      string: 'test',
      number: 42,
      boolean: true,
      null: null,
    };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
  });
});

describe('isTradingDay', () => {
  it('returns true for Monday', () => {
    const monday = new Date('2024-01-01');
    expect(isTradingDay(monday)).toBe(true);
  });

  it('returns true for Friday', () => {
    const friday = new Date('2024-01-05');
    expect(isTradingDay(friday)).toBe(true);
  });

  it('returns false for Saturday', () => {
    const saturday = new Date('2024-01-06');
    expect(isTradingDay(saturday)).toBe(false);
  });

  it('returns false for Sunday', () => {
    const sunday = new Date('2024-01-07');
    expect(isTradingDay(sunday)).toBe(false);
  });

  it('uses current date when no argument provided', () => {
    const result = isTradingDay();
    const day = new Date().getDay();
    expect(result).toBe(day >= 1 && day <= 5);
  });
});

describe('isTradingHours', () => {
  it('returns true at 9:30', () => {
    const date = new Date('2024-01-01T09:30:00');
    expect(isTradingHours(date)).toBe(true);
  });

  it('returns true at 11:30', () => {
    const date = new Date('2024-01-01T11:30:00');
    expect(isTradingHours(date)).toBe(true);
  });

  it('returns false at 11:31', () => {
    const date = new Date('2024-01-01T11:31:00');
    expect(isTradingHours(date)).toBe(false);
  });

  it('returns true at 13:00', () => {
    const date = new Date('2024-01-01T13:00:00');
    expect(isTradingHours(date)).toBe(true);
  });

  it('returns true at 15:00', () => {
    const date = new Date('2024-01-01T15:00:00');
    expect(isTradingHours(date)).toBe(true);
  });

  it('returns false at 15:01', () => {
    const date = new Date('2024-01-01T15:01:00');
    expect(isTradingHours(date)).toBe(false);
  });

  it('returns false at 9:29', () => {
    const date = new Date('2024-01-01T09:29:00');
    expect(isTradingHours(date)).toBe(false);
  });

  it('uses current time when no argument provided', () => {
    const result = isTradingHours();
    expect(typeof result).toBe('boolean');
  });
});

describe('getToday', () => {
  it('returns date string in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns today date', () => {
    const today = getToday();
    const expected = new Date().toISOString().split('T')[0];
    expect(today).toBe(expected);
  });
});
