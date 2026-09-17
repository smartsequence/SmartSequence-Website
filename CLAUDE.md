# SmartSequence-Website — Claude Code 協作規則

> 本檔於 `C:\charleen\SmartSequence-Website` 開 session 時自動載入。
> 建立於 2026-09-18，內容皆為當日對 HEAD `fdb9aaa` 實查所得。

---

## 這是什麼

ForgeHelm 產品官網（`https://smartsequence.tech`），Astro 5 靜態站，部署於 Vercel。
獨立 git repo：`https://smartsequence@github.com/smartsequence/SmartSequence-Website.git`

**與 ForgeHelm 四 repo 無關。** 工作區根目錄 `C:\charleen\CLAUDE.md` 的下列規則在此**一律不適用**，
不要照套、不要因為找不到對應檔案而去建立：

- 計畫檔（`*.plan.md`）／Triple-Step Protocol／L1／L2／副計畫／無人值守三連段
- 四 repo 收尾（`ForgeHelm-Agent`／`ForgeHelm-SaaS`／`ForgeHelm-Contracts`／`ForgeHelm`）
- `LAST_EXECUTION_SUMMARY.md`、`docs/file-indexes/`、`Compare-PlanRepos.ps1`、SaveBaseline
- RAG 知識庫（`Sync-ChatbotKnowledgeBase.ps1`）、白皮書 `INV-Q` 錨點、`Test-GuideLabels.ps1`
- UI i18n **六**語系（本站是**四**語系，見下節）
- `ai-workflow` 鏡像備份（那是 `Tools\` 與工作區設定用的；本 repo 自己就是 git repo，直接 commit+push）

**仍然適用**的根規則：回覆繁體中文、說人話、PowerShell 不用 `&&`、
繁體純度閘門 `Scan-Simplified.ps1 -GitDirty`（本 repo 中文量大，比照辦理）。

---

## ⛔ 檔案編碼：本 repo 是 No-BOM，與工作區根規則**相反**

根 `CLAUDE.md` 要求「所有 source 檔一律 UTF-8 **with** BOM」。**在這個 repo 不要照做。**
2026-09-18 實查現況：

| 檔案 | BOM | 說明 |
|------|-----|------|
| `src/i18n/locales/*.json` | **無** | 加 BOM 會讓 `JSON.parse` / import 出問題 |
| `package.json` | **無** | ⛔ 加 BOM 會讓 `vite build` 紅，而 tsc／eslint／vitest 三關都抓不到 |
| 根目錄 `src/pages/*.astro`、`src/layouts/Layout.astro`、`src/components/*.astro` | **無** | |
| `src/pages/{en,ja,de}/*.astro` | **有** | 4 行 re-export stub，沿用既有寫法即可 |
| 所有 `*.md`（含本檔） | **無** | |

**規則**：改既有檔就保留該檔原本的狀態；新增檔依上表對應類別辦理。
不要「順手補 BOM」——那在這裡是製造缺陷，不是修正缺陷。

---

## 行尾：`core.autocrlf=true`，repo blob 是 LF

**2026-09-18 已根治的一個長期誤會，寫下來避免重蹈：**

`git status` 曾長期顯示 16 個檔為 ` M`（`astro.config.mjs`、`public/robots.txt`、
`src/components/{Footer,Header,LanguageSwitcher}.astro`、`src/consts.ts`、
`src/i18n/{languages,utils}.ts`、`src/layouts/Layout.astro`、
`src/pages/{about,contact,features,get-started,index,privacy,terms}.astro`），
被歷次 session 當成「使用者 2026-06-17 留下的未提交工作，不要動」而一路繞開。

**實況**：那 16 個檔與 HEAD **逐位元相同**（`git diff --numstat` 空、16 檔 sha256 全部 SAME）。
成因是工作目錄上的檔案在 06-17 被改寫成 LF，而 index 記的是 CRLF 的大小
（例：`astro.config.mjs` index 記 952、磁碟實際 909，差值 43 ＝ 行數）。
`git status` 比 stat 就判 modified，`git diff` 套 clean filter 後內容相同 ⇒ 空 diff。
`git update-index --refresh` 對這種 entry 只會回 `needs update`，清不掉。

**處置**（已執行）：`git checkout -- <那 16 個檔>` 讓 git 重新寫回 CRLF，status 歸零、零內容變更。

**⛔ 不要做的事**：
- 不要把它當成別人未提交的工作而不敢動
- **不要刪除那些檔**——它們是首頁、頁首頁尾、版面與七個主要頁面，刪掉等於砍掉整個網站
- 不要為此加 `.gitattributes` 或改 `core.autocrlf`（實測改成 `input` 無效，stat 仍然對不上）

日後若再出現同樣形狀（status 有 M 但 `git diff` 空），先跑逐檔 sha256 對照 HEAD 確認，再 checkout 還原。

---

## i18n：四語系，兩道閘門的基準不同

語系＝`zh-TW`（預設，**無路徑前綴**）／`en`／`ja`／`de`，定義於 `src/i18n/languages.ts` 的 `siteLocales`
與 `astro.config.mjs` 的 `locales`（兩處必須一致）。

`languages.ts` 裡另有 15 種語言的 `languages` 常數——那是語言選單的清單，**不代表已建置路由**，
不要據此以為要生 15 份頁面。

**兩道閘門的基準不一樣，兩個都要過：**

| 閘門 | 基準 | 擋什麼 |
|------|------|--------|
| `tests/i18n-keys.test.ts`（`npm test`） | **zh-TW** | en／ja／de 缺鍵（extra 只警告） |
| `scripts/verify-i18n-parity.mjs`（`npm run verify:i18n`） | **en** | 其餘三語系 missing **與** extra |

⇒ 新增文案時四個 locale 檔必須同時加、鍵名完全一致，少一個或多一個都會紅。

locale JSON 為**巢狀**結構（`{"pages":{"contact":{"title":…}}}`），
驗證請用 `ConvertFrom-Json`／`json.load` 走結構路徑，**不要**用扁平字串 grep
（搜 `"pages.contact.title"` 恆為零命中）。

---

## 新增一個頁面的標準流程

1. `src/pages/<name>.astro` — 主體（無 BOM）。頁面骨架照 `src/pages/contact.astro`：
   `getLangFromUrl(Astro.url)` → `getTranslations(lang)` → 檔內自帶的同步 `t()` 函式。
2. `src/pages/{en,ja,de}/<name>.astro` — 各一份 4 行 re-export（**帶 BOM**）：
   ```
   ---
   import Page from '../<name>.astro';
   ---
   <Page />
   ```
3. 四個 `src/i18n/locales/*.json` 各補一組 `pages.<name>` 鍵（indent 2、LF、無 BOM、檔尾換行）。
4. 站內連結一律 `getLocalizedPath('/path', lang)`，**不要**手寫 `/en/xxx`。
5. 版面用 `src/layouts/Layout.astro`（自帶 hreflang、BaseHead、Header/Footer）。
   ⚠ `Layout` 目前**只收 `title` 與 `description` 兩個 prop**，沒有 `noindex`；
   要排除索引得改 `Layout`／`BaseHead` 或走 `public/robots.txt`。

---

## 驗證命令（CI 就跑這三個，順序相同）

`.github/workflows/ci.yml` 於 push/PR to main 執行 `npm ci` → 下列三道：

```powershell
npm test                 # vitest
npm run verify:i18n      # 對 en 的鍵集合做 parity
npm run build            # astro build
```

**2026-09-18 現場基準**（新增 `/payment` 之後）：
- `npm test` → Test Files 3 passed／Tests **40 passed**／0 failed
- `npm run verify:i18n` → `All locales have identical key structure to en.json`，exit 0
- `npm run build` → **59** page(s) built，0 error

基準會隨頁面數變動，**動手前現場重量一次**，不要沿用本檔寫死的數字當通過標準。

`scripts/` 下另有十餘支 `audit-*.mjs`（`audit-t-keys`／`audit-orphan-keys`／`audit-zhtw-style`／
`audit-falsy-values` 等），**不在 CI 內**，是人工稽核輔助。其中 `audit-t-keys` 最有用：
它比對 `.astro` 內所有 `t('...')` 與各 locale 實際有的鍵。

---

## 部署

Vercel，設定在 `vercel.json`；`astro.config.mjs` 的 `site` 為 `https://smartsequence.tech`。
`dist/` 與 `.astro/` 已 gitignore，**不要提交建置產物**（與 ForgeHelm-SaaS 的 `wwwroot/app` 規則相反）。

---

## 已知既有狀況（不是本輪造成，動到再處理）

- **`src/pages/contact.astro` 的表單送不出去**：`access_key` 仍是佔位字串 `YOUR_WEB3FORMS_KEY`。
- **`src/pages/[lang]/` 是空目錄殘留**：動態路由已於 `5caccfd`（2026-05-25）移除，版控裡沒有檔案。
- **`audit-orphan-keys` 有大量既有孤兒鍵**（`sections.modules.*`、`sections.trust.*` 等）——
  舊頁面改版留下的，新增鍵時別被它的輸出淹沒。
- **`audit-zhtw-style` 會報 4 個「zh-TW 與英文相同」**：`footer.studioNameEn`、
  `pages.pricing.comp{GHAS,Snyk,Sonar}`——都是品牌名，屬正常。

---

## `/payment` 頁（2026-09-18 新增）

**用途**：向國稅局申請開立 B2C 電子發票時，需出示的購物結帳畫面。
路由 `/payment`、`/en/payment`、`/ja/payment`、`/de/payment`。

**現況**：**只有畫面，沒有功能**。表單無 `action`，送出鈕是 `type="button"` 且無 handler，
按下不會發生任何事，也沒有接任何金流。

**兩個關鍵欄位**（國稅局要看的就是這兩個，改版時勿動其 id 與視覺標示）：

| 欄位 | input id | 標示方式 |
|------|----------|---------|
| 手機條碼載具 | `carrierId` | `.key-field` 藍框＋左側粗邊＋`.key-badge`「共通性載具」 |
| 捐贈愛心碼 | `donationCode` | `.key-field` 藍框＋左側粗邊＋`.key-badge`「捐贈發票」 |

驗證（對建置產物，不是對原始碼）：

```powershell
npm run build
Select-String -Path dist\payment\index.html -Pattern 'id="carrierId"','id="donationCode"'   # 各 1 命中
(Select-String -Path dist\payment\index.html -Pattern 'key-field' -AllMatches).Matches.Count # 2
```

**站內入口**：`src/components/Footer.astro` 的「解決方案」欄，鍵 `footer.paymentInvoice`。
Footer 每頁都渲染，所以首頁即可點達（zh-TW 為 `href="/payment"`，無尾斜線，與站內其他連結同慣例）。
**未**加進 Header 導覽列。

**仍未決定、需使用者裁決**：
1. 頁面上**沒有**「此為示意畫面／線上付款尚未開通」之類的字樣。
   ⚠ 站內其他文案（`pages.pricing.trialFlow2`／`trialNote`）寫的是
   「付款與掃描於 ForgeHelm SaaS 平台完成（Stripe）」，與本頁並存時語意上有落差。
