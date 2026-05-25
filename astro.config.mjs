// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// ForgeHelm 官網支援語系（計畫：zh-TW 預設 + en/ja/de）
const locales = [
  'zh-TW',
  'en',
  'ja',
  'de',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://smartsequence.tech',
  
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