// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// ForgeHelm 官網支援語系（zh-TW 預設 + en/ja/de/ko/zh-CN，與產品六語系一致）
// ⚠ 須與 src/i18n/languages.ts 的 siteLocales 完全一致。
const locales = [
  'zh-TW',
  'en',
  'ja',
  'de',
  'ko',
  'zh-CN',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://www.smartsequence.tech',
  
  // 多語言配置
  i18n: {
    defaultLocale: 'zh-TW',
    locales: locales,
    routing: {
      prefixDefaultLocale: false, // zh-TW 不加前綴（/ 而非 /zh-TW）
      redirectToDefaultLocale: false, // 不自動重定向，允許訪問 /en/ 等路徑
    },
  },
  
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'zh-TW',
        locales: Object.fromEntries(locales.map((l) => [l, l])),
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});