import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const legalDir = resolve(__dirname, '../src/i18n/legal');

function loadLegalJson(filename: string): Record<string, unknown> {
  const filepath = resolve(legalDir, filename);
  return JSON.parse(readFileSync(filepath, 'utf-8')) as Record<string, unknown>;
}

function collectKeyPaths(
  obj: Record<string, unknown>,
  prefix = '',
): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      paths.push(...collectKeyPaths(value as Record<string, unknown>, path));
    } else {
      paths.push(path);
    }
  }
  return paths.sort();
}

function assertKeyParity(
  suiteName: string,
  baselineFile: string,
  localeFiles: readonly string[],
) {
  const baselineKeys = new Set(collectKeyPaths(loadLegalJson(baselineFile)));

  describe.each(localeFiles)(`${suiteName} (%s)`, (filename) => {
    const localeKeys = new Set(collectKeyPaths(loadLegalJson(filename)));

    it('has all keys from zh-TW baseline', () => {
      const missing = [...baselineKeys].filter((k) => !localeKeys.has(k));
      expect(missing, `missing keys in ${filename}`).toEqual([]);
    });

    it('warns on extra keys not in baseline (non-fatal)', () => {
      const extra = [...localeKeys].filter((k) => !baselineKeys.has(k));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      if (extra.length > 0) {
        console.warn(`[${filename}] extra keys not in ${baselineFile}:`, extra);
        expect(warnSpy).toHaveBeenCalled();
      } else {
        expect(warnSpy).not.toHaveBeenCalled();
      }
      warnSpy.mockRestore();
    });
  });
}

assertKeyParity('legal terms overlay', 'zh-TW.json', [
  'en.json',
  'ja.json',
  'de.json',
]);

assertKeyParity('legal privacy overlay', 'privacy-zh-TW.json', [
  'privacy-en.json',
  'privacy-ja.json',
  'privacy-de.json',
]);
