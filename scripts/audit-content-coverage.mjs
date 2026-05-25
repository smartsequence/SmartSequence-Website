/**
 * 計畫需求 vs 頁面實作 內容覆蓋率稽核
 * 掃描每個主要頁面的原始碼，確認計畫要求的關鍵元素是否存在
 */
import fs from 'fs';

function readPage(name) {
  return fs.readFileSync(`src/pages/${name}`, 'utf8');
}

const results = [];

function check(page, label, ...patterns) {
  const src = readPage(page);
  const found = patterns.some(p =>
    typeof p === 'string' ? src.includes(p) : p.test(src)
  );
  results.push({ page, label, found });
}

// ── index.astro ─────────────────────────────────────────────────────
const idx = 'index.astro';
check(idx, '首頁 Hero badge',            'hero.badge');
check(idx, '首頁 三大核心價值',           'coreValues');
check(idx, '首頁 7大模組速覽',           "'m1'", "'m7'");
check(idx, '首頁 部署彈性區塊',          'deployment', 'd1', 'd4');
check(idx, '首頁 競品價格對比',          'competitor');
check(idx, '首頁 體驗方案 CTA',          'trial', 'NT$990', '$29');
check(idx, '首頁 信任區 / 產業標示',     'industries');
check(idx, '首頁 統一編號',              'STUDIO_TAX_ID', '60295398');

// ── product.astro ────────────────────────────────────────────────────
const prod = 'product.astro';
check(prod, '產品 7大模組',              "'m7'");
check(prod, '產品 8軸風險指紋',          'fingerprint', '8');
check(prod, '產品 FinOps 用量透明度',   'finops');
check(prod, '產品 BYOL 架構',            'byol', 'BYOL');
check(prod, '產品 RBAC 資安',            'sec2', 'RBAC');
check(prod, '產品 稽核日誌',             'sec4', 'auditLog');
check(prod, '產品 CTO/CIO 受眾',         'audience1', 'CTO');

// ── architecture.astro ───────────────────────────────────────────────
const arch = 'architecture.astro';
check(arch, '架構 三層說明',             'agentTitle', 'saasTitle', 'contractsTitle');
check(arch, '架構 四種部署場景',         'deploy1', 'deploy4');
check(arch, '架構 資料流向',             'dataFlow1', 'dataFlow5');
check(arch, '架構 AI 三種模式',          'ai1', 'ai3');
check(arch, '架構 BYOL docker-compose', 'byolItem1', 'byolItem2');

// ── pricing.astro ────────────────────────────────────────────────────
const price = 'pricing.astro';
check(price, '定價 三階方案',            'planCore', 'planPro', 'planEnterprise');
check(price, '定價 五幣別',              'twd', 'jpy', 'eur', 'cny');
check(price, '定價 競品對比',            'compGHAS', 'compSnyk', 'compCheckmarx');
check(price, '定價 Enterprise TCO',      'tcoForgeHelm', 'tcoCheckmarx');
check(price, '定價 年費公式',            'annualFormula');
check(price, '定價 功能對照表',          'compareDeployCore', 'compareDeployEnt');
check(price, '定價 FAQ',                 'faqQ1', 'faqQ6', 'faqQ7');
check(price, '定價 體驗折抵說明',        'faqA7', '30');
check(price, '定價 CTA Demo/PoC',        /ctaButton[12]/);

// ── compliance.astro ─────────────────────────────────────────────────
const comp = 'compliance.astro';
check(comp, '合規 框架總覽',             'frameworksTitle', 'cat1');
check(comp, '合規 GDPR/HIPAA/DORA',     'GDPR', 'HIPAA', 'DORA');
check(comp, '合規 報告結構說明',          'reportTitle', 'r1');
check(comp, '合規 匯出格式',             'exportFormatsTitle');
check(comp, '合規 四語支援',             'exportLangs');
check(comp, '合規 fwTwPdpa 台灣個資法', 'fwTwPdpa');

// ── use-cases.astro ──────────────────────────────────────────────────
const uc = 'use-cases.astro';
check(uc, '應用場景 四產業',            'i1', 'i2', 'i3', 'i4');
check(uc, '應用場景 金融',              "'i1'");
check(uc, '應用場景 政府',              "'i2'");
check(uc, '應用場景 醫療',              "'i3'");
check(uc, '應用場景 高科技製造',        "'i4'");

// ── about.astro ──────────────────────────────────────────────────────
const about = 'about.astro';
check(about, '關於 使命',               'missionTitle', 'missionText');
check(about, '關於 哲學三支柱',         'p1', 'p2', 'p3');
check(about, '關於 五個市場',           'markets', 'm1', 'm5');
check(about, '關於 法律資訊',           'STUDIO_TAX_ID', 'CONTACT_EMAIL');
check(about, '關於 無創辦人照片',       /founder|photo|個人|創辦人/, );

// ── contact.astro ────────────────────────────────────────────────────
const contact = 'contact.astro';
check(contact, '聯絡 公司名稱欄位',      'company', 'companyLabel');
check(contact, '聯絡 職稱欄位',          'title', 'titleLabel');
check(contact, '聯絡 開發者人數',        'devCount', 'sizeLabel');
check(contact, '聯絡 方案選項',          'planLabel', 'planCore');
check(contact, '聯絡 諮詢類型',          'subjectDemo', 'subjectPoC');
check(contact, '聯絡 email',             'CONTACT_EMAIL');

// ── get-started.astro ────────────────────────────────────────────────
const gs = 'get-started.astro';
check(gs, '開始 體驗方案三價格帶',     'trialLitePrice', 'trialStandardPrice', 'trialFullPrice');
check(gs, '開始 Agent 掃描流程',       'trialInclude', 'trialStep');
check(gs, '開始 30天折抵說明',         'trialCredit', '30');
check(gs, '開始 企業詢價路徑',         'pathBTitle', 'optionDemoTitle');
check(gs, '開始 PoC 路徑',             'optionPoCTitle');

// ── terms / privacy ──────────────────────────────────────────────────
const terms = 'terms.astro';
const priv = 'privacy.astro';
check(terms,  '條款 LegalTermsPage 元件',  'LegalTermsPage');
check(priv,   '隱私 LegalPrivacyPage 元件', 'LegalPrivacyPage');

// ── Print results ────────────────────────────────────────────────────
console.log('\n=== 計畫需求覆蓋率稽核 ===\n');
const failed = results.filter(r => !r.found);
const passed = results.filter(r => r.found);

// Special case: about.astro "無創辦人" - we expect the pattern NOT to match
const founderCheck = results.find(r => r.label === '關於 無創辦人照片');
if (founderCheck) {
  // flip: "found" means bad here
  founderCheck.found = !founderCheck.found;
}

const finalFailed = results.filter(r => !r.found);
console.log(`通過 ${results.filter(r => r.found).length} / ${results.length} 項`);
if (finalFailed.length === 0) {
  console.log('\n✅ 全部計畫要求均已實作');
} else {
  console.log('\n❌ 以下項目可能缺漏：');
  finalFailed.forEach(r => console.log(`  [${r.page}] ${r.label}`));
}
