// 支援的語言列表（第一階段：熱門 15 種語言）

export const languages = {
  'zh-TW': {
    code: 'zh-TW',
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  'ja': {
    code: 'ja',
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  'ko': {
    code: 'ko',
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
  },
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
  },
  'es': {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  'fr': {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  'de': {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  'it': {
    code: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
  'pt': {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português',
    flag: '🇵🇹',
  },
  'ru': {
    code: 'ru',
    name: 'Русский',
    nativeName: 'Русский',
    flag: '🇷🇺',
  },
  'ar': {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦',
  },
  'hi': {
    code: 'hi',
    name: 'हिन्दी',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
  },
  'th': {
    code: 'th',
    name: 'ไทย',
    nativeName: 'ไทย',
    flag: '🇹🇭',
  },
  'vi': {
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
  },
} as const;

export type Language = keyof typeof languages;
export const defaultLang: Language = 'zh-TW';

/** 官網已建置路由的語系（與 astro.config.mjs locales 一致） */
export const siteLocales = ['zh-TW', 'en', 'ja', 'de', 'ko', 'zh-CN'] as const;
export type SiteLocale = (typeof siteLocales)[number];

// 取得語言名稱（用於顯示）
export function getLanguageName(lang: Language): string {
  return languages[lang]?.name || lang;
}

// 取得原生語言名稱
export function getNativeLanguageName(lang: Language): string {
  return languages[lang]?.nativeName || lang;
}

// 取得官網已建置的語言代碼（hreflang / sitemap 用，不含未翻譯語系）
export function getAllLanguageCodes(): SiteLocale[] {
  return [...siteLocales];
}
