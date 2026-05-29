# AI Prompt Bridge v1.8

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
