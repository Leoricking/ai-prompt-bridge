# AI Prompt Bridge v1.85｜使用說明（繁體中文）

AI Prompt Bridge 是支援 ChatGPT、Gemini、Claude、DeepSeek 等網站的 Tampermonkey 使用者腳本，可搬運 AI 回答、產生跨 AI 提示詞，以及將對話匯出為 Word／OneNote 友善格式。

> **版本狀態**：本文件以 v1.85 的預期行為為主；JavaScript 語法檢查不等於實際擷取驗收。ChatGPT 新版 DIL 介面及 Gemini 完整 Session 尚未完成 Opera＋OneNote 實機驗證。若使用者訊息無法辨識，程式可能拒絕匯出，以免把部分對話誤當完整 Session。
>
> **歷史紀錄**：本檔案保留 v1.71 之前的原始完整 README，歷史章節中的快捷鍵說明及舊字體設定，可能已被新版本取代。請以本頁「目前快捷鍵」為準。

## 目前快捷鍵與用途

| 快捷鍵 | 作用範圍 | 輸出用途 |
| --- | --- | --- |
| **Alt+W** | 最新一則 AI 完整回答（不是整段對話） | 可編輯的 Word／OneNote 富文本，預期正文 18pt |
| **Alt+Shift+W** | 最新一則 AI 完整回答 | 盡量接近畫面配置的視覺富文本 |
| **Alt+N** | 目前頁面已載入的整個 Session：使用者問題＋AI 回答 | Word／OneNote 富文本 |
| **Alt+S** | 目前頁面已載入的整個 Session：使用者問題＋AI 回答 | 原始純文字 |
| **Alt+C** | 選取文字或最近回答 | 暫存並複製文字，供其他 AI 使用 |
| **Alt+V** | 將暫存內容轉為 Cursor 修正提示詞 | 貼給 ChatGPT／Cursor 使用 |
| **Alt+B／Alt+R** | 腳本面板 | 隱藏／顯示；重置位置 |

### ChatGPT 與 Gemini 操作方式

1. 開啟目標聊天。想保存**最新 AI 回答**，按 `Alt+W`，切換至 OneNote 後貼上；想保存**整個聊天 Session**，按 `Alt+N`（富文本）或 `Alt+S`（純文字）。
2. 對話過長時，先向上捲動使歷史內容載入；腳本只能擷取網頁當下已渲染或可辨識的內容，無法保證取得未載入的歷史訊息。
3. 當出現「無法確認使用者問題是否完整載入」時，代表安全檢查拒絕複製，**不是已成功備份**。此時可在 DevTools Console 查看 `[AI Prompt Bridge]` 診斷資訊。
4. ChatGPT 使用 DIL 介面時，Alt+W 優先使用 `DilResponseRoot` 整個回答容器，而非只抓最後一段；Gemini 仍須在實際頁面驗證選擇器與完整性。
5. 對表格、程式碼、Writing Block、圖片和 OneNote 字型，均須檢查貼上結果；瀏覽器複製成功不保證 Office 保留全部樣式。

## 安裝或更新

1. 在 Tampermonkey 匯出備份目前版本。
2. 將 `ai-prompt-bridge.user.js` 完整內容貼入既有腳本並儲存，不要與舊版本同時啟用。
3. 重新整理 ChatGPT／Gemini 分頁；必要時在 Opera 擴充功能設定確認 Tampermonkey 有網站存取權及使用者腳本權限。
4. 確認腳本標頭 `@version` 及內部 `AI_PROMPT_BRIDGE_VERSION` 均為 `1.85.0`。

## v1.83～v1.85 更新摘要

### v1.83 — ChatGPT DIL 完整回答擷取

- 根據 Opera DOM 診斷，優先擷取包含開頭、課表 A／B／C、結尾的整個 `DilResponseRoot`。
- 保留回答內部 Writing Block 的可見正文，不將它直接視為輸入框刪除。
- 在匯出前比較前後文字與標題；若懷疑清理造成漏段，停止複製並記錄診斷。
- 其他快捷鍵原則上保留既有行為，**不代表已通過新介面回歸驗證**。

### v1.84 — ChatGPT／Gemini 擷取來源整合

- 對最新回答與完整 Session 增加共用蒐集／檢查邏輯；完整 Session 應按畫面順序涵蓋 User 與 AI。
- 若 DOM 只能辨識 AI 回答，卻無法確認 User 訊息，Alt+N／Alt+S 可能拒絕匯出，避免顯示假成功。
- Gemini 使用既有容器辨識及 fallback；尚未從使用者的實際 Gemini DOM 完成驗證。

### v1.85 — ChatGPT 使用者訊息（User Bubble）辨識

- 改進 ChatGPT 使用者問題容器的偵測，嘗試支援不同世代的 role／testid／class 標記。
- 避免將回答內的 Writing Block、Sidebar、Composer 誤認成 User 訊息。
- Alt+N 與 Alt+S 共用 Session 訊息清單，盡量維持原始順序及避免重複擷取。
- 若無法確認完整對話，仍會拒絕覆寫剪貼簿；**並未保證所有網頁或所有歷史訊息可完整擷取**。
- Alt+W、Alt+Shift+W、Alt+C、Alt+V、Review、Panel 等沿用既有功能。

## 發布前驗收清單

- [ ] ChatGPT Alt+W：從第一段到最後一段完整，無其他對話混入。
- [ ] ChatGPT Alt+N：每一個已載入的 User 問句與 AI 回答都按順序出現。
- [ ] ChatGPT Alt+S：與 Alt+N 同一份訊息順序，格式改成純文字。
- [ ] Gemini Alt+W／Alt+N／Alt+S：分別核對最新回答與整段對話。
- [ ] OneNote：18pt 正文、標題、清單、表格、程式碼換行、Writing Block 已檢查。
- [ ] Alt+C／Alt+V／Alt+B／Alt+R、Panel、Review、Project Context 未回歸。
- [ ] `node --check ai-prompt-bridge.user.js`、`git diff --check` 與實機貼上測試通過後再提交。

---

# 原版 README 歷史紀錄（保留原文，版本截至 v1.71）
# AI Prompt Bridge v1.71

AI Prompt Bridge 是一個 Tampermonkey userscript，用來在 ChatGPT、Gemini、Claude、DeepSeek、Perplexity、Qwen、Cursor 等頁面之間快速搬運內容、生成 review prompt、生成 Cursor fix prompt、整理筆記，以及複製 Word / OneNote 可用的乾淨富文本。

> v1.8 是 public-safe 版本：預設不包含作者個人專案名稱、本機路徑或私人工作流。所有 Project Context 都改成通用模板。

---

## 1. 功能總覽

```text
Alt+C：抓目前 AI 回覆 / 選取文字，存暫存區並複製純文字
Alt+V：把暫存內容轉成 Cursor 修正 Prompt
Alt+S：複製目前頁面整個 session 純文字
Alt+N：把暫存內容轉成 OneNote / Markdown 筆記整理 Prompt
Alt+W：複製單段 / 選取內容的 Word / OneNote 富文本格式
Alt+Shift+W：複製整個 session 的 Word / OneNote 富文本格式
Alt+B：隱藏 / 顯示面板
Alt+R：重置面板位置
```

---

## 2. 支援網站

```text
https://chatgpt.com/*
https://chat.openai.com/*
https://gemini.google.com/*
https://claude.ai/*
https://chat.deepseek.com/*
https://www.perplexity.ai/*
https://chat.qwen.ai/*
https://cursor.com/*
```

---

## 3. 安裝方式

### 3.1 安裝 Tampermonkey

在 Chrome / Edge / Opera 安裝 Tampermonkey。

### 3.2 匯入腳本

```text
Tampermonkey Dashboard
→ 新增腳本
→ 貼上 ai-prompt-bridge.user.js 全部內容
→ Ctrl+S 儲存
```

### 3.3 Opera 必開設定

如果使用 Opera，請到：

```text
opera://extensions
```

確認：

```text
研發人員模式：開
Tampermonkey：啟用
網站存取權：在所有網站上
允許使用者腳本令碼：開
```

如果 `允許使用者腳本令碼` 沒開，腳本會出現在 Tampermonkey 選單，但不會真正注入頁面。

---

## 4. Project Context

v1.8 預設只提供通用 Project Context，不包含任何私人專案名稱或本機路徑。

內建選項：

```text
Auto Detect
Generic Project
Python GUI App
Browser Extension / Userscript
Data / Quant Analysis
Media Processing Tool
Downloader / Automation Tool
```

### 4.1 為什麼移除私人專案？

公開分享 userscript 時，不應該內建作者私人專案名稱、本機資料夾、客戶資訊、公司內部專案、特殊路徑或工作流。

v1.8 的原則：

```text
Public script：只放通用模板
Private presets：由使用者自行保存在本機私人版本或另行維護
```

---

## 5. 面板按鈕

```text
Project Context 下拉選單

① 抓這邊並複製 Alt+C
② 複製暫存原文
③ 給 Gemini 看 UI
④ 給對方審 Code
⑤ 給 ChatGPT 轉 Cursor Alt+V
⑥ 變成 Cursor Rule
⑦ 複製整個 Session Alt+S
⑨ 整理成 OneNote 筆記 Alt+N
⑩ 複製 Word/OneNote 格式 Alt+W
⑪ 複製整頁 Word/OneNote Alt+Shift+W
⑧ 重置面板位置
🙈 隱藏 Alt+B
```

---

## 6. 基本使用邏輯

```text
來源 AI：Alt+C
目標 AI：Alt+V / Alt+N / Code Review / Visual Review
輸入框：Ctrl+V
送出
```

### 6.1 Gemini → ChatGPT → Cursor

```text
1. Gemini 看截圖或分析 UI 問題
2. Gemini 回答完成後按 Alt+C
3. 切到 ChatGPT
4. 按 Alt+V
5. ChatGPT 輸入框 Ctrl+V
6. ChatGPT 產出 Cursor 修正 prompt
7. 貼到 Cursor Composer
```

### 6.2 ChatGPT → DeepSeek → ChatGPT

```text
1. ChatGPT 先產出修正方向
2. 按 Alt+C
3. 切到 DeepSeek
4. 點 ④ 給對方審 Code
5. DeepSeek 輸入框 Ctrl+V
6. DeepSeek review 完後按 Alt+C
7. 切回 ChatGPT
8. 按 Alt+V
9. ChatGPT 整合成最終 Cursor prompt
```

---

## 7. OneNote / Markdown 筆記整理

### 7.1 單段整理

```text
1. 在來源 AI 選取有用段落
2. 按 Alt+C
3. 切到 ChatGPT
4. 按 Alt+N
5. ChatGPT 輸入框 Ctrl+V
6. 送出
7. 複製整理後內容到 OneNote / Notion / Markdown
```

### 7.2 整段 session 整理

```text
1. 在目前 AI 頁面按 Alt+S
2. 切到 ChatGPT
3. 按 Alt+N
4. ChatGPT 輸入框 Ctrl+V
5. 送出
6. 將整理後版本貼到 OneNote / Markdown
```

---

## 8. Word / OneNote 富文本複製

### 8.1 複製單段格式

```text
1. 在 AI 頁面選取要保存的內容
2. 按 Alt+W
3. 到 Word / OneNote / Outlook / Notion
4. Ctrl+V
```

若未選取內容，會嘗試自動抓最後一段 AI 回答。

### 8.2 複製整個 session 格式

```text
1. 在 AI 頁面先往上捲動，讓舊訊息載入
2. 按 Alt+Shift+W
3. 到 Word / OneNote / Outlook / Notion
4. Ctrl+V
```

`Alt+Shift+W` 會自動加入：

```text
AI Session Export
Source
Captured At
URL
```

---

## 9. Alt+S vs Alt+Shift+W

| 快捷鍵 | 格式 | 適合用途 |
|---|---|---|
| Alt+S | 純文字 | Notepad++、raw log、交給 ChatGPT 整理 |
| Alt+Shift+W | HTML 富文本 + 純文字 | Word、OneNote、Outlook、Notion |

---

## 10. 面板拖曳

v1.7 起，面板內所有非功能區域都可拖曳。

可以拖曳：

```text
面板標題列
面板空白區
提示文字區
按鈕之間的間距
Project Context 周圍空白區
```

不會觸發拖曳：

```text
按鈕
下拉選單
輸入框
文字區
連結
可編輯區域
```

---

## 11. 面板不見 / 無作用排查

### 11.1 面板不見

```text
Alt+R：重置面板位置
Alt+B：隱藏 / 顯示面板
```

### 11.2 腳本沒注入

在 AI 頁面按 F12 → Console，搜尋：

```text
[AI Prompt Bridge] injected
```

如果沒有，檢查：

```text
Tampermonkey 是否啟用
AI Prompt Bridge 是否啟用
網站存取權是否是「在所有網站上」
Opera 是否開啟「允許使用者腳本令碼」
目前網址是否符合 @match
```

---

## 12. 隱私與公開分享原則

v1.8 是 public-safe build。

公開版本不應包含：

```text
私人專案名稱
本機絕對路徑
客戶名稱
公司內部 repo
API key / token
cookies
個人 email 以外的敏感資訊
```

建議做法：

```text
公開版：使用 ai-prompt-bridge.user.js
私人版：自己另存 ai-prompt-bridge.private.user.js，放個人專案 preset
```

---

## 13. Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "chore: remove private project presets from public build" -m "- Remove personal project names and local paths from default Project Context presets.
- Replace private presets with generic public-safe templates.
- Keep project-aware prompt injection while avoiding exposure of private repositories.
- Update README with public-safe usage, privacy guidance, and generic project contexts."
```

---

## v1.9：OneNote 20pt 舒適字體輸出

v1.9 針對 OneNote / Word 富文本貼上做字體改善。

### 為什麼 OneNote 貼上字體常常太小？

OneNote 是「無限畫布」設計，不像 Word 以 A4 紙張為中心。它常用 10.5pt～11pt 作為預設字體，這在 2K / 4K 螢幕上會顯得太小。從網頁貼入 HTML 時，OneNote 又會優先採用剪貼簿裡的 HTML 樣式，所以只改 OneNote 預設字型不一定能影響外部貼上的內容。

因此 v1.9 在 `Alt+W` 與 `Alt+Shift+W` 複製 HTML 時，直接注入 OneNote 友善的大字體樣式。

---

### v1.9 字體規則

```text
一般內文：20pt
大標題 H1/H2/H3/H4：維持來源原本大小，不再強制放大
code / pre：16pt
行高：1.6
字體：Microsoft JhengHei / Segoe UI / Calibri / Noto Sans TC
```

---

### 影響範圍

這些功能會使用 20pt 富文本：

```text
Alt+W：複製單段 / 選取內容到 Word / OneNote
Alt+Shift+W：複製整個 session 到 Word / OneNote
```

不受影響：

```text
Alt+C：仍保留純文字 / AI 搬運用途
Alt+S：仍保留純文字 session 備份用途
Alt+N：仍是產生筆記整理 prompt
Alt+V：仍是 Cursor fix prompt
```

---

### 使用方式

```text
1. 在 ChatGPT / Gemini / Claude / DeepSeek 頁面
2. 選取要複製的內容，或不選取直接抓最後一段回答
3. 按 Alt+W
4. 到 OneNote / Word Ctrl+V
```

完整 session：

```text
1. 先往上捲動，讓舊訊息載入
2. 按 Alt+Shift+W
3. 到 OneNote / Word Ctrl+V
```

---

### OneNote 本身也可以調整

如果你希望自己手動輸入的字也變大，可以在 OneNote：

```text
檔案
→ 選項
→ 一般
→ 預設字型
→ 大小改成 18 或 20
```

但這只影響 OneNote 自己的新輸入內容。從網頁貼上的 HTML 仍會以剪貼簿 HTML 樣式為主，所以 v1.9 的 20pt HTML 注入仍然必要。

---

## v1.9 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: improve OneNote rich-text font size" -m "- Set Word / OneNote rich-text exports to a 20pt readable default font size.
- Add larger heading sizes and comfortable line-height for pasted AI content.
- Apply inline styles to improve OneNote compatibility.
- Keep Alt+C and Alt+S plain-text workflows unchanged.
- Update README with OneNote font behavior and v1.9 usage notes."
```

---

## v1.10：保留大標題原本大小，只放大內文字體

v1.10 修正 v1.9 的字體策略：

```text
v1.9：內文 20pt，H1/H2/H3/H4 也被強制放大
v1.10：內文 / 小字體改成 20pt，大標題維持原本大小
```

### 為什麼要這樣改？

貼到 OneNote 時，最需要改善的是：

```text
一般段落太小
清單太小
表格文字太小
span / div 小字太小
```

但 ChatGPT / Gemini 原本的大標題通常已經夠大，如果再強制變成 30pt / 26pt，貼到 OneNote 會顯得過大、版面不平衡。

所以 v1.10 改成：

```text
一般內文：20pt
清單：20pt
表格：20pt
span / div 小字：20pt
code / pre：16pt
大標題 H1/H2/H3/H4/H5/H6：不強制指定 font-size，盡量保留來源大小
```

### 影響範圍

```text
Alt+W：單段 / 選取內容富文本
Alt+Shift+W：整個 session 富文本
```

不影響：

```text
Alt+C
Alt+S
Alt+N
Alt+V
Project Context
面板拖曳
```

---

## v1.10 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve heading sizes in OneNote rich text export" -m "- Keep original heading font sizes when copying rich text to Word / OneNote.
- Enlarge normal body text, list items, table cells, divs, and spans to 20pt.
- Keep code and preformatted blocks at 16pt for readability.
- Update README with v1.10 OneNote typography behavior."
```

---

## v1.12：恢復 Alt+S 原始 Session，Alt+N 改成一鍵貼 OneNote

v1.12 依照使用習慣重新分配快捷鍵：

```text
Alt+S：保留原本功能，複製整個 session 原始純文字
Alt+N：新的 OneNote 20pt 富文本 session，一鍵複製到 OneNote / Word
Alt+Shift+N：保留舊的「整理成 OneNote / Markdown 筆記 Prompt」
Alt+Shift+W：保留完整 session 富文本複製的相容快捷鍵
```

### 為什麼這樣改？

`Alt+S` 原本已經形成肌肉記憶，用來保存 raw session / 貼到 Notepad++ / 交給 AI 再整理。
因此 v1.12 恢復 `Alt+S` 原始功能。

`Alt+N` 原本是「產生 OneNote 筆記整理 Prompt」，但它和「直接複製到 OneNote」使用情境高度重疊，所以改成：

```text
Alt+N = 直接把整個 session 複製成 OneNote / Word 富文本
```

### 字體規則

```text
一般內文：20pt
清單：20pt
表格文字：20pt
span / div 小字：20pt
code / pre：16pt
大標題 H1/H2/H3/H4/H5/H6：維持來源原本大小，不強制放大
```

### 使用方式

原始 session 備份：

```text
Alt+S
→ Notepad++ / raw log / ChatGPT
→ Ctrl+V
```

整個 session 直接貼到 OneNote：

```text
Alt+N
→ OneNote / Word / Outlook
→ Ctrl+V
```

舊版整理筆記 Prompt：

```text
Alt+Shift+N
→ ChatGPT 輸入框
→ Ctrl+V
```

---

## v1.12 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: map Alt+N to OneNote full-session rich copy" -m "- Restore Alt+S as the original full-session raw text copy shortcut.
- Make Alt+N copy the full current AI session as OneNote / Word rich text.
- Preserve heading sizes while enlarging body text to 20pt for OneNote readability.
- Move the old OneNote note-prompt generator to Alt+Shift+N.
- Keep Alt+Shift+W as a compatibility shortcut for full-session rich text export."
```

---

## v1.13：明確定義 Alt+N 是 Alt+W 的全 Session 加強版

v1.13 主要是把功能定義整理清楚：

```text
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
Alt+N：整個 session → OneNote / Word 富文本
Alt+S：整個 session → 原始純文字
```

### Alt+N 正式定位

`Alt+N` 不是整理 Prompt。
`Alt+N` 是 `Alt+W` 的加強版：

```text
Alt+W = 複製單段內容到 OneNote / Word
Alt+N = 複製整個 session 到 OneNote / Word
```

### Alt+N 輸出規則

```text
來源：目前頁面整個已載入 session
輸出：乾淨 HTML 富文本 + 純文字備援
貼到：OneNote / Word / Outlook / Notion / Google Docs
內文：20pt
清單：20pt
表格文字：20pt
span / div 小字：20pt
code / pre：16pt
大標題 H1/H2/H3/H4/H5/H6：維持來源原本大小，不強制放大
```

### Alt+S 保留原本功能

`Alt+S` 仍是原本的 raw session：

```text
Alt+S
→ 複製整個 session 原始純文字
→ 適合貼到 Notepad++ / raw log / 再丟給 ChatGPT 整理
```

### 使用方式

複製整個 session 到 OneNote：

```text
1. 在 ChatGPT / Gemini / Claude / DeepSeek 頁面
2. 如果對話很長，先往上捲動讓舊訊息載入
3. 按 Alt+N
4. 到 OneNote / Word
5. Ctrl+V
```

複製整個 session 原始純文字：

```text
1. 在 AI 頁面按 Alt+S
2. 到 Notepad++ / ChatGPT
3. Ctrl+V
```

---

## v1.13 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "docs: clarify Alt+N full-session OneNote export" -m "- Clarify that Alt+N is the full-session enhanced version of Alt+W.
- Keep Alt+S as the original raw full-session text copy shortcut.
- Update panel labels and hints to distinguish raw session copy from OneNote rich-text export.
- Document that Alt+N exports the loaded full session with 20pt body text and preserved heading sizes."
```

---

## v1.14：修正 Alt+N 全 Session 擷取與圖片保留

v1.14 修正 `Alt+N` 和 `Alt+W` 的差異問題。

### 問題原因

之前的 `Alt+N` 使用過度保守的 transcript selector，可能只抓到部分訊息，導致看起來不像完整 session。
而某些 fallback 會抓到整個頁面 root，導致 sidebar、聊天列表、非對話區一起被帶進去。

### v1.14 修正

```text
1. ChatGPT 優先使用 [data-message-author-role] 逐則抓 user / assistant 訊息。
2. 不再用整個頁面 root 當主要來源，避免 sidebar 被一起複製。
3. 每則訊息會加上 User / Assistant 區塊標題。
4. Alt+N 會複製目前已載入 DOM 的整個 session。
5. 若對話很長，仍需先往上捲動讓舊訊息載入。
```

### 圖片支援

`Alt+W` 與 `Alt+N` 會保留 HTML 內的 `<img>` 標籤，並把圖片來源轉成絕對 URL。

但要注意：

```text
1. Word / OneNote 是否能真的貼出圖片，取決於該圖片 URL 是否可被 OneNote / Word 讀取。
2. 如果圖片是 blob:、受權限保護、需要登入 token、或被 CORS 限制，OneNote / Word 可能只貼文字或空白。
3. ChatGPT 生成圖有時候是受保護下載連結，瀏覽器看得到，不代表 OneNote 一定能直接嵌入。
4. 最穩方式仍是圖片另存後再插入 OneNote。
```

### 快捷鍵定義

```text
Alt+W：單段 / 選取內容 → OneNote / Word 富文本，會嘗試保留圖片
Alt+N：整個已載入 session → OneNote / Word 富文本，會嘗試保留圖片
Alt+S：整個 session 原始純文字
```

---

## v1.14 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: improve full-session rich text extraction" -m "- Fix Alt+N full-session export to collect ChatGPT user and assistant messages via data-message-author-role.
- Avoid copying sidebar and non-conversation UI into rich session exports.
- Preserve image tags in Alt+W and Alt+N rich-text exports when browser clipboard allows it.
- Add source URL normalization for images and document image-copy limitations.
- Update README with full-session extraction and image handling notes."
```

---

## v1.15：修正 Alt+W 單段複製與圖片 / 連結保留

v1.15 修正 `Alt+W` 看起來內容不完整的問題。

### 問題原因

`Alt+W` 是單段 / 選取內容富文本複製，不是整個 session。
但舊版在 ChatGPT 頁面抓最新 assistant 訊息時，可能只抓 `.markdown` 文字區，導致圖片卡片、下載卡片、按鈕式連結被排除。

另外，舊版清理 HTML 時會直接移除所有 `button`，這會誤刪某些 AI 平台用 button 包裝的檔案卡片 / 下載卡片。

### v1.15 修正

```text
1. ChatGPT 的 Alt+W 優先抓完整 assistant 訊息容器，而不是只抓 .markdown。
2. 清理 HTML 前先保留有意義的 button 文字、連結與圖片。
3. text/plain 備援內容會補上連結 URL 與圖片標記。
4. Alt+W / Alt+N 都會嘗試保留 <img>。
```

### 圖片限制

`Alt+W` / `Alt+N` 會嘗試保留圖片，但是否能貼進 OneNote / Word 取決於圖片來源：

```text
可成功：公開圖片 URL、一般 https 圖片
可能失敗：blob: 圖片、需登入 token 的圖片、ChatGPT 受保護生成圖、CORS / 權限限制圖片
```

最穩方式仍是圖片另存後再插入 OneNote。

---

## v1.15 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve links and images in rich copy" -m "- Make Alt+W prefer the full ChatGPT assistant message container instead of markdown-only content.
- Preserve meaningful button-based cards before removing utility buttons.
- Add link URLs and image markers to plain-text clipboard fallback.
- Keep image tags and normalize image URLs for Word / OneNote rich-text paste.
- Update README with Alt+W behavior and image-copy limitations."
```

---

## v1.16：修正 Alt+S 沒反應

v1.16 修正 `Alt+S` 沒反應的問題。

### 問題原因

v1.12～v1.15 期間，`Alt+S` 已經被重新定義為「原本的完整 session 原始純文字」，但是腳本內部缺少 `copyFullSessionRawText()` 包裝函式，導致快捷鍵觸發時會在 Console 出現 `ReferenceError`，看起來就像完全沒反應。

### v1.16 修正

```text
1. 補回 copyFullSessionRawText()，內部呼叫 captureFullSession()
2. Alt+S 恢復為完整 session 原始純文字
3. Alt+N 維持為完整 session → OneNote / Word 富文本
4. keydown 改成 capture phase，提高快捷鍵被頁面攔截前觸發的機率
5. 增加 event.code fallback，避免不同鍵盤語系下 event.key 判斷失效
6. Tampermonkey 選單新增 Test Shortcut / Copy Raw Session Now，方便排查
```

### 快捷鍵

```text
Alt+S：完整 session 原始純文字
Alt+N：完整 session → OneNote / Word 富文本
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
Alt+C：單段原文 / AI 搬運暫存
```

### 如果 Alt+S 還是沒反應

請在 ChatGPT 頁面點 Tampermonkey 圖示，選：

```text
Test Shortcut / Copy Raw Session Now
```

如果選單可以複製，代表腳本正常，是瀏覽器或網站攔截快捷鍵。
如果選單也不能複製，請開 F12 → Console 看錯誤訊息。

---

## v1.16 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: restore Alt+S raw session copy" -m "- Add the missing copyFullSessionRawText wrapper for full-session raw text export.
- Restore Alt+S as the original raw full-session copy shortcut.
- Keep Alt+N as the full-session OneNote / Word rich-text export.
- Improve shortcut reliability with capture-phase keydown handling and event.code fallback.
- Add a Tampermonkey menu command for raw session copy testing."
```

---

## v1.17：清理 Alt+S / Alt+V 不必要文字

v1.17 修正 `Alt+S` 和 `Alt+V` 會生成不必要文字的問題。

### 修正原因

舊版 `Alt+S` 會在 structured transcript 和 generic page text 之間選比較長的內容。
ChatGPT 頁面的 generic text 很容易包含：

```text
左側 sidebar
聊天歷史
導覽選單
AI Prompt Bridge 面板文字
Project Context 下拉選單
頁面提示文字
```

這導致 `Alt+S` 複製出一大段非對話內容，`Alt+V` 再包裝這些暫存內容時，也會一起把雜訊帶進 Cursor prompt。

### v1.17 修正

```text
1. Alt+S 優先使用 structured transcript，不再因為 generic text 比較長就改抓整頁。
2. ChatGPT 使用 data-message-author-role 抓 user / assistant 對話。
3. generic fallback 會移除 sidebar、nav、header、footer、composer、AI Prompt Bridge 面板。
4. Alt+S 不再自動加 # Full Session Export / Source / Captured_At / URL header。
5. Alt+V 預設不再注入 Source / Captured_At / URL。
6. Project Context 只有在手動選擇具體 preset 時才會注入。
7. Auto Detect 不再掃描整個 body，避免被 AI Prompt Bridge 面板文字誤判成 Python GUI / Media Tool。
8. Alt+V prompt 縮短，只保留必要 Cursor 修正要求。
```

### 快捷鍵保持不變

```text
Alt+S：完整 session 原始純文字
Alt+V：把暫存內容轉成 Cursor Fix Prompt
Alt+N：完整 session → OneNote / Word 富文本
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
```

---

## v1.17 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: clean noisy session and cursor prompts" -m "- Make Alt+S prefer structured transcripts instead of longer generic page text.
- Remove sidebar, navigation, composer, and AI Prompt Bridge panel text from fallback session exports.
- Stop adding export metadata headers to raw Alt+S session copies.
- Keep Project Context out of prompts unless a concrete preset is manually selected.
- Simplify Alt+V Cursor Fix prompt to avoid unnecessary Source, URL, and auto-detected project text."
```

---

## v1.18：修正 Alt+N / Alt+W 混淆與全 Session 提示

v1.18 針對「按 Alt+N 卻只看到 125 字」這類混淆做修正。

### 問題原因

`Alt+W` 是單段 / 選取內容富文本複製。
`Alt+N` 才是完整 session 富文本複製。

舊版 toast 都寫「OneNote 富文本」，看起來很像同一個功能，因此容易誤判到底觸發了 Alt+W 還是 Alt+N。

### v1.18 修正

```text
1. Alt+W toast 改成：Alt+W 單段已複製到 OneNote / Word
2. Alt+N toast 改成：Alt+N 全 Session 已複製到 OneNote / Word
3. Alt+N 會顯示訊息數與字數，例如：8 則 / 3200 字
4. Alt+N 強制忽略目前選取文字，只抓整個 session
5. Alt+Shift+W 保留為全 session 富文本備用快捷鍵
6. keydown 改成 capture phase 並使用 stopImmediatePropagation，降低被 ChatGPT / Gemini 攔截機率
7. 面板按鈕文案改成更直覺：
   - Alt+S 全 Session 原始純文字
   - Alt+W 單段 → OneNote/Word 20pt
   - Alt+N 全 Session → OneNote/Word 20pt
```

### 正確快捷鍵定義

```text
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
Alt+N：整個已載入 session → OneNote / Word 富文本
Alt+S：整個已載入 session → 原始純文字
```

### 如果 Alt+N 顯示只抓到 1 則

代表目前頁面 DOM 只載入了一則訊息，請先往上捲動讓舊訊息載入，再按 Alt+N。

---

## v1.18 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: clarify Alt+N full-session export" -m "- Make Alt+N full-session rich export ignore current text selection.
- Add message count and character count to full-session OneNote / Word export toast.
- Make Alt+W toast clearly identify single-answer rich copy.
- Update panel labels to distinguish raw session, single-answer rich copy, and full-session rich copy.
- Improve shortcut reliability with capture-phase keydown and stopImmediatePropagation.
- Update README with v1.18 shortcut behavior and troubleshooting notes."
```

---

## v1.19：修正 ChatGPT 新版版面 Alt+W 找不到 AI 回答

v1.19 修正新版 ChatGPT / 專案頁面中，按 `Alt+W` 出現：

```text
沒有找到可複製的 AI 回答。請先選取內容，或確認目前頁面有 AI 回覆。
```

### 問題原因

ChatGPT 的 DOM 版面會變動。部分頁面不一定有舊版 `.markdown`、`.agent-turn` 或 `[data-message-author-role="assistant"]` 結構，導致 `Alt+W` 找不到最新回答。

### v1.19 修正

```text
1. 增加新版 ChatGPT selector：
   - [data-testid*="conversation-turn"]
   - [data-testid*="assistant"]
   - [class*="group/conversation-turn"]
   - article
   - main article
   - main [class*="markdown"]
   - main [class*="prose"]

2. Alt+W 加入 visible content fallback。
3. fallback 會排除 sidebar、composer、AI Prompt Bridge 面板、輸入框與導覽列。
4. Alt+C 若 getLastAnswer 失敗，也會改用同一套 visible fallback。
5. 錯誤提示改成建議使用手動選取，或 Alt+S / Alt+N 複製整個 session。
```

### 使用建議

```text
Alt+W：複製目前最新可見 AI 回答或手動選取內容
Alt+S：複製完整 session 原始純文字
Alt+N：複製完整 session 到 OneNote / Word
```

如果 `Alt+W` 在特殊頁面仍抓不到，請直接框選要保存的段落再按 `Alt+W`。

---

## v1.19 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: improve ChatGPT answer detection for rich copy" -m "- Add robust ChatGPT selectors for newer conversation layouts.
- Add visible-content fallback for Alt+W when standard answer selectors miss.
- Exclude sidebar, composer, navigation, and AI Prompt Bridge panel from fallback extraction.
- Let Alt+C reuse the latest-answer fallback when normal text extraction fails.
- Update README with v1.19 troubleshooting notes for Alt+W."
```

---

## v1.20：修正 Alt+W 誤觸發全 Session

v1.20 修正 `Alt+W` 有時被判定成 `Alt+Shift+W`，導致變成完整 session 複製的問題。

### 問題原因

`Alt+N` 已經是正式的完整 session → OneNote / Word 富文本快捷鍵。
`Alt+Shift+W` 原本只是保留相容用的備用快捷鍵，但在部分瀏覽器 / 鍵盤狀態 / 輸入法情境下，可能造成使用者按 `Alt+W` 時誤以為觸發到完整 session 匯出。

### v1.20 修正

```text
1. Alt+W：固定為單段 / 選取內容 → OneNote / Word 富文本
2. Alt+Shift+W：也改成單段 / 選取內容 → OneNote / Word 富文本
3. 完整 session 富文本只使用 Alt+N
4. 面板保留一個「全 Session → OneNote/Word 備用按鈕」，但不再綁 Alt+Shift+W
```

### 最新快捷鍵定義

```text
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
Alt+Shift+W：同 Alt+W，避免誤觸變完整 session
Alt+N：完整 session → OneNote / Word 富文本
Alt+S：完整 session → 原始純文字
```

---

## v1.20 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: prevent Alt+W from triggering full-session export" -m "- Make Alt+W always perform single-answer rich text copy.
- Change Alt+Shift+W to the same single-answer rich copy behavior to avoid accidental full-session export.
- Keep Alt+N as the only keyboard shortcut for full-session OneNote / Word rich-text export.
- Keep a panel-only fallback button for full-session rich export.
- Update README with v1.20 shortcut behavior."
```

---

## v1.21：修正 Alt+W 仍複製整個 Session

v1.21 針對 `Alt+W` 仍然抓到整個 session 的問題做強化修正。

### 問題原因

v1.20 已經移除 `Alt+Shift+W` 的完整 session 快捷鍵，但 `Alt+W` 的「自動抓最新回答」仍可能選到過大的 ChatGPT 容器，例如：

```text
main
article 外層容器
conversation-turn 外層容器
包含多個 [data-message-author-role] 的父層
```

這些容器看起來像一段回答，但實際上可能包住整個 session。

### v1.21 修正

```text
1. Alt+W 不再使用 main / article / conversation root 當優先候選。
2. Alt+W 會拒絕包含多個 [data-message-author-role] 的容器。
3. Alt+W 會拒絕過大的 root / main / body 類容器。
4. Alt+W fallback 改成 single-answer fallback，不再用全頁 div fallback。
5. 如果候選內容像完整 session，Alt+W 會停止並提醒：
   - 手動框選單段後再按 Alt+W
   - 完整 session 請用 Alt+N
```

### 最新定義

```text
Alt+W：只允許單段 / 選取內容
Alt+N：完整 session → OneNote / Word
Alt+S：完整 session → 原始純文字
```

### 使用建議

如果自動偵測仍不準，請直接用滑鼠框選紅圈段落，再按 `Alt+W`。
手動選取永遠是最高優先。

---

## v1.21 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: prevent Alt+W from copying whole session containers" -m "- Harden Alt+W latest-answer detection to reject whole-session containers.
- Reject body, main, root, and elements containing multiple data-message-author-role nodes for single-answer copy.
- Replace broad visible div fallback with a strict single-answer fallback.
- Stop Alt+W with a clear warning if the candidate looks like a full session.
- Keep Alt+N as the full-session OneNote / Word rich-text export shortcut."
```

---

## v1.22：修正 Alt+W / Alt+Shift+W 找不到單段內容

v1.22 修正 `Alt+W` / `Alt+Shift+W` 在新版 ChatGPT 頁面中出現：

```text
沒有找到可複製的 AI 回答
```

或因為過度保守而抓不到目前可見回答的問題。

### 問題原因

v1.21 為了避免 `Alt+W` 誤抓整個 session，把 root / main / 外層 conversation container 都擋掉。
這雖然避免了全 session 誤複製，但在新版 ChatGPT DOM 中，有些回答沒有穩定的 `.markdown` / `.prose` 單段節點，因此會抓不到。

### v1.22 修正

```text
1. Alt+W 保持「只複製單段」原則。
2. Alt+Shift+W 同 Alt+W，也只複製單段。
3. 新增 safe visible-text fallback：
   - 只抓目前螢幕可見的 p / li / h1-h4 / blockquote / pre / table
   - 排除 sidebar、composer、AI Prompt Bridge 面板、輸入框與導覽列
   - 限制最大文字量，避免複製整個 session
4. 若標準 selector 找不到回答，Alt+W 會改抓目前 viewport 內的可見回答文字。
5. 手動框選仍是最高優先。
```

### 最新快捷鍵

```text
Alt+W：單段 / 選取內容 → OneNote / Word 富文本
Alt+Shift+W：同 Alt+W，單段 / 選取內容
Alt+N：完整 session → OneNote / Word 富文本
Alt+S：完整 session → 原始純文字
```

---

## v1.22 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: add safe visible fallback for Alt+W" -m "- Keep Alt+W and Alt+Shift+W as single-answer rich copy only.
- Add a safe visible-text fallback for newer ChatGPT layouts where standard answer selectors miss.
- Collect only visible viewport text blocks and exclude sidebar, composer, navigation, and bridge UI.
- Cap fallback text length to prevent whole-session copying.
- Update README with v1.22 Alt+W fallback behavior."
```

---

## v1.23：完整修復 Alt+W / Alt+Shift+W / Alt+N 匯出異常

v1.23 是針對 v1.19～v1.22 的完整收斂修正版，不再用過寬的全頁 fallback。

### 修正問題

```text
1. Alt+W / Alt+Shift+W 不應複製整個 session。
2. Alt+W 不應抓到畫面上方舊回答或無意義範例文字。
3. Alt+W 應從目前可見回答區塊的第一段有效文字開始，例如：
   「這組圖的核心不是『上班沒用』，而是...」
4. Alt+N 不應輸出只有：
   ## 1. message
   ## 2. message
   但沒有內容的空白 session。
```

### v1.23 行為定義

```text
Alt+W：
- 有手動選取：只複製手動選取內容。
- 沒有手動選取：複製目前螢幕可見的最新 AI 回答段落。
- 不再抓 main/body/root/container。
- 不再複製整個 session。

Alt+Shift+W：
- 與 Alt+W 相同。
- 不再作為 full-session shortcut。

Alt+N：
- 完整 session → OneNote / Word 富文本。
- 改用 raw transcript 重建富文本，避免 DOM clone 後只剩 message 標題、內容空白。

Alt+S：
- 保持完整 session 原始純文字。
```

### 實作重點

```text
1. 新增 getCurrentVisibleAssistantContainer()：
   只找目前 viewport 內最接近輸入框的 AI 回答容器。

2. 新增 buildVisibleTextSegmentFromContainer()：
   從目前 AI 回答容器內，抓第一個可見有效文字段落開始往下整理。

3. 新增 textToRichBlock() / createTranscriptBlockFromText()：
   Alt+N 直接用 raw transcript 重建 HTML 富文本，避免空白 message。

4. 保留手動框選最高優先：
   想精準複製某一段，滑鼠框選後按 Alt+W。
```

---

## v1.23 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: stabilize rich copy and full-session export" -m "- Rebuild Alt+W and Alt+Shift+W to copy only the current visible AI answer segment.
- Avoid broad page, root, main, and whole-session fallbacks for single-answer rich copy.
- Start Alt+W export from the first visible meaningful text block in the current answer.
- Rebuild Alt+N rich full-session export from the raw transcript to prevent blank message sections.
- Keep Alt+S raw full-session export and other prompt workflows unchanged.
- Update README with v1.23 behavior and troubleshooting notes."
```

---

## v1.24：修正 Alt+W / Alt+Shift+W 仍抓到雜訊與錯段問題

v1.24 針對實測影片中的問題修正：

```text
1. Alt+W / Alt+Shift+W 不應出現 Visible AI Answer 標題。
2. Alt+W / Alt+Shift+W 不應複製「純文字」、「ChatGPT 說」、「複製 / 編輯 / 分享」等 UI 或輔助文字。
3. Alt+W / Alt+Shift+W 不應抓到畫面上方舊片段。
4. Alt+W / Alt+Shift+W 應只複製目前可見的 AI 回答正文。
```

### v1.24 行為

```text
Alt+W：
- 有手動選取：只複製選取內容。
- 沒有選取：只抓目前畫面可見的 AI 回答正文。
- 不再使用 getLatestAnswerElement 的全頁 fallback。
- 不再輸出 Visible AI Answer 標題。

Alt+Shift+W：
- 與 Alt+W 完全相同。
- 不再是 full-session 功能。

Alt+N：
- 維持完整 session → OneNote / Word。
- 繼續使用 raw transcript 重建 HTML，降低空白 message 風險。
```

### v1.24 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: remove noisy labels from rich copy" -m "- Make Alt+W and Alt+Shift+W copy only the current visible assistant body.
- Remove Visible AI Answer, ChatGPT 說, 純文字, and utility UI labels from rich-copy output.
- Stop Alt+W from using broad latest-answer fallback when no safe current answer is detected.
- Prefer primary markdown/prose content roots inside assistant messages.
- Keep Alt+N full-session rich export and Alt+S raw export behavior unchanged."
```

---

## v1.25：Alt+W 改為複製「最新 AI 回答整段」

v1.25 重新定義並修正 `Alt+W` / `Alt+Shift+W`：

```text
Alt+W 不是只複製目前 viewport 看到的幾個段落。
Alt+W 應該複製最新一則 assistant 回答的完整內容。
```

### 最新定義

```text
Alt+W：
- 有手動選取：複製手動選取內容。
- 沒有手動選取：複製最新一則 AI 回答整段內容。
- 輸出 Word / OneNote 可貼上的富文本。
- 不應複製整個 session。
- 不應插入 Visible AI Answer / ChatGPT 說 / 純文字 等雜訊標題。

Alt+Shift+W：
- 同 Alt+W。

Alt+N：
- 完整 session → Word / OneNote 富文本。

Alt+S：
- 完整 session → 原始純文字。
```

### v1.25 修正內容

```text
1. 新增 getLatestAssistantAnswerContainer()：
   找出最新一則 assistant 回答，而不是目前可見片段。

2. 新增 buildFullSingleAnswerElement()：
   從最新 assistant 回答內抓主要 markdown/prose 內容，完整複製該回答。

3. Alt+W 不再使用 viewport-only visible segment 作為主要來源。

4. Alt+W 仍保留手動選取最高優先。
```

---

## v1.25 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: make Alt+W copy latest full answer" -m "- Redefine Alt+W and Alt+Shift+W to copy the latest assistant answer as a full single answer.
- Keep manual selection as the highest priority for Alt+W.
- Add latest assistant answer detection and primary content extraction.
- Avoid copying full sessions or viewport-only partial snippets for Alt+W.
- Keep Alt+N as the full-session Word / OneNote rich export shortcut."
```

---

## v1.26：修正新版 ChatGPT 沒有穩定 assistant marker 時 Alt+W 找不到最新回答

v1.26 修正 `Alt+W` 出現：

```text
Alt+W 沒有找到最新 AI 回答
```

的問題。

### 問題原因

部分 ChatGPT / Project / GPT 頁面沒有穩定的：

```text
[data-message-author-role="assistant"]
.markdown
.prose
```

或這些標記不在目前可讀內容的外層，導致 v1.25 找不到最新 assistant answer。

### v1.26 修正

```text
1. Alt+W 仍以「最新一則 AI 回答整段」為目標。
2. 優先使用 assistant marker / markdown / prose。
3. 若標準偵測失敗，改用 readable-block fallback：
   - 從 main 內找可見的 p / li / h1-h4 / blockquote / table / pre
   - 排除 sidebar / composer / buttons / AI Prompt Bridge panel
   - 從靠近輸入框的最新可讀內容往上合併
   - 避免抓整個 session
4. 手動框選仍是最高優先。
```

### 最新定義

```text
Alt+W：最新 AI 回答整段 → Word / OneNote
Alt+Shift+W：同 Alt+W
Alt+N：完整 session → Word / OneNote
Alt+S：完整 session → 原始純文字
```

---

## v1.26 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: add readable fallback for Alt+W latest answer" -m "- Keep Alt+W and Alt+Shift+W as latest full assistant answer copy.
- Add readable-block fallback for ChatGPT layouts without stable assistant markers.
- Build latest answer content from visible readable blocks near the composer when standard selectors fail.
- Exclude sidebar, composer, buttons, and bridge UI from fallback extraction.
- Keep Alt+N as the full-session Word / OneNote rich export shortcut."
```

---

## v1.27：Office Export Clean Format 版

v1.27 針對 Word / OneNote 富文本輸出做收斂修正。

### 修正問題

```text
1. Alt+N 複製整個 session 到 OneNote / Word 時，格式不能跑掉。
2. Alt+N 不應再輸出 AI Session Export / Source / Captured At / URL / Messages 這些 metadata。
3. Alt+N / Alt+W 不應帶入「純文字」、「啟用自動換行」、「ChatGPT 說」、「Visible AI Answer」等無用贅字。
4. Alt+N 不應變成一整串沒有段落的文字。
5. Alt+W 仍維持複製最新一則 AI 回答整段內容。
```

### v1.27 行為定義

```text
Alt+W：
- 有手動選取：複製手動選取內容。
- 沒有手動選取：複製最新一則 AI 回答整段內容。
- 輸出 Word / OneNote 富文本。
- 套用同一套 Office 清理邏輯。

Alt+Shift+W：
- 同 Alt+W。

Alt+N：
- 完整 session → Word / OneNote 富文本。
- 保留段落、標題、清單、引用結構。
- 移除 metadata 與 UI 贅字。

Alt+S：
- 完整 session → 原始純文字。
```

### 已清理的常見贅字

```text
Visible AI Answer
AI Answer
ChatGPT 說
純文字
啟用自動換行
複製
編輯
分享
更多
資料來源
ChatGPT 可能會出錯。請查證重要資訊。
```

---

## v1.27 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: clean Word and OneNote rich exports" -m "- Clean Alt+N full-session rich export for Word and OneNote.
- Remove AI Session Export metadata headers from Alt+N output.
- Preserve paragraphs, headings, lists, and blockquotes in Office rich text.
- Filter noisy UI labels such as 純文字, 啟用自動換行, ChatGPT 說, and Visible AI Answer.
- Apply the same Office cleanup to Alt+W latest-answer rich copy.
- Keep Alt+S raw full-session export behavior unchanged."
```

---

## v1.28：Alt+N 全 Session 可讀排版修正版

v1.28 針對 Alt+N 貼到 OneNote / Word 後排版混亂、只抓到一則、或整段擠成一大段的問題修正。

### 修正問題

```text
1. Alt+N 不應只抓到 1. message。
2. Alt+N 應盡量抓整個已載入 session。
3. Alt+N 貼到 OneNote / Word 應保持可讀段落，不應橫向爆版。
4. Alt+N 不應帶入：
   - 正在載入較早的訊息
   - 純文字
   - 啟用自動換行
   - ChatGPT 說
   - 你說
   - ChatGPT 可能會出錯
5. Alt+W / Alt+Shift+W 不改功能，仍是最新回答整段。
```

### v1.28 實作

```text
1. 新增 getFullSessionBlocks()：
   優先讀取 [data-message-author-role]，若不足則解析 main.innerText。

2. 新增 parseRoleBlocksFromText()：
   可解析 ChatGPT 頁面中「你說：」「ChatGPT 說：」混在一起的原始文字。

3. Alt+N 改成 role blocks → Office HTML：
   讓每則 user / assistant message 成為獨立 section。

4. OneNote / Word 外層容器固定：
   max-width: 980px
   font-size: 20pt
   line-height: 1.55
   white-space: normal
```

### 快捷鍵

```text
Alt+W：最新 AI 回答整段 → Word / OneNote
Alt+Shift+W：同 Alt+W
Alt+N：完整已載入 session → Word / OneNote
Alt+S：完整已載入 session → 原始純文字
```

---

## v1.28 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: improve Alt+N full-session Office export layout" -m "- Improve Alt+N full-session extraction with role-based DOM and text parsing.
- Parse ChatGPT raw transcript markers such as 你說 and ChatGPT 說 when DOM role nodes are unavailable.
- Keep each user and assistant message as a readable Office section.
- Remove loading text, code-block labels, auto-wrap labels, and ChatGPT footer noise from exports.
- Constrain Office HTML width and paragraph layout for better OneNote and Word readability.
- Keep Alt+W and Alt+Shift+W latest-answer behavior unchanged."
```

---

## v1.29：Alt+N 保留 ChatGPT 版面排版

v1.29 針對 Alt+N 貼到 OneNote / Word 後「不像 ChatGPT、字太大、橫向爆版、出現 1. User / 2. Assistant」的問題修正。

### 修正重點

```text
1. Alt+N 優先使用每則訊息的原始 DOM rich content。
2. 不再把整個 session 先轉成純文字再重建。
3. 不再輸出 1. User / 2. Assistant 這種人工大標題。
4. 保留 ChatGPT 原本的段落、粗體、清單、引用、表格與 code block 結構。
5. 加上 Office 安全樣式：
   - max-width: 980px
   - white-space: normal
   - word-break: break-word
   - overflow-wrap: anywhere
   避免貼到 OneNote 後橫向爆版。
6. Alt+W 維持原本正常邏輯，不改行為。
```

### 快捷鍵

```text
Alt+W：最新 AI 回答整段 → Word / OneNote
Alt+Shift+W：同 Alt+W
Alt+N：完整已載入 session → Word / OneNote，保留 ChatGPT-like 排版
Alt+S：完整已載入 session → 原始純文字
```

---

## v1.29 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve ChatGPT layout in Alt+N Office export" -m "- Make Alt+N full-session rich export preserve each message DOM instead of rebuilding oversized plain text.
- Remove artificial numbered User and Assistant headings from Alt+N rich output.
- Keep ChatGPT-like paragraphs, lists, blockquotes, tables, and code blocks when copying to OneNote or Word.
- Add Office-safe width, wrapping, and word-break styles to prevent horizontal overflow.
- Keep Alt+W and Alt+Shift+W latest-answer rich copy behavior unchanged."
```

---

## v1.30：Alt+N 強制 DOM Rich Export 修正版

v1.30 針對 Alt+N 貼到 OneNote / Word 仍然變成純文字、出現 User / Assistant、段落擠在一起的問題修正。

### 問題原因

部分 ChatGPT 頁面沒有穩定的 `[data-message-author-role]`，v1.29 會退回文字解析模式。
文字解析模式只能拿到 plain text，因此會失去 ChatGPT 原本的清單縮排、粗體、段落與引用排版。

### v1.30 修正

```text
1. Alt+N 不再只依賴 [data-message-author-role]。
2. 新增 DOM rich candidates：
   - article
   - [data-testid*="conversation-turn"]
   - [data-testid*="message"]
   - [class*="conversation-turn"]
3. 每則訊息優先複製其 markdown / prose / rich content root。
4. 只有完全抓不到 DOM 訊息時才退回 plain text。
5. 移除 text fallback 裡的人工 User / Assistant 標題。
6. Alt+W / Alt+Shift+W 不改行為。
```

### 驗收標準

```text
Alt+N 貼到 OneNote / Word：
- 不應出現 User / Assistant 人工標題
- 不應整篇變成一大段純文字
- 應保留 ChatGPT 的清單、粗體、段落、引用
- 不應橫向爆版
```

---

## v1.30 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: force DOM-rich Alt+N session export" -m "- Add DOM-rich message candidate extraction for ChatGPT layouts without stable role markers.
- Preserve markdown and prose content roots for Alt+N full-session Office export.
- Avoid plain-text User and Assistant fallback when rich DOM messages are available.
- Remove artificial fallback role labels from Alt+N output.
- Keep Alt+W and Alt+Shift+W latest-answer rich copy behavior unchanged."
```

---

## v1.31：Alt+N 改成「全 Session 版 Alt+W」

v1.31 針對 Alt+N 仍然把內容變成純文字、User 問題消失或混在同一段的問題做收斂修正。

### 核心定義

```text
Alt+W：複製最新一則 AI 回答整段 rich DOM。
Alt+N：複製目前已載入 session 內每一則 user / assistant 訊息的 rich DOM。
```

也就是：Alt+N 是「全 session 版 Alt+W」，不是再把整頁文字 parse 成純文字。

### v1.31 修正重點

```text
1. Alt+N 優先收集所有已載入的 [data-message-author-role] 訊息。
2. 每一則 user / assistant 都用 Alt+W 類似方式 clone rich DOM。
3. User 問題會以 ChatGPT-like 右側淺藍 bubble 保留，不再消失。
4. Assistant 回答保留原本段落、粗體、清單、表格、引用與 code block。
5. 只有完全抓不到 rich DOM 時才退回文字 fallback。
6. Alt+W / Alt+Shift+W 不改行為。
```

### 驗收標準

```text
Alt+N 貼到 OneNote / Word：
- 需要看到 user 問句
- 需要看到 assistant 回答
- 不應出現人工 User / Assistant 大標題
- 不應全部變成一大段純文字
- 排版要接近 ChatGPT 畫面
```

---

## v1.31 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: make Alt+N a full-session rich copy" -m "- Treat Alt+N as the full-session version of Alt+W.
- Clone each loaded user and assistant message as rich DOM instead of parsing the whole page as plain text.
- Preserve user prompts as ChatGPT-like right-side bubbles in Word and OneNote exports.
- Preserve assistant paragraphs, bold text, lists, tables, blockquotes, and code blocks.
- Keep Alt+W and Alt+Shift+W latest-answer rich copy behavior unchanged."
```

---

## v1.32：Alt+N 固定輸出 User + ChatGPT 對話版

v1.32 針對 Alt+N 仍然變成一大段、User 問句不見、或 assistant 排版消失的問題做收斂修正。

### 這版的固定規則

```text
Alt+N = 全 session 版 Alt+W
但不再 clone broad conversation container。
```

### 修正重點

```text
1. Alt+N 優先讀官方 [data-message-author-role]：
   - user 保留成 ChatGPT-like 淺藍 bubble
   - assistant 保留 rich DOM 排版

2. 如果官方 role DOM 不存在：
   - 改解析目前 main.innerText
   - 用「你說：」「ChatGPT 說：」切成 user / assistant
   - 保留換行、標題、清單、縮排，不再全部 normalize 成一段

3. 禁止再 clone broad conversation container：
   - 這是之前變成一大坨純文字的原因。

4. Alt+W / Alt+Shift+W 不改。
```

### 驗收標準

```text
Alt+N 貼到 OneNote / Word：
- 必須看到 user 問句，例如：
  「蛋白質 要吃什麼 像蜂蜜這樣 便宜 方便又健康」
- 接著看到 ChatGPT 回答。
- Assistant 的清單、粗體、段落盡量接近 ChatGPT 畫面。
- 不應只剩一大段文字。
```

---

## v1.32 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: export Alt+N as user assistant chat blocks" -m "- Make Alt+N export loaded sessions as user and assistant chat blocks.
- Prefer official data-message-author-role DOM for accurate user prompts and assistant rich layout.
- Preserve multiline text structure when falling back to raw transcript parsing.
- Stop cloning broad conversation containers that caused one giant plain-text block.
- Keep Alt+W and Alt+Shift+W latest-answer rich copy behavior unchanged."
```

---

## v1.33：Alt+N 修正缺失 content root 與 bubble 樣式被清掉

v1.33 針對 v1.32 仍然排版混亂的問題修正。

### 根因

```text
1. v1.32 呼叫 getMessageContentRoot()，但該 helper 沒有穩定定義在最終檔案裡，會導致 Alt+N 走錯 fallback。
2. Alt+N 建好 user bubble 後，又對整個 transcript 做 cleanOfficeExportElement()，會把 bubble / message 樣式洗掉。
3. user prompt 不應 clone broad wrapper，應直接用乾淨文字建立右側 bubble。
```

### v1.33 修正

```text
1. 新增穩定 getMessageContentRoot()。
2. Alt+N 每則 assistant 優先抓 markdown/prose rich root。
3. Alt+N user prompt 改用乾淨文字建立 ChatGPT-like bubble。
4. 移除 transcript-level cleanOfficeExportElement()，避免 user bubble 樣式被清掉。
5. Alt+W / Alt+Shift+W 不改。
```

### 驗收

```text
Alt+N 貼到 OneNote / Word 應看到：
- user 問句在淺藍 bubble
- assistant 回答保留清單 / 粗體 / 段落
- 不應是一整坨純文字
```

---

## v1.33 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve Alt+N chat layout and user prompts" -m "- Add stable getMessageContentRoot helper for Alt+N session export.
- Build user prompts as clean ChatGPT-like bubbles instead of cloning broad wrappers.
- Preserve assistant markdown and prose roots for rich Office output.
- Avoid transcript-level cleanup that stripped bubble and message layout styles.
- Keep Alt+W and Alt+Shift+W latest-answer behavior unchanged."
```

---

## v1.34：Alt+N Structured DOM 排版修正版

v1.34 針對 Alt+N 貼到 OneNote / Word 後仍然像純文字一大段的問題修正。

### 核心原則

```text
Alt+W：複製最新 assistant rich DOM。
Alt+N：對每一則已載入 user / assistant 訊息做同樣的 rich DOM 複製。
```

### v1.34 修正

```text
1. 如果 [data-message-author-role] 可用：
   使用官方 user / assistant DOM。

2. 如果官方 role DOM 不可用：
   不再直接 parse main.innerText。
   改抓 main 裡的 structured DOM blocks：
   - p
   - ol / ul
   - blockquote
   - table
   - pre
   - h1~h4

3. 依照位置與 user bubble 特徵分成 user / assistant。
4. 保留 assistant 的清單、粗體、段落、引用、表格、code block。
5. raw text parser 只作最後 fallback。
6. Alt+W / Alt+Shift+W 不改。
```

### 驗收標準

```text
Alt+N 貼到 OneNote / Word：
- user 問句要保留
- assistant 清單要保留縮排
- 不應全部變成一大段文字
- 排版要接近 Alt+W 的輸出
```

---

## v1.34 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve structured DOM layout in Alt+N" -m "- Add structured DOM fallback for Alt+N full-session Office export.
- Preserve paragraph, list, blockquote, table, and code block nodes when role DOM is unavailable.
- Infer user bubbles and assistant blocks from layout instead of flattening main.innerText.
- Keep raw text parsing only as the last fallback.
- Keep Alt+W and Alt+Shift+W latest-answer behavior unchanged."
```

---

## v1.35：Alt+W 不再只複製 code block / 小片段

v1.35 修正 `Alt+W` 只複製到 28 個字的問題。

### 問題原因

新版 ChatGPT 頁面中，最新版回答的最下方可能是 code block、短段落或 list item。舊邏輯會把這個最下方小節點當成「最新回答」，所以只複製到很短的片段。

### 修正

```text
1. Alt+W selector 如果命中 pre / code / p / li / markdown fragment，
   會先往上找到完整 assistant turn。

2. 再從 assistant turn 裡選主要 markdown / prose content root。

3. 若候選內容太短，會再次往上找完整回答容器。

4. Alt+N 不改核心邏輯。
```

---

## v1.35 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: expand Alt+W from fragment to full answer" -m "- Make Alt+W climb from code blocks, paragraphs, and markdown fragments to the full assistant turn.
- Select the main markdown or prose root from the latest assistant answer.
- Add a safety fallback to avoid copying tiny answer fragments.
- Keep Alt+N full-session structured DOM export behavior unchanged."
```

---

## v1.36：Alt+W 改用 Alt+N 的 structured DOM 分組

v1.36 修正 v1.35 仍然只複製最新回答尾端小片段的問題。

### 問題原因

只往上找 assistant turn 還不夠。某些 ChatGPT 專案頁面中，最新回答是由多個段落 / code block / p / ul / ol 分散組成，單一 markdown root 不一定包住全部內容。

### 修正

```text
1. ChatGPT 的 Alt+W 先呼叫 Alt+N 已有的 collectStructuredDomTranscriptBlocks()。
2. 從 structured blocks 裡取最後一個 assistant block。
3. 直接複製該 assistant block 的 DOM 結構。
4. 不再用最底部 pre / code / p 當最新回答。
5. Alt+N 不改核心邏輯。
```

### 驗收

```text
Alt+W：
- 應複製最新一則完整 assistant 回答。
- 不應只複製 28 / 118 字。
- code block 前後的說明文字都應保留。
```

---

## v1.36 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: use structured assistant block for Alt+W" -m "- Make ChatGPT Alt+W reuse the structured DOM grouping used by Alt+N.
- Copy the latest assistant block instead of the lowest visible code block or paragraph.
- Preserve code block context and surrounding explanation text.
- Keep Alt+N structured DOM full-session behavior unchanged."
```

---

## v1.37：Alt+W 合併最新回答的所有 assistant structured blocks

v1.37 修正 `Alt+W` 仍然只複製最新回答尾端 118 字的問題。

### 根因

v1.36 雖然改用 structured DOM，但仍然只取「最後一個 assistant block」。
如果一則 ChatGPT 回答內有：

```text
段落
code block
段落
code block
最後補充段落
```

它可能被切成多個 structured blocks，導致 Alt+W 只複製最後補充段落。

### 修正

```text
1. Alt+W 不再只取最後一個 assistant block。
2. Alt+W 會找最新 user 問句之後的所有 assistant blocks。
3. 若 user bubble 偵測失敗，則合併尾端連續 assistant blocks。
4. collectStructuredDomTranscriptBlocks 不再用 vertical gap 切 assistant 回答。
5. Alt+N 保持 structured DOM 行為。
```

### 驗收

```text
Alt+W：
- 應複製最新 ChatGPT 回答整段。
- code block 前後說明都要保留。
- 不應只複製 118 字或最後一小段。
```

---

## v1.37 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: merge latest assistant blocks for Alt+W" -m "- Make Alt+W copy all assistant structured blocks after the latest user prompt.
- Merge trailing assistant blocks when user bubble detection is unavailable.
- Stop splitting assistant answers by vertical gap in structured DOM extraction.
- Preserve code block context and surrounding explanation text.
- Keep Alt+N structured DOM export behavior unchanged."
```

---

## v1.38：Alt+W 只複製最新 assistant 回答，不再混入前面 session

v1.38 修正 v1.37 把多個舊 assistant blocks 合併進 Alt+W 的問題。

### 正確定義

```text
Alt+W：只複製最新一則 assistant 回答。
Alt+N：複製完整已載入 session。
```

### 問題原因

v1.37 為了避免只複製最後 118 字，改成「合併最新 user 之後的 assistant blocks」。
但在某些 ChatGPT 專案頁面，user bubble 偵測失敗時，會錯把前面多個 assistant blocks 一起合併，導致 Alt+W 變得像 Alt+N。

### v1.38 修正

```text
1. Alt+W 優先使用官方 [data-message-author-role="assistant"] 的最後一則。
2. 若官方 role 不存在，才使用最新 user bubble 的下緣作為邊界。
3. 只抓該 user bubble 之後的 assistant 結構化 DOM。
4. 如果連 user bubble 都抓不到，最後 fallback 只取最新一個 assistant block。
5. Alt+N 不改，仍然是完整 session。
```

### 驗收

```text
Alt+W：
- 只複製最新 ChatGPT 回答。
- 不應包含上一輪回答。
- 不應變成完整 session。
- 不應只剩最後 118 字。

Alt+N：
- 才是完整 session。
```

---

## v1.38 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: keep Alt+W limited to latest answer" -m "- Keep Alt+W scoped to the latest assistant answer only.
- Prefer the latest official assistant role node when available.
- Use latest user bubble boundary only as a fallback for structured DOM extraction.
- Avoid merging old trailing assistant blocks into Alt+W output.
- Keep Alt+N as the full-session export behavior."
```

---

## v1.39：Alt+W 固定用「最新 user 後方回答」作為主路徑

v1.39 修正 v1.38 又退回只複製最後一小段的問題。

### 根因

v1.38 雖然加入 user boundary fallback，但實際執行順序仍然優先使用官方 assistant role。
在部分 ChatGPT Project 頁面，官方 assistant role 的 content root 會解析成最後一個 paragraph，導致 Alt+W 又只複製 121 字。

### v1.39 修正

```text
1. Alt+W 主路徑改成：
   最新 user bubble 下緣
   ↓
   抓它後方的 p / ol / ul / blockquote / table / pre / h1~h4
   ↓
   組成最新 assistant 回答

2. 官方 assistant role 只當 fallback。
3. fallback 時 clone 整個 assistant turn，不再猜內層 content root。
4. 若有下一個 user bubble，Alt+W 會在下一個 user bubble 前停止。
5. Alt+N 不改。
```

### 定義

```text
Alt+W：最新 user 問句之後的最新 assistant 回答。
Alt+N：完整 session。
```

---

## v1.39 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: make Alt+W use latest user boundary first" -m "- Make Alt+W use the latest user bubble boundary as the primary extraction path.
- Extract structured assistant content after the latest user prompt.
- Stop extraction before the next user bubble when present.
- Use official assistant role nodes only as fallback and clone the whole turn.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.40：Alt+W Strict Range Extractor

v1.40 修正 Alt+W 一直退回只複製最後 121 字的問題。

### 核心修正

```text
Alt+W 不再優先使用 official assistant role。
Alt+W 主路徑固定為 strict range：

最新 user prompt bubble 底部
↓
下一個 user bubble 或 composer 之前
↓
收集中間的 p / ol / ul / blockquote / table / pre / h1~h4
↓
組成最新 assistant 回答
```

### 為什麼這版不同

前幾版一直在 assistant role / markdown root / block 合併之間切換，容易遇到 ChatGPT Project DOM 變形後只抓到最後一段。

v1.40 改成直接用「最新 user 問句」當錨點，抓它後面的回答區間，所以不應再只抓到最後 121 字，也不應抓成完整 session。

### 定義

```text
Alt+W：最新 user 問句後方的 assistant 回答。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.40 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: use strict range extraction for Alt+W" -m "- Make Alt+W extract the range between the latest user prompt and the next user prompt or composer.
- Collect structured answer nodes including paragraphs, lists, blockquotes, tables, and code blocks.
- Avoid relying on official assistant role nodes as the primary path.
- Keep official assistant and structured block extraction as fallbacks only.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.41：Alt+W Toolbar Anchor Extractor

v1.41 修正 ChatGPT Project 頁面中 Alt+W 一直只複製最後 91/121 字的問題。

### 核心改法

```text
Alt+W 主路徑改成：

最新 assistant 回答底下那排 toolbar icon
(copy / share / read aloud / regenerate / thumbs / more)
作為底部錨點

然後往上找最新 user bubble 作為頂部錨點

只複製兩者中間的 p / ol / ul / blockquote / table / pre / h1~h4。
```

這代表 Alt+W 不再猜：

```text
最後一個 assistant role
最後一個 markdown root
最後一個 paragraph
```

而是直接用 ChatGPT 畫面結構：
**最新 user 問句 → 最新回答 toolbar** 之間的內容。

### 定義

```text
Alt+W：最新回答，不是完整 session。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.41 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: use assistant toolbar anchor for Alt+W" -m "- Make Alt+W use the latest assistant toolbar as the bottom anchor.
- Use the latest user bubble before that toolbar as the top anchor.
- Copy only structured answer DOM between those two anchors.
- Avoid guessing assistant role or markdown roots as the primary path.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.42：Alt+W Clone Latest Answer Container

v1.42 修正 Alt+W 只抓到頭尾句、或只抓最後 91/121 字的問題。

### 核心定義

```text
Alt+W：複製最新 assistant 回答整段。
Alt+N：複製完整 session。
Alt+S：複製完整 session 原始純文字。
```

### v1.42 修正方式

```text
1. 找最新 assistant 回答底下的 toolbar。
2. 從 toolbar 往上找「真正包含整個回答的容器」。
3. clone 該容器。
4. 移除 toolbar / button / svg / composer 雜訊。
5. 保留 paragraph、list、blockquote、table、code block。
6. 只有 container clone 失敗時，才退回 v1.41 range extractor。
```

這版不再只用 p/ol/ul 節點拼接，也不再只取最後 paragraph。

---

## v1.42 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: clone latest answer container for Alt+W" -m "- Make Alt+W clone the latest assistant answer container anchored by its toolbar.
- Preserve the whole latest answer instead of only first or last paragraphs.
- Remove toolbar buttons, icons, and composer noise from the cloned answer.
- Keep structured range extraction as fallback only.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.43：修正 Alt+W code block / 純文字區塊貼到 OneNote 變成一行

v1.43 修正最新回答整段已抓對，但貼到 OneNote / Word 後，ChatGPT 的「純文字 / code block」區塊被壓成同一行的問題。

### 問題原因

部分 ChatGPT Project 頁面的「純文字」灰框不是標準 `<pre><code>`，而是由多個 `div/span` 加 CSS 顯示成 code block。
複製到 OneNote 時，CSS 顯示換行會遺失，所以變成：

```text
Contributor A 已訂閱 Creator X ↓ Contributor A ...
```

### v1.43 修正

```text
1. cleanRichClone() 時先偵測 ChatGPT rendered code block。
2. 將「純文字 / plaintext / code-like 灰框」轉成真正的 <pre><code>。
3. 保留 code block 內的換行、箭頭、縮排。
4. OneNote / Word 匯出時，pre/code 強制 white-space: pre-wrap。
5. 不影響 Alt+N / Alt+S / Cursor / Review 功能。
```

---

## v1.43 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve code block formatting in Alt+W exports" -m "- Convert ChatGPT rendered plaintext/code blocks into real pre/code blocks before cleanup.
- Preserve line breaks, arrows, and indentation when pasting to OneNote or Word.
- Prevent OneNote body styling from flattening code block spans.
- Keep Alt+W latest-answer container clone behavior unchanged.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.44：Alt+W 最新回答 Range Clone + code block 換行修正

v1.44 修正兩個問題：

```text
1. 第一次 Alt+W 可能抓到過多舊對話。
2. 第二次 Alt+W 範圍正確，但 code block / 純文字灰框貼到 OneNote 後變成一行。
```

### v1.44 修正方式

```text
1. Alt+W 主路徑改成真正 DOM Range clone：
   最新 user prompt / 前一個 assistant toolbar
   ↓
   最新 assistant toolbar

2. 不再優先 clone 大 container，避免抓到整個 session。

3. 在 cleanup 前先把 ChatGPT rendered code block 轉成真正 <pre><code>。

4. 若 code block 被扁平成一行，會把 ↓ / → 重新拆成換行。

5. Alt+N / Alt+S / Cursor / Review 功能不改。
```

---

## v1.44 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: stabilize Alt+W range copy and code formatting" -m "- Make Alt+W clone a DOM range from the latest user prompt or previous toolbar to the latest assistant toolbar.
- Avoid cloning oversized answer containers that can include older session content.
- Convert rendered ChatGPT plaintext/code blocks into real pre/code blocks before cleanup.
- Preserve arrow-based line breaks in copied code blocks for OneNote and Word.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.45：修正 Alt+W F5 後抓到舊 session + code block 換行仍被壓扁

v1.45 修正兩個 v1.44 仍存在的問題：

```text
1. F5 後第一次 Alt+W 可能抓到 7782 字，混入舊 session。
2. 範圍正確後，ChatGPT 的「純文字 / code block」灰框貼到 OneNote 仍被壓成一行。
```

### 根因

```text
1. F5 後 ChatGPT Project 頁面的 user bubble 可能還沒完全穩定。
   v1.44 會退回用「前一個 assistant toolbar」當起點，
   這可能把前面舊回答一起 clone 進來。

2. ChatGPT 的灰色「純文字」區塊常不是標準 <pre><code>，
   而是 div/span + CSS 偽裝成 code block。
   Detached clone 上 innerText / CSS 換行不穩，貼到 OneNote 會被壓成一行。
```

### v1.45 修正

```text
1. Alt+W range clone 必須找到最新 user bubble。
   找不到時不再用前一個 assistant toolbar 當 fallback 起點，避免抓到舊 session。

2. Alt+W 加上 12000 字 guardrail。
   超過就視為可能抓到 full session，拒絕該路徑。

3. code block 轉換時不再依賴 isConnected / CSS innerText。
   改用 DOM 子節點 walk，依 div / p / li / br / pre / code 重建換行。

4. 再把 fake code block 轉成真正 <pre><code>，
   保留 ↓ / → / 縮排 / 換行。
```

---

## v1.45 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: prevent Alt+W session leakage and preserve code lines" -m "- Require the latest user bubble for Alt+W range cloning instead of falling back to the previous toolbar.
- Add a smaller guardrail to reject oversized Alt+W ranges that look like full-session captures.
- Rebuild rendered code block text from DOM child nodes instead of relying on detached innerText.
- Convert fake ChatGPT plaintext blocks into real pre/code blocks while preserving arrows and line breaks.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.46：Alt+W 移除 user prompt 與 ChatGPT UI 贅字

v1.46 修正 Alt+W 已能抓到最新回答，但匯出內容仍混入不需要文字的問題。

### 修正問題

```text
1. Alt+W 內容開頭可能混入最新 user prompt：
   coomer 是怎讀取非訂閱內容

2. Alt+W 可能混入 ChatGPT UI 贅字：
   檢視版本
   新增至專案來源
   回應
   回應欠佳
   另外
   ChatGPT 可能會出錯。請查證重要資訊。
```

### v1.46 修正

```text
1. 新增 removeLeadingUserPromptFromAltW()
   Alt+W 匯出前移除開頭的 user bubble / prompt label。

2. 新增 removeExportNoiseNodes()
   清除 ChatGPT UI chrome / feedback / project-source buttons。

3. code block 文字 normalizer 也同步排除 UI label。

4. Alt+N / Alt+S / Cursor / Review 不改。
```

### 定義

```text
Alt+W：最新 assistant 回答整段，且不包含 user prompt / UI 贅字。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.46 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: remove UI noise from Alt+W exports" -m "- Remove accidental leading user prompt text from Alt+W latest-answer exports.
- Strip ChatGPT UI noise such as project-source, response, bad-response, version, and footer labels.
- Apply noise cleanup before Office rich-text formatting.
- Keep code block line preservation from v1.45.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.47：Alt+W 改用目前畫面最新可見 assistant toolbar

v1.47 修正 v1.46 仍可能抓到舊 session 的問題。

### 問題

F5 或 ChatGPT Project 頁面重排後，DOM 裡可能同時存在舊對話、隱藏節點、virtualized content。
前幾版用 DOM 順序找 latest toolbar，可能選到不是目前畫面上正在看的回答，導致 Alt+W 貼出舊內容，例如：

```text
今天 上午1:53
下一版我已經先做成 v5.2 Stable UI...
```

### v1.47 修正

```text
1. Alt+W 主路徑改成只找「目前 viewport 可見」的 assistant toolbar。
2. 選目前畫面中最靠近 composer 的可見 toolbar。
3. 再找該 toolbar 上方最近的可見 user bubble。
4. 只 clone 兩者中間的 DOM Range。
5. 若內容仍含舊 session 特徵，直接拒絕該路徑。
6. Alt+N / Alt+S / Cursor / Review 不改。
```

### 定義

```text
Alt+W：目前畫面最新可見 assistant 回答整段。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.47 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: anchor Alt+W to visible latest answer" -m "- Make Alt+W choose the latest visible assistant toolbar in the current viewport.
- Use the nearest visible user bubble above that toolbar as the range start.
- Clone only the visible latest answer range to avoid hidden or old session content after refresh.
- Reject ranges that still contain known stale-session markers.
- Keep Alt+N full-session behavior unchanged."
```

---

## v1.53：回到 v1.47 基準，只做 Alt+W 防呆修正

v1.53 是 rollback-safe 版本。
它不沿用 v1.51 / v1.52 的「visible user prompt → composer」路徑，因為該路徑會把 composer 草稿或舊 session 誤當成最新回答，導致 Alt+W 複製 6987 字。

### 修正原則

```text
1. 以 v1.47 為基準。
2. 移除 v1.51 / v1.52 的 first-load user-to-composer path。
3. 不改 Alt+N。
4. 不改 Alt+S。
5. 不改 Alt+V / Cursor / Review / Panel / Project Context。
6. Alt+W 若偵測到舊 session / composer 草稿，直接停止複製，不覆蓋剪貼簿。
```

### v1.53 修正

```text
1. 停用 Alt+W 的 broad container clone fallback。
   這個 fallback 在 ChatGPT Project 頁面可能抓到整個 session。

2. 新增 isBadAltWExportText()：
   若 Alt+W 候選內容含以下舊 session / composer 草稿標記，直接停止：
   - 下一版我已經先做成 v5.2 Stable UI
   - 下一版 2.coomer.su 無法使用
   - 2.coomer.su 無法使用
   - 處理時間為 11s
   - 今天 上午1:53
   - 新增至專案來源
   - 回應欠佳

3. Alt+W 超過 12000 字也停止，避免誤複製 full session。
```

### 定義

```text
Alt+W：最新 assistant 回答整段。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.53 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: rollback Alt+W to v1.47 baseline with stale-session guard" -m "- Base Alt+W behavior on v1.47 instead of the broken v1.51/v1.52 user-to-composer path.
- Disable broad container clone fallback that can capture full sessions after refresh.
- Add stale-session and composer-draft guardrails before writing to clipboard.
- Prevent Alt+W from overwriting the clipboard when candidate text looks like an old session.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.54：恢復 v1.47 的完整回答 fallback，但加嚴格防呆

v1.53 過度保守，停用了 toolbar container fallback，導致 Alt+W 又退回只抓目前可見片段，變成約 465 字。

### v1.54 修正

```text
1. 保留 v1.47 / v1.53 主流程。
2. 恢復 v1.47 的 toolbar container fallback。
3. 但改成 guarded fallback：
   - 含 composer / input / textarea / contenteditable：拒絕
   - 含 user role：拒絕
   - 含多個 assistant toolbar：拒絕
   - 含舊 session / composer draft 標記：拒絕
   - 超過 12000 字：拒絕
4. 目標是恢復正確的 13xx 字完整最新回答，且保留 code block / 純文字灰框排版。
5. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant 回答整段，正常應包含 code block / 純文字灰框。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.54 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: restore guarded Alt+W full-answer fallback" -m "- Restore the v1.47-style toolbar container fallback for Alt+W.
- Guard the fallback against composer drafts, user turns, multiple toolbars, stale sessions, and full-session captures.
- Fix the 465-character partial answer regression from v1.53.
- Preserve code block and plaintext block formatting for OneNote and Word.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.55：修正 Alt+W 又退回 465 字片段

v1.55 以 v1.54 為基準，只修 Alt+W 的執行順序。

### 問題

v1.54 已恢復 guarded toolbar container fallback，但順序仍是：

```text
range clone
↓
guarded full container
```

所以 range clone 先成功時，就會直接回傳目前畫面可見片段，造成：

```text
Alt+W = 465 字
```

而不會進到後面的 guarded full container。

### v1.55 修正

```text
1. Alt+W 第一順位改成 guarded full-answer container。
2. guarded container 會保留完整回答與 code/plaintext block，目標恢復正確 13xx 字。
3. range clone 只當 fallback。
4. 若候選內容符合已知 465 字片段特徵，直接拒絕。
5. 若候選內容符合 6xxx 舊 session / composer 草稿特徵，直接拒絕。
6. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant 回答整段，正常應包含 code block / 純文字灰框。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.55 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: prioritize guarded full answer for Alt+W" -m "- Make Alt+W try the guarded full-answer container before range-clone fallback.
- Prevent the 465-character partial fragment from being accepted as a valid latest answer.
- Keep stale-session and composer-draft guardrails to avoid 6xxx full-session captures.
- Preserve code/plaintext block formatting for OneNote and Word.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.56：依 DOM log 鎖定正確 MarkdownRoot 回答節點

v1.56 是根據實際 DevTools DOM debug log 修正，不再猜 toolbar / range。

### DOM log 結論

實際頁面裡同時存在三種候選：

```text
1. 6xxx 字：外層 transcript / workspace container，會抓到整個 session。
2. 465 字：目前畫面底部可見片段，會漏掉中間 code block。
3. 1257 / 13xx 字：正確的單一 assistant MarkdownRoot 回答節點。
```

正確節點特徵：

```text
class 包含 MarkdownRoot
visible = true
chars 約 1257
preview 從「Coomer 能讓...」開始
內部包含 p / code / pre / list 等回答內容
不含 user role / composer / toolbar
```

### v1.56 修正

```text
1. Alt+W 第一順位改成搜尋 visible MarkdownRoot / markdown / prose answer root。
2. 只接受部分可見的單一 assistant 回答 root。
3. 排除：
   - user role
   - composer / input / textarea / contenteditable
   - assistant toolbar
   - full transcript container
   - 舊 session / composer draft marker
   - 465 字片段
   - 6xxx session
4. 保留 code block / plaintext block / list / paragraph 格式。
5. Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context 不改。
```

### 定義

```text
Alt+W：複製目前最新 assistant MarkdownRoot 回答整段，正常應是約 13xx 字且排版正確。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.56 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: select visible MarkdownRoot for Alt+W" -m "- Add a DOM-log based Alt+W extractor that prioritizes the visible MarkdownRoot assistant answer.
- Avoid full transcript containers that produce 6xxx-character copies.
- Avoid visible range fragments that produce 465-character partial copies.
- Preserve code/plaintext block, list, and paragraph formatting for OneNote and Word.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.57：修正 Alt+W v1.56 貼到 OneNote / Word 字體變小

v1.56 已經正確鎖定 visible MarkdownRoot，能避免 465 字片段與 6xxx session 問題。
但 MarkdownRoot 內部保留了 ChatGPT 的 `CodeContent` / `text-size-code` / `MarkdownRoot` 樣式，貼到 OneNote / Word 時會把部分內容變成小字。

### v1.57 修正

```text
1. Alt+W 的 MarkdownRoot export 會強制套用 Office-friendly inline style。
2. 一般文字固定 20pt。
3. code / pre 也固定 20pt，但保留 monospace 與灰底區塊。
4. 標題保留較大字體：
   - H1: 24pt
   - H2/H3/H4: 22pt
5. 保留 paragraph / list / code block 排版。
6. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段，貼到 OneNote / Word 時內文 20pt。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.57 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: normalize Alt+W MarkdownRoot font size for Office" -m "- Keep the v1.56 visible MarkdownRoot extractor.
- Force Office-friendly inline font styles for MarkdownRoot Alt+W exports.
- Keep normal text and code/pre blocks at 20pt when pasted into OneNote or Word.
- Preserve monospace code blocks, gray code backgrounds, lists, paragraphs, and headings.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.58：修正 Alt+W code / 純文字區塊仍貼成小字

v1.57 已修正 MarkdownRoot 抓取正確，但舊的 Office export 樣式仍殘留 `pre/code = 16pt` 的規則。
因此 OneNote / Word 貼上後，灰底 code / 純文字區塊仍會變小。

### v1.58 修正

```text
1. 移除 Alt+W Office export 裡所有 16pt。
2. pre / code / pre* / code* 全部強制 20pt。
3. normalizeRichHtml 的 font-size 改成 20pt !important。
4. MarkdownRoot export 最後再跑一層 universal 20pt inline pass。
5. 保留 monospace、灰底、邊框、換行。
6. 不改 Alt+W 抓取邏輯。
7. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段；一般文字與 code/plaintext block 都是 20pt。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.58 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: force Alt+W code blocks to 20pt" -m "- Keep the v1.56/v1.57 visible MarkdownRoot extractor unchanged.
- Remove remaining 16pt styling from pre and code Office exports.
- Force pre, code, and their descendants to 20pt for OneNote and Word.
- Add a final MarkdownRoot 20pt inline-style pass before clipboard export.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.59：修正 Alt+W 貼到 OneNote / Word 全文像被反白

v1.58 修正了 20pt，但 MarkdownRoot / CodeContent 的背景樣式仍可能被 OneNote / Word 帶入，造成一般段落貼上後像整段被灰色反白。

### v1.59 修正

```text
1. 不改 Alt+W 抓取邏輯。
2. 一般 paragraph / span / div / list 背景強制 transparent。
3. inline code 背景改 transparent，避免整段看起來反白。
4. 只有真正的 pre code block 保留灰底、邊框、monospace。
5. 全部文字仍維持 20pt。
6. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段；格式接近 ChatGPT，正常段落不反白，code block 保留灰底。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.59 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: remove Alt+W gray highlight leakage" -m "- Keep the v1.56 visible MarkdownRoot extractor unchanged.
- Keep Alt+W text and code blocks at 20pt.
- Remove inherited gray backgrounds from normal paragraphs, spans, divs, and inline code.
- Preserve gray background only for real pre/code blocks.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.60：修正 Alt+W code block 內部 span 背景造成整段反白

v1.59 已移除一般段落背景，但 ChatGPT 的 code block 內部仍可能有 syntax-highlight span / CodeContent 背景。
OneNote / Word 會把這些 span 背景保留下來，造成貼上後看起來像每行、每段都被反白。

### v1.60 修正

```text
1. 不改 Alt+W 抓取邏輯。
2. 複製前把 pre/code block 重新建成乾淨結構：
   pre
   └── code 純文字
3. 移除 code block 內所有 syntax-highlight span 背景。
4. 只有 pre 外框保留單一灰底與邊框。
5. inline code 背景仍為 transparent。
6. 全部文字維持 20pt。
7. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段；正常段落不反白，code block 是單一灰底區塊。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.60 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: rebuild Alt+W code blocks for Office" -m "- Keep the v1.56 visible MarkdownRoot extractor unchanged.
- Rebuild pre/code blocks into clean plain code nodes before clipboard export.
- Remove syntax-highlight span backgrounds that caused gray highlight leakage in OneNote and Word.
- Preserve a single gray background only on the outer pre block.
- Keep all Alt+W exported text at 20pt and leave Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.61：重建 Alt+W Office HTML，徹底移除反白與 ChatGPT class

v1.60 只重建 pre/code，但 OneNote / Word 仍可能從 ChatGPT 的 MarkdownRoot、CodeContent、span、mark、class 或背景樣式繼承 highlight。
v1.61 改成在 Alt+W 複製前，為 Office 重新建立一份乾淨 HTML，不再直接貼原始 ChatGPT DOM。

### v1.61 修正

```text
1. 不改 Alt+W 抓取節點邏輯。
2. Alt+W MarkdownRoot 取得後，重新產生 Office-only HTML。
3. 移除所有 ChatGPT class / bgcolor / span / mark 背景。
4. 一般段落用乾淨 p/div/list，不保留 highlight。
5. code block 重新建成：
   pre
   └── code 純文字
6. 只有 pre 外層保留單一灰底與邊框。
7. 全部文字 20pt。
8. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段；貼到 OneNote / Word 時接近 ChatGPT 排版，但無整段反白。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.61 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: rebuild clean Office HTML for Alt+W" -m "- Keep the v1.56 visible MarkdownRoot extractor unchanged.
- Rebuild Alt+W MarkdownRoot content into a clean Office-only HTML tree.
- Remove ChatGPT classes, spans, marks, bgcolor, and inherited highlight backgrounds.
- Preserve paragraphs, lists, blockquotes, and single gray pre/code blocks at 20pt.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.63：基於 v1.61 修正 Alt+W 反白，不使用 v1.62 Safe Mode

v1.62 會把格式壓平成整段，所以不採用。
v1.63 回到 v1.61 的抓取與結構保留策略，只針對 OneNote / Word 的反白問題修正。

### v1.63 修正

```text
1. 基於 v1.61，不採用 v1.62 Safe Mode。
2. Alt+W 抓取邏輯不改，仍使用 visible MarkdownRoot。
3. 移除 ChatGPT span / mark / class / bgcolor，避免 Office 變成逐字反白。
4. code block 不再輸出 pre/code。
5. code block 改成 Office 友善的一欄表格：
   table
   └── tr
       └── td
6. 只有 td 保留單一灰底，不保留每行 / 每字背景。
7. 一般段落、粗體、清單、blockquote、表格結構保留。
8. 全部文字維持 20pt。
9. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

### 定義

```text
Alt+W：最新 assistant MarkdownRoot 回答整段；保留段落與 code block 可讀性，不再逐字反白。
Alt+N：完整 session。
Alt+S：完整 session 原始純文字。
```

---

## v1.63 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve Alt+W layout while removing highlight leakage" -m "- Base the fix on v1.61 and do not use the v1.62 Safe Mode flattening path.
- Keep the visible MarkdownRoot Alt+W extractor unchanged.
- Rebuild code blocks as one-cell Office tables instead of pre/code nodes.
- Remove ChatGPT span, mark, class, bgcolor, and inherited backgrounds from normal text.
- Preserve paragraphs, lists, blockquotes, bold text, and readable code blocks at 20pt.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.67：基於 v1.63，code block 改成每行一列 table row

v1.64：一個 table cell 放全部 code，Word / OneNote 會壓成一段。
v1.65：每行 div，Office 仍可能壓成 inline。
v1.66：每行 p，Office 仍可能壓成 inline。

v1.67 回到 v1.63，保留反白修正，但 code block 改成「每一行一個 table row」。

### v1.67 修正

```text
1. 基於 v1.63。
2. 不採用 v1.64 one-cell table。
3. 不採用 v1.65 div line。
4. 不採用 v1.66 p line。
5. Alt+W 抓取邏輯不改，仍使用 visible MarkdownRoot。
6. code block 不輸出 pre/code。
7. code block 改成：
   table[data-codeblock]
   ├── tr 第 1 行 → td
   ├── tr 第 2 行 → td
   └── tr 第 N 行 → td
8. 每行空白轉成 NBSP，避免 Word / OneNote 壓縮縮排。
9. 用 table row 強制 Office 保留換行。
10. 保留 v1.63 的反白修正。
11. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

---

## v1.67 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: preserve Alt+W code block rows for Office" -m "- Base the fix on v1.63 and avoid the v1.64 one-cell table path.
- Avoid the v1.65 div-line and v1.66 p-line paths.
- Keep the visible MarkdownRoot Alt+W extractor unchanged.
- Render code blocks as Office-safe tables with one row per original line.
- Convert spaces inside code-block lines to NBSP so Word and OneNote preserve flowchart indentation.
- Preserve the v1.63 highlight-leakage fix and keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```

---

## v1.71：基於 v1.67，只隱藏 Word / OneNote 的 code block 表格線

v1.67 的架構是正確的：每一行一個 table row，能保留 code block 的換行。
v1.70 則會把 code block 內容壓成一行，所以不採用。

v1.71 回到 v1.67，只加強 Office 專用隱藏格線設定。

### v1.71 修正

```text
1. 基於 v1.67。
2. 不採用 v1.70。
3. Alt+W 抓取邏輯不改。
4. code block 仍維持一行一列，保留換行。
5. 加上 border=0 / frame=void / rules=none。
6. 加上 border-color:transparent。
7. 加上 mso-border-alt:none。
8. 加上 mso-table-lspace/rspace:0pt。
9. 不改 Alt+N / Alt+S / Alt+V / Cursor / Review / Panel / Project Context。
```

---

## v1.71 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: hide Office grid lines in Alt+W code blocks" -m "- Base the fix on v1.67 because its one-row-per-line code block structure is correct.
- Avoid the v1.70 single-cell path because it collapses code block line breaks.
- Keep the visible MarkdownRoot Alt+W extractor unchanged.
- Add border=0, frame=void, rules=none, transparent border color, and mso-border-alt:none to code-block tables and cells.
- Preserve line breaks, arrows, indentation, and the v1.63 highlight-leakage fix.
- Keep Alt+N, Alt+S, Cursor, Review, Panel, and Project Context unchanged."
```
