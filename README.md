# AI Prompt Bridge v1.94.0

以完整 v1.93.0 為基準，修正 ChatGPT 回合擷取。

## 安裝

1. 在 Tampermonkey 編輯原本的 AI Prompt Bridge。
2. 以 `AI_Prompt_Bridge_v1.94.0.user.js` 完整取代原始碼並儲存；TXT 是完全相同的備份。
3. 重新整理 ChatGPT 頁面，再使用快捷鍵。請只啟用一份腳本。

## 修正內容

- Alt+W：先依 User 問題劃定回合範圍，再擷取最新 AI 回答；保留同一回答的多個區塊、表格與 Writing Block。整個 Session 的選取範圍不會取代最新回答。
- Alt+N：使用相同的回合清單，按順序匯出全部已載入的 User 與 AI 訊息，並忽略目前選取範圍。
- 支援官方 role、DIL、MarkdownRoot 與 markdown/prose 回答容器；先裁切再處理 DIL，避免外層 Session 容器被當成一則回答。
- 普通段落、箭頭、樹狀目錄、Phase 區塊與表格沿用 v1.93 排版函式。快捷鍵註冊、選單及其他功能保留。
- 最新問題尚未獲答、回答仍在生成，或只有無法確認回合邊界的容器時，Alt+W 會提示並保留剪貼簿。

## 驗證與範圍

已執行 Node.js 語法檢查與 Chromium 多回合 DOM 整合測試；詳見 TEST_REPORT.md。
測試使用可重現 DOM、真實鍵盤事件及剪貼簿 API 攔截，檢查送出的 HTML/TXT。未實測 Windows Opera／Tampermonkey 與 OneNote 應用程式貼上。
匯出範圍為網頁目前已載入且可辨識的訊息，未載入的歷史訊息不在 DOM 內。

## 檔案

- JS、TXT：完整可安裝程式，兩檔逐 byte 相同。
- test-regression.cjs：可重現 Chromium 測試。
- chromium-results.json：實際測試輸出。
- baseline/：取得的 v1.93 原始 JS 與完整說明，供比對；請勿與新版同時啟用。
- SHA256SUMS.txt：檔案 SHA-256。

## 重跑

安裝 Node.js 與 Playwright，執行 `npx playwright install chromium`，再執行：

```sh
node --check AI_Prompt_Bridge_v1.94.0.user.js
node test-regression.cjs
```

也可設定 `CHROMIUM_PATH` 指向既有 Chromium 可執行檔。
