# AI Prompt Bridge v1.0

`AI Prompt Bridge` 是一個給 **Opera / Chrome / Edge + Tampermonkey** 使用的跨 AI 搬運工腳本。

---

## 0. 安裝步驟

<img width="378" height="634" alt="1 安裝 Tampermonkey 後, 點新增腳本" src="https://github.com/user-attachments/assets/c3712914-8341-492a-86f5-da8d58c69ec4" />

<img width="1800" height="936" alt="2 新增此腳本" src="https://github.com/user-attachments/assets/f4fa7de3-6c4c-428d-9fc8-0949c790b699" />

<img width="1848" height="835" alt="3 介面" src="https://github.com/user-attachments/assets/ec509b8e-081a-4bdf-9055-7b9f4b5884b6" />

## 1. 專案檔案

Git repo 結構：

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

## 14. ChatGPT / Gemini / DeepSeek / Claude 使用情境

### 一句話總結

```text
Gemini：看圖、看 UI、找畫面問題
ChatGPT：主腦、整合、產 Cursor 最終修正 prompt
DeepSeek：審 code、抓語法、抓邏輯漏洞
Claude：保守複審、架構穩定性、避免改壞原功能
Cursor：真正改檔案
```

---

### 14.1 ChatGPT 使用情境

ChatGPT 是主控台，負責最後整合與決策。

#### 適合做什麼

```text
1. 整理 Gemini 的 UI 診斷
2. 整理 DeepSeek 的 code review
3. 整理 Claude 的保守建議
4. 產生給 Cursor Composer 的最終 prompt
5. 寫完整修正策略
6. 決定哪些建議採用、哪些不採用
7. 把成功經驗整理成 .cursor/rules
```

#### 不建議只讓 ChatGPT 做什麼

```text
1. 單獨判斷 UI 截圖細節
2. 單獨猜 icon 對齊問題
3. 沒有讓其他模型 review 就直接大改專案
```

#### Gemini → ChatGPT

```text
Gemini 看圖完成
→ Gemini Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

用途：

```text
讓 ChatGPT 把 Gemini 診斷整理成 Cursor prompt
```

#### DeepSeek → ChatGPT

```text
DeepSeek code review 完成
→ DeepSeek Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

用途：

```text
讓 ChatGPT 整合 DeepSeek 的 bug 風險，產出最小修正方案
```

#### Claude → ChatGPT

```text
Claude 複審完成
→ Claude Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

用途：

```text
讓 ChatGPT 整合 Claude 的保守建議，避免 Cursor 改壞原本功能
```

---

### 14.2 Gemini 使用情境

Gemini 是視覺 QA，主要負責看圖、看 UI、找畫面問題。

#### 適合做什麼

```text
1. 看 UI 截圖
2. 找 icon 偏移
3. 找 label 重複
4. 找 spacing / padding / alignment 問題
5. 看按鈕位置是否合理
6. 看畫面是否被 panel 擋住
7. 分析 GUI 視覺問題
8. 檢查 ChatGPT 提出的 UI 修法是否合理
```

#### 不建議讓 Gemini 做什麼

```text
1. 最後決定完整架構
2. 單獨產生大型 code 改版
3. 在沒有專案檔案時猜太深的程式邏輯
```

#### Gemini 看圖後丟給 ChatGPT

```text
Gemini 上傳截圖
→ Gemini 產生 UI 診斷
→ Gemini Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

適合：

```text
標題重複
icon 沒對齊
播放控制列跑版
progress window 殘留
圖片 / 封面 / layout 問題
```

#### ChatGPT 修法給 Gemini 複審

```text
ChatGPT 產出 UI 修法
→ ChatGPT Alt+C
→ Gemini 點 ③ 給 Gemini 看 UI
→ Ctrl+V
→ 送出
```

用途：

```text
讓 Gemini 檢查 ChatGPT 修法是否還有畫面風險
```

---

### 14.3 DeepSeek 使用情境

DeepSeek 是 code reviewer，主要負責檢查程式碼細節。

#### 適合做什麼

```text
1. 審查 ChatGPT 產出的 code
2. 找語法錯誤
3. 找漏 import
4. 找變數未定義
5. 找邏輯邊界錯誤
6. 找 thread-safety 風險
7. 找 Windows path / encoding 問題
8. 找可能造成 regression 的修改
```

#### 不建議讓 DeepSeek 做什麼

```text
1. 單獨決定 UI 視覺問題
2. 單獨重構整個專案
3. 取代 ChatGPT 做最終整合
```

#### ChatGPT code → DeepSeek review

```text
ChatGPT 產出 code 或修正策略
→ ChatGPT Alt+C
→ DeepSeek 點 ④ 給對方審 Code
→ Ctrl+V
→ 送出
```

DeepSeek 應該回答：

```text
1. 哪裡可能壞
2. 哪裡會 regression
3. 哪裡有漏 import / 變數錯
4. 哪裡不該改
5. 最小修正建議
```

#### DeepSeek review → ChatGPT 整合

```text
DeepSeek review 完成
→ DeepSeek Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

用途：

```text
讓 ChatGPT 把 DeepSeek review 整合成 Cursor 最終修正 prompt
```

---

### 14.4 Claude 使用情境

Claude 是保守資深工程師，主要用來避免改壞原本功能。

#### 適合做什麼

```text
1. 大型修改前做風險評估
2. 檢查是否破壞原本功能
3. 檢查架構是否合理
4. 檢查 Cursor prompt 是否太危險
5. 幫你寫 .cursor/rules
6. 幫你拆大型任務
7. 保守複審 ChatGPT / DeepSeek 的建議
```

#### 不建議讓 Claude 做什麼

```text
1. 每個小 bug 都問，浪費額度
2. 免費額度下做大量長 code 來回
3. 直接讓它重寫完整專案
```

#### ChatGPT 最終方案 → Claude 複審

```text
ChatGPT 產出 Cursor prompt
→ ChatGPT Alt+C
→ Claude 點 ④ 給對方審 Code
→ Ctrl+V
→ 送出
```

Claude 應該檢查：

```text
1. 是否會破壞原本功能
2. 是否改太大
3. 是否可以更小範圍修
4. 是否缺少測試
5. 是否應該先備份 / 分支
```

#### Claude 複審 → ChatGPT 收斂

```text
Claude 回答完成
→ Claude Alt+C
→ ChatGPT Alt+V
→ Ctrl+V
→ 送出
```

用途：

```text
讓 ChatGPT 把 Claude 的保守建議合併進 Cursor prompt
```

---

### 14.5 推薦的四模型工作流

#### A. UI bug 工作流

適合：

```text
icon 沒對齊
標題重複
視窗殘留
按鈕跑版
layout 錯誤
```

流程：

```text
1. Gemini 看截圖
2. Gemini Alt+C
3. ChatGPT Alt+V
4. ChatGPT 產 Cursor prompt
5. Cursor 修改
6. 修完截圖再給 Gemini 看
7. 成功後 ChatGPT Make Rule
```

簡化版：

```text
Gemini → ChatGPT → Cursor
```

---

#### B. Code bug 工作流

適合：

```text
程式報錯
功能壞掉
下載失敗
播放錯誤
資料消失
thread 卡死
encoding error
```

流程：

```text
1. ChatGPT 分析 log / code
2. ChatGPT Alt+C
3. DeepSeek 點 ④ Code Review
4. DeepSeek Alt+C
5. ChatGPT Alt+V
6. ChatGPT 產 Cursor prompt
7. Cursor 修改
```

簡化版：

```text
ChatGPT → DeepSeek → ChatGPT → Cursor
```

---

#### C. 大型修改工作流

適合：

```text
新增功能
改 UI 架構
改下載流程
改音樂整理邏輯
改 queue / lyrics / playback
```

流程：

```text
1. ChatGPT 拆需求
2. Gemini 看 UI / UX
3. DeepSeek 審 code 細節
4. Claude 做保守架構複審
5. ChatGPT 收斂成 Cursor prompt
6. Cursor 分批修改
7. 每成功一段就 Make Rule
```

完整鏈：

```text
ChatGPT → Gemini → DeepSeek → Claude → ChatGPT → Cursor
```

---

#### D. 最穩但不浪費時間的工作流

日常大多數情況用這個就夠：

```text
UI 問題：
Gemini → ChatGPT → Cursor

Code 問題：
ChatGPT → DeepSeek → ChatGPT → Cursor

大改版：
ChatGPT → Gemini → Claude → ChatGPT → Cursor
```

---

### 14.6 按鈕該怎麼選

| 你現在想做什麼 | 按哪個 |
|---|---|
| 把目前 AI 的回答抓起來 | ① 抓這邊並複製 / Alt+C |
| 把暫存原文再複製一次 | ② 複製暫存原文 |
| 給 Gemini 看 UI / 截圖 / layout | ③ 給 Gemini 看 UI |
| 給 DeepSeek / Claude / Gemini 審 code | ④ 給對方審 Code |
| 給 ChatGPT 轉 Cursor prompt | ⑤ 給 ChatGPT 轉 Cursor / Alt+V |
| 變成 Cursor Rule | ⑥ 變成 Cursor Rule |
| 複製整段對話 | ⑦ 複製整個 Session / Alt+S |
| 面板不見或跑掉 | ⑧ 重置面板位置 / Alt+R |

---

### 14.7 最後決策規則

| 問題類型 | 優先問誰 |
|---|---|
| UI / 截圖 / icon / 對齊 | Gemini |
| 架構 / 邏輯 / 最終整合 | ChatGPT |
| 程式碼細節 / bug / import / regression | DeepSeek |
| 保守複審 / 避免改壞 / 大型改版 | Claude |
| 最新文件 / API / 套件錯誤 | Perplexity |
| 真正改檔案 | Cursor |

---

### 14.8 最終口訣

```text
Gemini 看畫面
ChatGPT 做決策
DeepSeek 抓 code bug
Claude 防止亂改
Cursor 負責落地
```

操作口訣：

```text
Alt+C：抓目前這邊
Alt+V：轉成 Cursor 任務
Ctrl+V：貼上
Alt+S：整段 session
```
