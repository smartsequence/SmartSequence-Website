import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../src/i18n/locales');

function loadJson(filename: string): Record<string, unknown> {
  const filepath = resolve(localesDir, filename);
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

const baseline = loadJson('zh-TW.json');
const baselineKeys = new Set(collectKeyPaths(baseline));

// 掃目錄而非手維護清單——這裡曾寫死 en/ja/de，新增語系時漏改的話，
// 缺鍵的新 locale 會靜默通過這道閘門（它只檢查清單上的檔案）。
const locales = readdirSync(localesDir)
  .filter((f) => f.endsWith('.json') && f !== 'zh-TW.json')
  .sort();

describe.each(locales)('locale key parity vs zh-TW (%s)', (filename) => {
  const localeKeys = new Set(collectKeyPaths(loadJson(filename)));

  it('has all keys from zh-TW baseline', () => {
    const missing = [...baselineKeys].filter((k) => !localeKeys.has(k));
    expect(missing, `missing keys in ${filename}`).toEqual([]);
  });

  it('warns on extra keys not in baseline (non-fatal)', () => {
    const extra = [...localeKeys].filter((k) => !baselineKeys.has(k));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    if (extra.length > 0) {
      console.warn(`[${filename}] extra keys not in zh-TW:`, extra);
      expect(warnSpy).toHaveBeenCalled();
    } else {
      expect(warnSpy).not.toHaveBeenCalled();
    }
    warnSpy.mockRestore();
  });
});
