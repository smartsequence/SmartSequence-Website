import type { GetStaticPaths } from 'astro';
import { defaultLang, type Language, type SiteLocale, languages, getAllLanguageCodes, siteLocales } from './languages';

export { siteLocales };

export function isZhTW(lang: Language): boolean {
  return lang === 'zh-TW';
}

// 重新匯出 getAllLanguageCodes 以便統一從 utils 匯入
export { getAllLanguageCodes };

// 從 URL 取得語言
export function getLangFromUrl(url: URL): Language {
  const pathname = url.pathname;
  // 檢查是否有語言前綴
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // 如果第一個段是語言代碼，返回它
  if (firstSegment && firstSegment in languages) {
    return firstSegment as Language;
  }
  
  // 否則返回預設語言
  return defaultLang;
}

// 取得本地化路徑
export function getLocalizedPath(path: string | undefined, lang: Language): string {
  // 防禦性檢查：如果 path 為 undefined 或 null，使用預設值
  if (!path) {
    return lang === defaultLang ? '/' : `/${lang}/`;
  }
  
  // 移除現有語言前綴（包括所有支援的語言）
  const allLangCodes = Object.keys(languages).join('|');
  const cleanPath = path.replace(new RegExp(`^/(${allLangCodes})(/|$)`), '/');
  
  // 如果是預設語言，不加前綴
  if (lang === defaultLang) {
    return cleanPath || '/';
  }
  
  // 其他語言加上前綴，確保結尾有斜線（與 Astro 靜態輸出一致）
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  if (normalizedPath === '/') return `/${lang}/`;
  const withSlash = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
  return `/${lang}${withSlash}`;
}

// 取得所有語言的靜態路徑（用於 getStaticPaths）
export function getStaticPathsForAllLanguages(): GetStaticPaths {
  return async () => {
    return Object.keys(languages).map((lang) => ({
      params: { lang: lang === defaultLang ? undefined : lang },
    }));
  };
}

export function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

// 動態載入翻譯檔案（含 legal/ 法律頁覆蓋）
export async function getTranslations(lang: Language) {
  const merged: Record<string, any> = {};

  try {
    deepMerge(merged, (await import(`./locales/${lang}.json`)).default);
  } catch {
    console.warn(`Translation file for ${lang} not found, falling back to ${defaultLang}`);
    try {
      deepMerge(merged, (await import(`./locales/${defaultLang}.json`)).default);
    } catch {
      return {};
    }
  }

  try {
    deepMerge(merged, (await import(`./legal/${lang}.json`)).default);
  } catch {
    /* terms overlay optional per locale */
  }

  try {
    deepMerge(merged, (await import(`./legal/privacy-${lang}.json`)).default);
  } catch {
    try {
      if (lang !== 'en') {
        deepMerge(merged, (await import(`./legal/privacy-en.json`)).default);
      }
    } catch {
      /* privacy overlay optional */
    }
  }

  return merged;
}

// 翻譯函式（用於頁面中）
export function useTranslations(lang: Language) {
  return async function t(key: string): Promise<string> {
    const translations = await getTranslations(lang);
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };
}

// 同步翻譯函式（需要預先載入翻譯）
export function createTranslator(translations: Record<string, any>) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };
}
