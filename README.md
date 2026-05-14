# AI Prompt Bridge v1.0

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

## 14. Git Commit

建議 commit message：

```text
feat: initialize AI Prompt Bridge v1.0

- Rename Rossi AI Prompt Bridge to AI Prompt Bridge.
- Remove rossi prefix from distributable filenames.
- Reset userscript version to 1.0.0.
- Keep cross-AI capture, Cursor prompt generation, code review, visual review, session copy, and panel recovery features.
- Add README with installation, shortcuts, and multi-model workflow documentation.
```
