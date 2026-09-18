# SmartSequence-Website — Claude Code 協作規則

> 本檔於 `C:\charleen\SmartSequence-Website` 開 session 時自動載入。
> 建立於 2026-09-18（對當時 HEAD `fdb9aaa` 實查），同日大幅改版後於 HEAD `198686a` 全面更新。
> 內容皆為實查所得；數字（頁數、測試數）會隨改動變動，動手前請現場重量。

---

## 這是什麼

ForgeHelm 產品官網（`https://www.smartsequence.tech`——apex 會 308 轉到 www），Astro 5 靜態站，部署於 Vercel。
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

**2026-09-18 收工時的現場基準**（已含 `/payment`、`/services`，且範例部落格已停用）：
- `npm test` → Test Files 3 passed／Tests **40 passed**／0 failed
- `npm run verify:i18n` → `All locales have identical key structure to en.json`，exit 0
- `npm run build` → **57** page(s) built，0 error
- `npx tsc --noEmit` → 0 error（不在 CI 內，但改 `.astro` 的 frontmatter 後值得跑）

基準會隨頁面數變動，**動手前現場重量一次**，不要沿用本檔寫死的數字當通過標準。
（頁數變化史：59 → 53（停用 `/blog` 與 `rss.xml`）→ 57（新增四語系 `/services`）。）

`scripts/` 下另有十餘支 `audit-*.mjs`（`audit-t-keys`／`audit-orphan-keys`／`audit-zhtw-style`／
`audit-falsy-values` 等），**不在 CI 內**，是人工稽核輔助。其中 `audit-t-keys` 最有用：
它比對 `.astro` 內所有 `t('...')` 與各 locale 實際有的鍵。

---

## 部署

Vercel，設定在 `vercel.json`；`astro.config.mjs` 的 `site` 為 `https://www.smartsequence.tech`。
`dist/` 與 `.astro/` 已 gitignore，**不要提交建置產物**（與 ForgeHelm-SaaS 的 `wwwroot/app` 規則相反）。

**網域以 www 為準**（2026-09-18 對齊）：實測 apex `https://smartsequence.tech/...` 一律 308 轉到 www，
所以 www 才是真正提供內容的來源。`astro.config.mjs` 的 `site`、`src/consts.ts` 的 `SITE_URL`、
`public/robots.txt` 的 Sitemap 三處都必須是 www——它們決定每頁的 canonical、hreflang、
JSON-LD `url` 與 sitemap。若日後改以 apex 為主（在 Vercel 把 www 轉去 apex），這三處要一起改回來。

---

## 已知既有狀況（不是本輪造成，動到再處理）

- **`src/pages/[lang]/` 是空目錄殘留**：動態路由已於 `5caccfd`（2026-05-25）移除，版控裡沒有檔案。
- **`audit-orphan-keys` 有大量既有孤兒鍵**（`sections.modules.*`、`sections.trust.*` 等）——
  舊頁面改版留下的，新增鍵時別被它的輸出淹沒。
- **`audit-zhtw-style` 會報 4 個「zh-TW 與英文相同」**：`footer.studioNameEn`、
  `pages.pricing.comp{GHAS,Snyk,Sonar}`——都是品牌名，屬正常。

---

## `/payment` 頁（2026-09-18 新增）

**用途**：向國稅局申請開立 B2C 電子發票時，需出示的購物結帳畫面。
路由 `/payment`、`/en/payment`、`/ja/payment`、`/de/payment`。

**現況**：**只有畫面，沒有金流**。送出鈕是 `type="button"` 且無 handler，按下不會發生任何事。
使用者正在研究如何讓它真的能收款（2026-09-18）。

**欄位會隨選擇切換**（2026-09-18 加入，`data-invoice-group` / `data-pay-group` ＋ 頁內 module script）：
發票類型「個人」顯示手機條碼載具、「捐贈」顯示愛心碼、「公司」顯示統一編號與抬頭；
付款方式「信用卡」才顯示卡號欄位，「ATM 虛擬帳號」與「銀行匯款」改顯示取號／對帳說明。
隱藏的群組會一併 `disabled`，避免送出未顯示的值或被 `pattern` 擋下。
⚠ 因此**單一張截圖不再同時呈現兩個關鍵欄位**——要向國稅局出示時，需在「個人」與「捐贈」各截一張。
（原本的「自然人憑證條碼」欄位已於同日依使用者指示移除。）

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

**刻意不加的字樣**：頁面上**沒有**「此為示意畫面／線上付款尚未開通」之類的說明。
這是使用者 2026-09-18 的裁決——官網已上線是要給國稅局看的，等跟國稅局辦好再加。
**不要自作主張補上。**
（同日查證更正：本檔原本寫「站內 `pages.pricing.trialFlow2`／`trialNote` 有 Stripe 說法與本頁衝突」，
實查那兩個鍵已不存在，該衝突不成立。）

---

## `/services` 導入與顧問服務頁（2026-09-18 新增）

路由 `/services` 與 `/en|ja|de/services`。內容為三項服務（ForgeHelm 導入與治理顧問／
AI 架構評估與工作流建置／多語內容治理）、合作方式三點、計費方式，CTA 為來信洽詢。

**定位裁決（改文案前先讀，違反會推翻整個定位）：**

- **不進 Header 導覽**。入口只有頁尾「解決方案」欄（`footer.servicesLink`）與關於我們
  交付模式段落末的連結（`pages.about.deliveryLink`）。首頁主張維持 ForgeHelm 單一訴求——
  產品與接案服務**並列**會讓企業採購把 ForgeHelm 讀成副產品。
- **服務頁不提「可用 ForgeHelm 當元件」**。那是內部判斷，寫出來會讓客戶質疑顧問中立性。
- **不承諾 SLA、不承諾專屬支援**（全站適用，見下節）。

---

## ⛔ 對外承諾的紅線（2026-09-18 裁決，全站適用）

- **不寫可用性 SLA、不寫保證回應時間、不寫專屬支援**。定價頁原有的「99.5% 可用性、
  4 小時回應、企業版專屬 SLA」已全數撤除（含功能對照表那一列，改為「支援方式：電子郵件」）。
- **也不要寫否定句**。「我們不承諾 SLA」這種寫法是此地無銀，反而製造恐懼——客戶面文案
  **只講實際提供什麼**（電子郵件、工作日處理）。需要保證回應時間時，寫成
  「可在顧問合約中另行約定」。
- **聯絡途徑只有 email**，文案不要再出現「優先處理」這類分級說法。

---

## 主題（深／淺色）與對比

- **預設跟隨系統偏好**：`Layout.astro` 的 inline script 讀 `localStorage.theme`，沒有存過就看
  `prefers-color-scheme`。`:root` 與 `html[data-theme='light']` 都宣告 `color-scheme`，
  這會讓 Chrome 內建的自動深色不去塗改本站。
  ⚠ **Dark Reader 這類擴充功能擋不掉**——使用者回報「淺色模式仍是黑底」時，先請他用無痕視窗確認，
  那幾乎都是本機外掛，不是網站的問題（2026-09-18 實際發生過一次，追了很久）。
- **色彩一律走主題變數**，不要寫死色碼。`--accent`（深 `#93c5fd`／淺 `#1d4ed8`）、
  `--success-text`、`--bg-highlight`、`--border`、`--card-bg`、`--font-mono` 都定義在 `Layout.astro`。
  ⚠ **頁首與頁尾恆為深色**，其中的文字色必須寫死淺色（如 `#f1f5f9`），
  **不可**用 `var(--text-primary)`——淺色主題下它會變成深色字貼在深底上，整個看不見
  （「立即體驗」按鈕與 BYOL 區塊的按鈕都踩過這個坑）。
- **全站文字對比 0 項未達 WCAG AA**（15 條路由 × 深／淺兩主題實測）。改色後請重新量測，
  不要只看單一頁面。

---

## 導覽列：1200px 以下為漢堡選單

`Header.astro` 把 `.nav-links` 與 `.header-actions` 包在 `.nav-panel` 內：桌機
`display: contents`（兩者仍是 `nav` 的直接 flex 子項，版面與改版前相同），1200px 以下改為
header 下方的展開面板，由漢堡鈕控制。

斷點 1200px 是量出來的——載入字型後逐 10px 測「導覽連結開始在項目內換行」的寬度：
de 1180px、zh-TW 1130px、ja 與 en 至 900px 仍不換行，取最寬的 de 再留 20px 餘裕。
**改導覽文案後要重量**：文字變長會讓換行點往上移，超過 1200px 就會撐破固定高度的 header 並蓋住內容。

---

## 聯絡表單（Web3Forms）

`src/pages/contact.astro` 的表單 POST 到 `https://api.web3forms.com/submit`。

- `access_key` 是**公開值**（會出現在頁面原始碼裡），不是機密，直接寫在檔案內即可。
  真正的機密（如寄信服務的 API key）不可進版控。
- 送出後由 `redirect` 欄位導回本頁並帶 `?sent=1`，頁面顯示成功區塊（`#form-success`），
  顯示後用 `history.replaceState` 把參數從網址移除。
  ⚠ `redirect` 的絕對網址要先正規化：`getLocalizedPath` 對預設語系不帶尾斜線、對其他語系帶，
  沒處理的話 ja/de 會產出 `//?sent=1`。
- **端到端測試只能由使用者在一般瀏覽器做**：Web3Forms 免費方案拒絕伺服器端 POST，
  而以無頭瀏覽器送出會撞上 Cloudflare 機器人驗證（不可繞過）。

---

## 範例部落格已停用（2026-09-18）

Astro 起始樣板的示範文章原本可從 `/blog/` 打開（「Build the web you want」「Using MDX」等五篇），
且那些頁不套 `Layout`，導覽列在其上是白底白字。依使用者裁決「先擋住不刪」：

- `src/pages/blog` → `src/pages/_blog`、`src/pages/rss.xml.js` → `src/pages/_rss.xml.js`
  （底線前綴讓 Astro 不產生路由）
- `BaseHead.astro` 內指向 `rss.xml` 的 `<link rel="alternate">` 已移除（否則指向 404）
- 文章原稿仍在 `src/content/blog/`，要恢復把底線拿掉即可

---

## ⚠ `src/i18n/bundles/` 是陳舊快照，不是 locale 的來源

`src/i18n/bundles/{ja,de}-{misc,pages,sections}.json` 只被 `scripts/apply-locale-bundles.mjs`
使用（**不在 CI 內**），內容是某次翻譯匯入的快照。改 `src/i18n/locales/*.json` 的文案時，
如果同一個鍵也存在於 bundle，**要一併改**——否則日後誰跑一次那支腳本，就會把舊文案灌回去。
（2026-09-18 撤除 SLA 承諾時就踩到：bundle 裡還留著「99.5% 可用性」。）

---

## 繁體純度閘門在本 repo 的兩個已知行為

- `Tools\Scan-Simplified.ps1` 的 `$textExt` 已於 2026-09-18 納入 `.astro`、`.css`、`.scss`、
  `.vue`、`.svelte`——在那之前 `-GitDirty` 對本 repo 的主要檔型（`.astro`）結構性失明。
- 同日補上**前綴形**的日／韓 locale 排除（`ja-pages.json`、`ko-misc.json`）。在那之前
  `locales/ja.json` 有被排除、`bundles/ja-pages.json` 卻沒有，掃該檔會吐出 39 處日文漢字誤報。
- 掃到 0 檔時回 **exit 2 是 fail-safe**（拒絕放行），不是通過。遇到時先查變更檔的副檔名
  在不在 `$textExt`；`-Path <單一檔案>` 會繞過副檔名過濾，可用來單獨驗一個檔。
