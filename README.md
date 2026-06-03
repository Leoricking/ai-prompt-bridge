# AI Prompt Bridge v1.11

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

## v1.11：Alt+S 一鍵複製整個 Session 到 OneNote

v1.11 調整 Session 複製邏輯，讓最常用的快捷鍵 `Alt+S` 直接變成「完整 session → OneNote / Word 富文本」的一鍵輸出。

### 新邏輯

```text
Alt+S：完整 session 富文本複製到 OneNote / Word
Alt+Shift+S：完整 session 原始純文字備份
Alt+Shift+W：完整 session 富文本複製到 OneNote / Word（保留相容快捷鍵）
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

```text
1. 在 ChatGPT / Gemini / Claude / DeepSeek 頁面
2. 如果對話很長，先往上捲動讓舊訊息載入
3. 按 Alt+S
4. 到 OneNote / Word / Outlook / Notion
5. Ctrl+V
```

貼上內容會自動包含：

```text
AI Session Export
Source
Captured At
URL
```

### 什麼時候用 Alt+Shift+S？

如果你只是要存 raw log / 原始文字到 Notepad++，用：

```text
Alt+Shift+S
```

如果你要貼到 OneNote / Word 看起來舒服，用：

```text
Alt+S
```

---

## v1.11 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: make Alt+S copy full session to OneNote" -m "- Make Alt+S copy the full current AI session as OneNote / Word rich text.
- Keep body text at 20pt while preserving original heading sizes.
- Move raw full-session text copy to Alt+Shift+S.
- Keep Alt+Shift+W as a compatibility shortcut for full-session rich text export.
- Update README with the v1.11 session copy workflow."
```
