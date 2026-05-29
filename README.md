<<<<<<< HEAD
# AI Prompt Bridge v1.4
=======
# AI Prompt Bridge v1.6
>>>>>>> 0f40809 (feat: add full-session rich text copy)

`AI Prompt Bridge` 是一個給 **Opera / Chrome / Edge + Tampermonkey** 使用的跨 AI 搬運工腳本。

這版從 **v1.0.0** 開始，檔名與品牌名稱已整理為：

```text
AI Prompt Bridge
```

原本的 `rossi-` 前綴已移除，方便上傳到 Git。

---

## 1. 專案檔案

建議 Git repo 結構：

```text
ai-prompt-bridge/
├── README.md
└── ai-prompt-bridge.user.js
```

---

## 2. 用途

它的目標是用 0 元方式完成跨 AI 工作流：

```text
Gemini 看圖 / UI 診斷
→ ChatGPT 深度整理
→ Gemini / DeepSeek / Claude 複審
→ ChatGPT 收斂成 Cursor prompt
→ Cursor Composer 落地改完整檔案
→ 成功後沉澱成 .cursor/rules
```

---

## 3. 直覺口訣

```text
看到有用內容 → Alt+C
要轉成 Cursor 修正 → Alt+V
要貼給目標 AI → Ctrl+V
要複製整段對話 → Alt+S
```

對應意思：

```text
Alt+C = 抓目前這邊的原文 + 複製到剪貼簿 + 存入腳本暫存區
Alt+V = 把暫存內容轉成 Cursor Fix Prompt + 複製到剪貼簿
Alt+S = 複製目前頁面的整個 session 對話 + 存入暫存區
Ctrl+V = 真正貼到輸入框
```

---

## 4. Alt+C 要在哪邊用？

`Alt+C` 永遠用在「來源端」。

```text
哪邊有你想搬走的內容，就在哪邊按 Alt+C。
```

| 來源內容在哪裡 | Alt+C 按在哪裡 |
|---|---|
| Gemini 幫你看圖後給出 UI 診斷 | Gemini |
| ChatGPT 寫出修正策略 / code | ChatGPT |
| DeepSeek 幫你做 code review | DeepSeek |
| Claude 給出保守修法 | Claude |
| Perplexity 查到文件 / error 原因 | Perplexity |
| Cursor 產出要給別的 AI review 的內容 | Cursor 網頁版可用；桌面 Cursor 建議直接 Ctrl+C |

---

## 5. Alt+V 是幹嘛？

`Alt+V` 不是貼上。

```text
Alt+V = 把剛剛 Alt+C 抓到的內容，包成 Cursor Fix Prompt，複製到剪貼簿。
```

真正貼上仍然是：

```text
Ctrl+V
```

所以：

```text
Alt+C = 抓原文
Alt+V = 轉成 Cursor 修正任務
Ctrl+V = 貼到輸入框
```

---

## 6. Alt+S 是幹嘛？

```text
Alt+S = 複製目前頁面的整段 session 對話
```

適合：

```text
1. 把整段 ChatGPT 對話丟給 Gemini 複審
2. 把整段 Gemini 診斷丟回 ChatGPT 收斂
3. 把一整段多輪討論交給 Claude / DeepSeek 做總 review
4. 把目前 session 保存到記事本或 README
```

---

## 7. 面板按鈕

```text
① 抓這邊並複製 Alt+C
② 複製暫存原文
③ 給 Gemini 看 UI
④ 給對方審 Code
⑤ 給 ChatGPT 轉 Cursor Alt+V
⑥ 變成 Cursor Rule
⑦ 複製整個 Session Alt+S
⑧ 重置面板位置
🙈 隱藏 Alt+B
```

---

## 8. 快捷鍵

| 快捷鍵 | 功能 |
|---|---|
| Alt+C | 抓目前頁面內容，存暫存區，並複製原文 |
| Alt+V | 把暫存內容轉成 Cursor Fix prompt，並複製 |
| Alt+S | 複製目前頁面的整個 session 對話 |
| Alt+B | 隱藏 / 顯示面板；如果面板不見，強制顯示到右下角 |
| Alt+R | 強制重置面板位置到右下角 |

---

## 9. 安裝方式

1. 打開 Tampermonkey Dashboard
2. 新增腳本
3. 刪掉預設內容
4. 貼上 `ai-prompt-bridge.user.js` 全部內容
5. 儲存
6. 回 ChatGPT / Gemini / DeepSeek 按 `Ctrl+F5`

---

## 10. Opera 必要設定

如果面板沒有出現：

```text
1. 到 opera://extensions
2. 開啟右上角「研發人員模式」
3. 確認 Tampermonkey 已啟用
4. 確認 AI Prompt Bridge 腳本已啟用
5. 回 ChatGPT / Gemini 按 Ctrl+F5
```

如果仍沒出現：

```text
1. 按 Alt+B
2. 按 Alt+R
3. 看右下角是否出現綠色 R 小浮球
4. 點 R 小浮球
```

---

## 11. 面板不見了怎麼辦？

照順序做：

```text
1. 看右下角有沒有綠色 R 小浮球
2. 有的話，點 R
3. 沒有的話，按 Alt+B
4. 還沒有，按 Alt+R
5. 再不行，Ctrl+F5 重整頁面
```

---

## 12. 使用情境：Gemini → ChatGPT → Gemini → ChatGPT → Cursor

```text
1. Gemini 看圖 / 看 UI
2. Gemini Alt+C
3. ChatGPT Ctrl+V
   問：請根據 Gemini 診斷提出更具體修正策略

4. ChatGPT 回答
5. ChatGPT Alt+C
6. Gemini 點 ③ 給 Gemini 看 UI
7. Gemini Ctrl+V
   問：這個修正策略還有 UI 風險嗎？

8. Gemini 回答
9. Gemini Alt+C
10. ChatGPT Alt+V
11. ChatGPT Ctrl+V
12. ChatGPT 產出 Cursor Composer 最終 prompt

13. 貼到 Cursor
```

重點：

```text
中間互相討論時，多數情況用 Ctrl+V 原文貼上即可。
最後要產 Cursor 指令時，才用 Alt+V。
```

---

## 13. 使用情境：ChatGPT → Gemini → ChatGPT → DeepSeek → ChatGPT → Cursor

```text
1. ChatGPT 先提出修法
2. ChatGPT Alt+C
3. Gemini 點 ③ 或 ④
4. Gemini Ctrl+V

5. Gemini 回答
6. Gemini Alt+C
7. ChatGPT Ctrl+V
   問：請整合 Gemini 意見，修正你的方案

8. ChatGPT 回答
9. ChatGPT Alt+C
10. DeepSeek 點 ④ 給對方審 Code
11. DeepSeek Ctrl+V

12. DeepSeek 回答
13. DeepSeek Alt+C
14. ChatGPT Alt+V
15. ChatGPT Ctrl+V

16. ChatGPT 產 Cursor prompt
17. Cursor 執行
```

---

---

## Alt+S 全部複製修正說明 v1.1

### 問題現象

舊版 `Alt+S` 在某些對話中會只複製到部分內容，尤其是對話裡出現 Markdown code block 時，可能只留下 code block 或從中間開始的片段。

### 原因

`Alt+S` 原本也走一般 `savePayload()` 流程，而一般流程會呼叫 `preferCodeOrText()`。

這個邏輯是為了 `Alt+C` 抓單段 code 時方便使用：

```text
如果內容裡有 ```code block```，就優先保留 code block。
```

但對 `Alt+S` 來說這是錯的，因為「完整 session」必須保留所有對話文字，而不是只保留 code block。

### v1.1 修正

```text
1. Alt+S 改成 preserveRaw 模式。
2. 完整 session 不再經過 preferCodeOrText()。
3. 若 structured selector 抓到的內容太短，會改用 main/body 中較長的頁面文字。
4. 複製成功提示會顯示字數，方便確認是否只抓到片段。
5. storage key 更新到 v1.1，避免舊暫存污染測試。
```

### v1.1 測試方式

```text
1. 開啟 ChatGPT 或 Gemini 對話
2. 確認頁面已載入你要複製的內容
3. 按 Alt+S
4. 開記事本
5. Ctrl+V
6. 檢查是否從對話開頭開始，而不是只從中間 code block 開始
```

### 注意事項

```text
Alt+S 只能複製目前頁面已載入到 DOM 的內容。
如果對話很長，請先往上捲動，讓舊訊息載入後再按 Alt+S。
```


---

## OneNote / Notion / Markdown 一鍵整理 v1.2

### 功能目的

v1.2 新增：

```text
⑨ 整理成 OneNote 筆記 Alt+N
```

這個功能不是直接把原始長文丟進 OneNote，而是幫你把目前暫存內容包成「請 AI 整理成決策筆記」的 Prompt。

原因是：AI 原始回答通常很長，直接貼到 OneNote 很快會變成一堆看似有用、但找不到重點的資料。正確做法是先壓縮成「可執行筆記」，再進 OneNote / Notion / Markdown。

### 使用流程

```text
1. 在 ChatGPT / Gemini / DeepSeek / Claude 找到有用內容
2. 按 Alt+C 抓取內容
3. 切到 ChatGPT
4. 按 Alt+N，或點 ⑨ 整理成 OneNote 筆記
5. ChatGPT 輸入框 Ctrl+V
6. 送出
7. 把 ChatGPT 產出的整理後筆記貼到 OneNote / Notion / Markdown
```

### 如果要整理整段對話

```text
1. 在目前 AI 頁面按 Alt+S
2. 切到 ChatGPT
3. 按 Alt+N
4. Ctrl+V
5. 送出
6. 將整理後版本貼到 OneNote / Notion / Markdown
```

### OneNote 筆記格式

`Alt+N` 會要求 AI 輸出以下格式：

```text
# 主題

## 1. 最終結論

## 2. 背景

## 3. 適用情境

## 4. 可執行步驟

## 5. 不可破壞原則 / 保留原則

## 6. 指令 / Prompt / Git Commit / 測試步驟

## 7. 風險與注意事項

## 8. 下一步待辦

## 9. 可同步到 README / docs 的內容

## 10. 來源
```

### 推薦用法

```text
OneNote：放整理後的決策筆記
Git / Markdown：放專案正式規格、README、bugfix log、commit
NotebookLM：放大量文件查詢
本地 Archive：保存 AI 原始輸出
```

### 快捷鍵更新

| 快捷鍵 | 功能 |
|---|---|
| Alt+C | 抓目前頁面內容，存暫存區，並複製原文 |
| Alt+V | 把暫存內容轉成 Cursor Fix prompt，並複製 |
| Alt+S | 複製目前頁面的整個 session 對話 |
| Alt+N | 把暫存內容轉成 OneNote / Notion / Markdown 決策筆記整理 prompt |
| Alt+B | 隱藏 / 顯示面板 |
| Alt+R | 強制重置面板位置到右下角 |


<<<<<<< HEAD
## 14. 使用方式

```text
1. 安裝 / 覆蓋 Tampermonkey 舊腳本
2. Ctrl+S 儲存
3. 回 ChatGPT / Gemini / DeepSeek / Claude
4. Ctrl+F5
5. 面板上方選 Project Context
6. 來源 AI 按 Alt+C 或 Alt+S
7. 到 ChatGPT 按 Alt+V 或 Alt+N
8. Ctrl+V 貼上
=======
## 14. Git Commit

建議 commit message：

```text
fix: preserve full-session copy output

- Rename Rossi AI Prompt Bridge to AI Prompt Bridge.
- Remove rossi prefix from distributable filenames.
- Reset userscript version to 1.0.0.
- Keep cross-AI capture, Cursor prompt generation, code review, visual review, session copy, and panel recovery features.
- Add README with installation, shortcuts, and multi-model workflow documentation.
>>>>>>> 0f40809 (feat: add full-session rich text copy)
```

---

## v1.3：面板不出現排查版

v1.3 新增：

```text
1. @run-at document-idle，等頁面載入後再注入
2. 啟動提示：左下角會短暫顯示 AI Prompt Bridge loaded
3. Console log：會輸出 [AI Prompt Bridge] injected
4. Tampermonkey menu command：可從 Tampermonkey 選單手動 Show / Reset Panel
5. Alt+R 強制重置面板位置
```

### 正常啟動時應該看到

重新整理 ChatGPT / Gemini 後，左下角會短暫出現：

```text
AI Prompt Bridge loaded
```

右下角會出現主面板。

### 如果左下角沒有 AI Prompt Bridge loaded

代表腳本根本沒有注入頁面。請檢查：

```text
1. Tampermonkey 是否啟用
2. AI Prompt Bridge 是否啟用
3. Opera 研發人員模式是否啟用
4. 目前網址是否是 chatgpt.com / gemini.google.com / claude.ai / chat.deepseek.com
5. 公司電腦是否被 IT policy 擋 userscript injection
```

### 如果有 loaded 但沒有面板

按：

```text
Alt+R
```

或從 Tampermonkey 圖示選單點：

```text
Show / Reset AI Prompt Bridge Panel
```

### Console 檢查

在 ChatGPT / Gemini 頁面按 F12 → Console，搜尋：

```text
[AI Prompt Bridge] injected
```

如果有這行，代表腳本已注入，只是面板位置或樣式問題。

---

## v1.4：Project Context Awareness 專案上下文感知

v1.4 新增「Project Context」下拉選單，用來解決不同專案切換時，必須手動補專案路徑、技術棧、禁忌與測試指令的摩擦。

### 新增功能

```text
1. 面板頂部新增 Project Context 下拉選單。
2. 支援 Auto Detect，自動根據目前頁面內容判斷專案。
3. 支援手動指定專案：Music Studio、Media Downloader、TW Quant、Media2Txt、SmartCleaner、Generic。
4. Alt+V / Code Review / Visual Review / Make Rule / Alt+N 會自動注入專案背景。
5. 專案背景包含 Project_Path、Tech_Stack、Critical_Rules、Test_Commands、Docs_Targets。
```

---

### 目前內建專案

| 專案 | Key | 主要用途 |
|---|---|---|
| mp3_auto_edit / Music Studio | mp3 | 音樂整理、Tkinter GUI、歌詞、ReplayGain、音訊處理 |
| media-batch-downloader | downloader | IG / FB / yt-dlp / Playwright 下載器 |
| TW-Quant-Cockpit | quant | 台股量化、FinMind、回測、dashboard |
| Media2Txt-Pro | media2txt | Whisper、ffmpeg、影片轉文字 |
| SmartCleanerPro | smartcleaner | Windows 清理、BSOD 風險、CrashDump / TEMP 設定 |
| Generic Project | generic | 未分類專案 |
| Auto Detect | auto | 自動判斷 |

---

### 使用方式

```text
1. 在面板最上方選 Project Context
2. 如果不確定，維持 Auto Detect
3. 在來源 AI 按 Alt+C 或 Alt+S
4. 到 ChatGPT 按 Alt+V 或 Alt+N
5. Ctrl+V 貼上
6. Prompt 會自動包含專案路徑、技術棧、禁忌、測試指令與 docs 位置
```

---

### Alt+V 輸出會自動包含

```text
Project_Mode:
Project_Name:
Project_Path:
Tech_Stack:
Critical_Rules:
Test_Commands:
Docs_Targets:
Source:
Captured_At:
Source_URL:
```

這樣 ChatGPT / Cursor / DeepSeek / Claude 不需要你每次手動補：

```text
這是哪個專案
在哪個路徑
用什麼技術
哪些功能不能改壞
要怎麼測試
README / BUGFIX_LOG 要同步哪裡
```

---

### Music Studio 範例

選擇：

```text
mp3_auto_edit / Music Studio
```

Alt+V 會自動帶入：

```text
Project_Path: D:/code/Claude/mp3_auto_edit/music_manager_GUI
Tech_Stack: Python 3.x, Tkinter / GUI, Mutagen, Pydub, ffmpeg, SQLite, Multithreading
Critical_Rules:
- 必須嚴格處理 Windows 中文路徑、特殊字元、長路徑與非英文檔名。
- 所有耗時音訊解碼、掃描、ReplayGain、歌詞搜尋、特徵分析都不可阻塞 Tkinter 主執行緒。
- GUI 元件更新必須回到主執行緒，不可由 worker thread 直接改 UI。
- 不可破壞既有音樂庫掃描、播放、歌詞、ReplayGain、整理、匯出功能。
```

---

### Media Downloader 範例

選擇：

```text
media-batch-downloader
```

Alt+V 會自動帶入：

```text
Project_Path: D:/code/Claude/media-batch-downloader
Critical_Rules:
- 不影響現有正常下載功能，尤其 Instagram / Facebook 已成功流程不可改壞。
- Facebook 多圖貼文不可少抓；未達 expected count 不可標 SUCCESS。
- cookies / Playwright / yt-dlp fallback 行為不可互相覆蓋有效結果。
```

---

### TW Quant 範例

選擇：

```text
TW-Quant-Cockpit
```

Alt+V 會自動帶入：

```text
Critical_Rules:
- 嚴格防止時間序列 look-ahead bias，不可偷看未來資料。
- 回測與特徵工程必須清楚區分 train / validation / test / walk-forward。
- 不能把 mock / demo 結果誤標成真實績效。
```

---

### 建議操作

```text
小問題：Auto Detect 即可
切換專案：手動選 Project Context
大改版：手動選專案，再跑 ChatGPT → Gemini → DeepSeek → Claude → ChatGPT → Cursor
歸檔：Alt+N 會自動帶專案 docs 同步位置
```

---

## v1.4 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: add project-aware prompt presets" -m "- Add Project Context selector with Auto Detect and manual project presets.
- Add project-specific path, tech stack, critical rules, test commands, and docs targets.
- Inject project context into Cursor Fix, Code Review, Visual Review, Make Rule, and OneNote prompts.
- Add presets for Music Studio, media-batch-downloader, TW-Quant-Cockpit, Media2Txt-Pro, SmartCleanerPro, and Generic project workflows.
- Update README with project-aware workflow and usage examples."
```
<<<<<<< HEAD
=======

---

## v1.5：Word / OneNote 富文本一鍵複製

v1.5 新增：

```text
⑩ 複製 Word/OneNote 格式 Alt+W
```

這個功能用來解決從 ChatGPT / Gemini / DeepSeek / Claude 複製內容到 Word、OneNote、Outlook、Notion 時，格式跑掉、黑色背景被帶入、表格碎掉、標題與粗體消失的問題。

---

### 為什麼不要直接改 Alt+C？

`Alt+C` 保留原本功能：

```text
抓原文
存暫存區
給 Alt+V / Alt+N / Code Review / Make Rule 使用
```

`Alt+W` 則專門做：

```text
複製乾淨 HTML 富文本
貼到 Word / OneNote / Outlook / Notion
保留標題、粗體、清單、表格、code block
移除網頁黑底、按鈕、SVG、雜訊樣式
```

所以 v1.5 採用「獨立按鈕 / 獨立快捷鍵」設計，避免破壞原本 Alt+C 工作流。

---

### 使用方式：複製單段 AI 回答到 Word / OneNote

```text
1. 在 ChatGPT / Gemini / DeepSeek / Claude 找到要保存的回答
2. 如果只要其中一段，先用滑鼠選取
3. 按 Alt+W，或點 ⑩ 複製 Word/OneNote 格式
4. 開 Word / OneNote / Outlook / Notion
5. Ctrl+V
```

如果沒有手動選取，腳本會嘗試自動抓最後一段 AI 回答。

---

### 適合貼到哪裡？

```text
Word：正式報告、客戶文件、可列印文件
OneNote：個人知識庫、決策筆記、專案筆記
Outlook / Gmail：寄送保留格式的內容
Notion：保存帶格式筆記
Google Docs：整理成線上文件
```

---

### 複製方式比較

| 複製方式 | 貼到 Word / OneNote 的效果 |
|---|---|
| 滑鼠全選 Ctrl+C | 容易帶入黑底、網頁樣式、按鈕、雜訊 |
| AI 網頁內建 Copy | 常變成純 Markdown，表格與標題不一定好看 |
| Alt+C | 純文字 / 原文，適合 AI Prompt 搬運 |
| Alt+W | 乾淨 HTML 富文本，適合 Word / OneNote / Outlook |

---

### Alt+W 保留的格式

```text
標題 h1 / h2 / h3
粗體 / 斜體
清單
表格
code block
引用區塊
基本段落
```

### Alt+W 會移除的內容

```text
網頁黑色背景
ChatGPT / Gemini 的複製按鈕
SVG icon
多餘 class / inline style
script / style / input / textarea
無障礙隱藏文字
```

---

### 快捷鍵更新

| 快捷鍵 | 功能 |
|---|---|
| Alt+C | 抓原文，給跨 AI 搬運與 Prompt 使用 |
| Alt+V | 轉成 Cursor 修正任務 |
| Alt+S | 複製整個 Session 原文 |
| Alt+N | 轉成 OneNote / Notion / Markdown 決策筆記整理 Prompt |
| Alt+W | 複製 Word / OneNote 富文本格式 |
| Alt+B | 隱藏 / 顯示面板 |
| Alt+R | 重置面板位置 |

---

## v1.5 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: add rich text copy for Word and OneNote" -m "- Add Alt+W shortcut and panel button for Word / OneNote rich-text copy.
- Copy clean HTML and plain text to the clipboard using ClipboardItem.
- Preserve headings, bold text, lists, tables, code blocks, and blockquotes.
- Remove web app styles, black backgrounds, buttons, SVG icons, and noisy attributes before copying.
- Keep Alt+C unchanged for raw AI prompt transfer workflows."
```

---

## v1.6：完整 Session 富文本複製到 Word / OneNote / Outlook

v1.6 新增：

```text
⑪ 複製整頁 Word/OneNote Alt+Shift+W
```

這個功能和 v1.5 的 `Alt+W` 不同：

```text
Alt+W：複製單段 / 選取內容的 Word / OneNote 富文本格式
Alt+Shift+W：複製目前頁面整個 session 的 Word / OneNote 富文本格式
```

---

### 使用方式：整個 session 貼到 Word / OneNote

```text
1. 在 ChatGPT / Gemini / DeepSeek / Claude 頁面
2. 如果對話很長，先往上捲動讓舊訊息載入
3. 按 Alt+Shift+W
4. 開 Word / OneNote / Outlook / Notion / Google Docs
5. Ctrl+V
```

腳本會同時寫入：

```text
text/html：給 Word / OneNote / Outlook 保留格式
text/plain：給 Notepad++ / 純文字工具備援
```

---

### v1.6 會自動加入匯出標頭

貼到 Word / OneNote 時，前面會包含：

```text
AI Session Export
Source
Captured At
URL
```

方便日後追溯來源。

---

### v1.6 適合用在

```text
1. 把整段 ChatGPT 討論貼到 Word 做報告
2. 把整段 Gemini 視覺分析貼到 OneNote 保存
3. 把 DeepSeek / Claude review 全文存成專案紀錄
4. 把完整 AI session 貼到 Outlook 寄給同事
5. 把整段討論轉進 Notion / Google Docs
```

---

### 注意事項

```text
Alt+Shift+W 只能複製目前頁面已載入到 DOM 的內容。
如果對話非常長，請先往上捲動，讓舊訊息載入後再複製。
```

---

### 快捷鍵更新

| 快捷鍵 | 功能 |
|---|---|
| Alt+C | 抓原文，給跨 AI 搬運與 Prompt 使用 |
| Alt+V | 轉成 Cursor 修正任務 |
| Alt+S | 複製整個 Session 原文 |
| Alt+N | 轉成 OneNote / Notion / Markdown 決策筆記整理 Prompt |
| Alt+W | 複製單段 / 選取內容的 Word / OneNote 富文本格式 |
| Alt+Shift+W | 複製整個 Session 的 Word / OneNote 富文本格式 |
| Alt+B | 隱藏 / 顯示面板 |
| Alt+R | 重置面板位置 |

---

## v1.6 Git Commit

```bash
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "feat: add full-session rich text copy" -m "- Add Alt+Shift+W shortcut and panel button for full-session Word / OneNote rich-text copy.
- Export the current AI session as clean HTML and plain text clipboard formats.
- Add source, captured time, and URL header to rich session exports.
- Reuse rich HTML cleanup to remove web app backgrounds, buttons, SVG icons, and noisy attributes.
- Keep Alt+W for single-answer rich text copy and Alt+S for raw full-session copy."
```
>>>>>>> 0f40809 (feat: add full-session rich text copy)
