# AI Prompt Bridge v1.94.9

以 v1.94.8 為基準。Alt+N 複製目前對話後，提示會顯示平台、頁面可取得的標題、可辨識的對話 ID，以及則數與字數。OneNote 正文沿用既有格式。

## Alt+J 依編號複製一輪問答

在目前對話按 Alt+J。ChatGPT 會自動捲動對話、收集各段出現的問答，然後回到原位置。清單由舊到新列出已載入的回合，每列附問題與回答開頭。點「預覽第 N 輪全文」可展開該輪的完整已擷取文字，再點一次即可收合。圖片提問顯示附件提示。輸入編號後按 Enter，或直接點選一列，複製該輪的問題與完整已載入回答。按 Esc 可關閉清單。純圖片提問顯示「圖片或附件」，該輪仍可從回答開頭辨認。

ChatGPT 與 Gemini 使用各自的回合辨識。其他平台需有可辨認的提問與回答標記。Alt+W 複製最新回答，Alt+N 複製整個已載入對話。

## 指定要複製的對話

1. 在浮動面板或 Tampermonkey 選單按「指定對話網址 → OneNote」。
2. 貼上個別對話網址。支援 ChatGPT 一般及 Project 對話、Gemini、Claude、DeepSeek、Perplexity 與 Qwen 的對話網址。
3. 目前頁面就是目標時直接複製。其他對話會在新分頁開啟，等內容載入後，按右上方「複製這個指定對話到 OneNote」。需要歷史訊息時，先向上捲動讓較早的回合載入。
4. 若網站登入或重新導向後沒有顯示按鈕，可在確認對話名稱後按 Alt+N。

## 安裝

1. 在 Tampermonkey 編輯原本的 AI Prompt Bridge。
2. 以 `AI_Prompt_Bridge_v1.94.9.user.js` 完整取代原始碼並儲存；TXT 是完全相同的備份。
3. 重新整理 ChatGPT 頁面，再使用快捷鍵。請只啟用一份腳本。

## 修正內容

- Alt+W 在目前可辨識的對話區，從最後一則使用者訊息之後擷取回答。純圖片提問也可作為回合起點。若這一輪仍沒有可辨識的回答，會停止複製。

- Alt+W 與 Alt+N 的 OneNote HTML 匯出會把有獨立上下箭頭的流程圖轉成逐行段落，保留來源換行與縮排。
- 引文保留原有段落與行內標記，並以灰色左欄和縮排和正文區隔。

- Alt+W 在網頁層的快捷鍵處理前接收按鍵，只把最新 AI 回答寫成 HTML 和純文字。若主要剪貼簿 API 失敗，改用瀏覽器複製事件寫入相同兩種格式。
- Alt+W 和 Alt+N 使用相同的 OneNote HTML 外層和 16 pt 正文字級。Alt+W 仍使用既有段落、箭頭、樹狀目錄、Phase 和表格轉換。

- Alt+W：先依 User 問題劃定回合範圍，再擷取最新 AI 回答；保留同一回答的多個區塊、表格與 Writing Block。整個 Session 的選取範圍不會取代最新回答。
- Alt+N：使用相同的回合清單，按順序匯出全部已載入的 User 與 AI 訊息，並忽略目前選取範圍。
- 支援官方 role、DIL、MarkdownRoot 與 markdown/prose 回答容器；先裁切再處理 DIL，避免外層 Session 容器被當成一則回答。
- 普通段落、箭頭、樹狀目錄、Phase 區塊與表格沿用 v1.93 排版函式。快捷鍵註冊、選單及其他功能保留。
- 最新問題尚未獲答、回答仍在生成，或只有無法確認回合邊界的容器時，Alt+W 會提示並保留剪貼簿。

## 驗證與範圍

本版已執行 Node.js 語法檢查及指定對話流程模擬測試，詳見 TEST_REPORT.md。
隨附的 Chromium 整合測試支援使用者提供的 Opera 頁面 DOM 及人工建立的回歸案例，在 Chromium 觸發鍵盤事件，讀回實際剪貼簿的 HTML 與純文字。部分既有結構測試使用 API 攔截。Windows Opera／Tampermonkey 即時頁面及 OneNote 應用程式貼上仍待實機驗證。
匯出範圍為網頁目前已載入且可辨識的訊息，未載入的歷史訊息不在 DOM 內。

## 檔案

- JS、TXT：完整可安裝程式，兩檔逐 byte 相同。
- test-regression.cjs：可重現 Chromium 測試。
- baseline/：取得的 v1.93 原始 JS 與完整說明，供比對；請勿與新版同時啟用。
- SHA256SUMS.txt：檔案 SHA-256。

## 重跑

安裝 Node.js 與 Playwright，執行 `npx playwright install chromium`，再執行：

```sh
node --check AI_Prompt_Bridge_v1.94.9.user.js
node test-regression.cjs
```

也可設定 `CHROMIUM_PATH` 指向既有 Chromium 可執行檔。
