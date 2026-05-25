import { describe, expect, it } from 'vitest';
import {
  deepMerge,
  getLangFromUrl,
  getLocalizedPath,
} from '../src/i18n/utils';
import type { Language } from '../src/i18n/languages';

describe('getLangFromUrl', () => {
  const cases: [string, Language][] = [
    ['https://smartsequence.tech/', 'zh-TW'],
    ['https://smartsequence.tech/pricing', 'zh-TW'],
    ['https://smartsequence.tech/en/', 'en'],
    ['https://smartsequence.tech/en/pricing', 'en'],
    ['https://smartsequence.tech/ja/features', 'ja'],
    ['https://smartsequence.tech/de/about', 'de'],
    ['https://smartsequence.tech/xyz/unknown', 'zh-TW'],
    ['https://smartsequence.tech/ko/pricing', 'ko'],
  ];

  it.each(cases)('%s → %s', (url, expected) => {
    expect(getLangFromUrl(new URL(url))).toBe(expected);
  });
});

describe('getLocalizedPath', () => {
  const cases: [string | undefined, Language, string][] = [
    ['/pricing', 'zh-TW', '/pricing'],
    ['/pricing', 'en', '/en/pricing/'],
    ['/pricing', 'ja', '/ja/pricing/'],
    ['/', 'zh-TW', '/'],
    ['/', 'en', '/en/'],
    [undefined, 'zh-TW', '/'],
    [undefined, 'de', '/de/'],
    ['/en/pricing', 'ja', '/ja/pricing/'],
    ['/en/pricing', 'zh-TW', '/pricing'],
  ];

  it.each(cases)('getLocalizedPath(%s, %s) => %s', (path, lang, expected) => {
    expect(getLocalizedPath(path, lang)).toBe(expected);
  });
});

describe('deepMerge', () => {
  it('merges flat objects', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('merges nested objects', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({
      a: { x: 1, y: 2 },
    });
  });

  it('source overwrites nested values', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { x: 99 } })).toEqual({
      a: { x: 99 },
    });
  });

  it('arrays are replaced, not merged', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] });
  });

  it('merges deeply nested objects', () => {
    expect(deepMerge({}, { a: { b: { c: 3 } } })).toEqual({
      a: { b: { c: 3 } },
    });
  });
});
