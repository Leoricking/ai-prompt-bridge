# AI Prompt Bridge v1.28

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
