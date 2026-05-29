// ==UserScript==
// @name         AI Prompt Bridge
// @namespace    https://ai-prompt-bridge.local/ai-prompt-bridge
<<<<<<< HEAD
// @version      1.4.0
// @description  Cross-AI prompt bridge for ChatGPT, Gemini, Claude, DeepSeek, Qwen, Perplexity and Cursor workflows. Adds project presets, smart project detection, and project-aware prompts.
=======
// @version      1.6.0
// @description  Cross-AI prompt bridge for ChatGPT, Gemini, Claude, DeepSeek, Qwen, Perplexity and Cursor workflows. Adds full-session rich-text copy for Word / OneNote / Outlook.
>>>>>>> 0f40809 (feat: add full-session rich text copy)
// @author       Rossi
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @match        https://claude.ai/*
// @match        https://chat.deepseek.com/*
// @match        https://www.perplexity.ai/*
// @match        https://chat.qwen.ai/*
// @match        https://qwenlm.github.io/*
// @match        https://www.cursor.com/*
// @match        https://cursor.com/*
// @include      https://*.chatgpt.com/*
// @include      https://*.gemini.google.com/*
// @include      https://*.claude.ai/*
// @include      https://*.deepseek.com/*
// @include      https://*.perplexity.ai/*
// @include      https://*.qwen.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

<<<<<<< HEAD
    const AI_PROMPT_BRIDGE_VERSION = "1.4.0";
=======
    const AI_PROMPT_BRIDGE_VERSION = "1.6.0";
>>>>>>> 0f40809 (feat: add full-session rich text copy)
    console.log("[AI Prompt Bridge] injected", AI_PROMPT_BRIDGE_VERSION, location.href);

    function showStartupProbe() {
        try {
            const probeId = "ai-prompt-bridge-startup-probe";
            if (document.getElementById(probeId)) return;
            const probe = document.createElement("div");
            probe.id = probeId;
            probe.textContent = "AI Prompt Bridge loaded";
            probe.style.position = "fixed";
            probe.style.left = "12px";
            probe.style.bottom = "12px";
            probe.style.zIndex = "2147483647";
            probe.style.background = "#111827";
            probe.style.color = "#fff";
            probe.style.padding = "8px 12px";
            probe.style.borderRadius = "10px";
            probe.style.fontSize = "12px";
            probe.style.fontFamily = "Arial, sans-serif";
            probe.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)";
            (document.body || document.documentElement).appendChild(probe);
            setTimeout(() => probe.remove(), 2500);
        } catch (error) {
            console.warn("[AI Prompt Bridge] startup probe failed", error);
        }
    }

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    }

<<<<<<< HEAD
    const STORAGE_KEY = "ai_prompt_bridge_payload_v14";
    const PANEL_POS_KEY = "ai_prompt_bridge_panel_position_v14";
    const PANEL_ID = "ai-prompt-bridge-panel-v14";
    const BUBBLE_ID = "ai-prompt-bridge-restore-bubble-v14";
    const COLLAPSED_KEY = "ai_prompt_bridge_collapsed_v14";
    const HIDDEN_KEY = "ai_prompt_bridge_hidden_v14";
    const PROJECT_KEY = "ai_prompt_bridge_project_key_v14";
=======
    const STORAGE_KEY = "ai_prompt_bridge_payload_v16";
    const PANEL_POS_KEY = "ai_prompt_bridge_panel_position_v16";
    const PANEL_ID = "ai-prompt-bridge-panel-v16";
    const BUBBLE_ID = "ai-prompt-bridge-restore-bubble-v16";
    const COLLAPSED_KEY = "ai_prompt_bridge_collapsed_v16";
    const HIDDEN_KEY = "ai_prompt_bridge_hidden_v16";
    const PROJECT_KEY = "ai_prompt_bridge_project_key_v16";
>>>>>>> 0f40809 (feat: add full-session rich text copy)

    const PROJECTS = {
        auto: {
            name: "Auto Detect",
            path: "",
            techStack: "依頁面內容自動判斷專案。",
            goldenRules: "若無法判斷專案，使用通用最高原則：不可破壞既有功能、只做最小修改、完整檔案輸出。",
            testCommands: "",
            docsTargets: "README.md / docs / .cursor/rules",
            keywords: []
        },
        mp3: {
            name: "mp3_auto_edit / Music Studio",
            path: "D:/code/Claude/mp3_auto_edit/music_manager_GUI",
            techStack: "Python 3.x, Tkinter / GUI, Mutagen, Pydub, ffmpeg, SQLite, Multithreading",
            goldenRules: [
                "必須嚴格處理 Windows 中文路徑、特殊字元、長路徑與非英文檔名。",
                "所有耗時音訊解碼、掃描、ReplayGain、歌詞搜尋、特徵分析都不可阻塞 Tkinter 主執行緒。",
                "GUI 元件更新必須回到主執行緒，不可由 worker thread 直接改 UI。",
                "不可破壞既有音樂庫掃描、播放、歌詞、ReplayGain、整理、匯出功能。",
                "修 progress / ETA / cancel / status bar 時必須保留取消、進度、耗時、預估時間與狀態列。",
                "必須避免壞檔、重複檔、collision、repair queue 造成資料遺失。"
            ].join("\n"),
            testCommands: [
                "python app.py",
                "python -m pytest",
                "手動測試：掃描 D:/Music、重建索引、播放、歌詞、ReplayGain、取消長任務、中文檔名"
            ].join("\n"),
            docsTargets: "README.md / docs/BUGFIX_LOG.md / docs/DESIGN_DECISIONS.md / .cursor/rules/python-gui-threading.mdc",
            keywords: ["mp3", "music studio", "music_manager", "lyrics", "replaygain", "mutagen", "pydub", "tkinter", "音樂", "歌詞"]
        },
        downloader: {
            name: "media-batch-downloader",
            path: "D:/code/Claude/media-batch-downloader",
            techStack: "Python, Tkinter GUI, yt-dlp, Playwright, requests, cookies, batch downloader, file I/O",
            goldenRules: [
                "不影響現有正常下載功能，尤其 Instagram / Facebook 已成功流程不可改壞。",
                "Facebook 多圖貼文不可少抓；未達 expected count 不可標 SUCCESS。",
                "下載失敗必須保留可重試狀態、明確錯誤原因與 log。",
                "嚴格處理 Windows 檔名限制與路徑限制，過濾冒號、星號、問號、雙引號、角括號、直線等 Windows 禁用字元。",
                "不可提供簡化版、閹割版或回退版；必須基於目前完整檔案做最小修改。",
                "cookies / Playwright / yt-dlp fallback 行為不可互相覆蓋有效結果。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "python -m pytest",
                "手動測試：Instagram 圖文、Instagram Reel、Facebook 多圖、Facebook Reel、失敗 retry、cookies 更新"
            ].join("\n"),
            docsTargets: "README.md / docs/BUGFIX_LOG.md / docs/DOWNLOAD_FLOW.md / .cursor/rules/downloader-project.mdc",
            keywords: ["downloader", "instagram", "facebook", "yt-dlp", "playwright", "cookies", "download", "reel", "多圖"]
        },
        quant: {
            name: "TW-Quant-Cockpit",
            path: "D:/code/Claude/tw_quant_cockpit",
            techStack: "Python, Pandas, FinMind, Shioaji, SQLite / Parquet, backtesting, screener, GUI dashboard",
            goldenRules: [
                "嚴格防止時間序列 look-ahead bias，不可偷看未來資料。",
                "回測與特徵工程必須清楚區分 train / validation / test / walk-forward。",
                "DataFrame 大量運算優先向量化，避免慢速 for loop。",
                "交易 API / 資料 API 必須處理 rate limit、timeout、斷線與重試。",
                "不能把 mock / demo 結果誤標成真實績效。",
                "任何策略輸出都要標明資料不足、風險、假設與限制。"
            ].join("\n"),
            testCommands: [
                "python main.py cockpit",
                "python main.py pipeline",
                "python -m pytest",
                "手動測試：下載資料、features、screener、backtest、dashboard"
            ].join("\n"),
            docsTargets: "README.md / docs/STRATEGY_LOG.md / docs/BACKTEST_NOTES.md / .cursor/rules/quant-project.mdc",
            keywords: ["quant", "tw quant", "台股", "stock", "trading", "backtest", "finmind", "shioaji", "pandas"]
        },
        media2txt: {
            name: "Media2Txt-Pro",
            path: "D:/code/Claude/Media2Txt-Pro-Community",
            techStack: "Python, PyQt / Qt, faster-whisper, ffmpeg, CUDA / CPU fallback, local offline model",
            goldenRules: [
                "本地 offline mode 不可被改壞，WHISPER_MODEL_DIR 與 MEDIA2TXT_OFFLINE 必須保留。",
                "GPU / CPU fallback 必須穩定，CUDA 失敗時不可直接中斷整個 app。",
                "長時間轉檔不可阻塞 GUI；進度、取消、ETA、log 必須可用。",
                "ffmpeg 路徑偵測需支援 JDownloader tools 與手動設定。",
                "不可刪除現有轉檔、摘要、字幕、模型設定與啟動檢查功能。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "run.bat",
                "手動測試：短影片、長影片、CPU fallback、GPU 模式、ffmpeg 偵測、清除暫存"
            ].join("\n"),
            docsTargets: "README.md / docs/RUNTIME.md / docs/BUGFIX_LOG.md / .cursor/rules/media2txt-project.mdc",
            keywords: ["media2txt", "whisper", "faster-whisper", "ffmpeg", "subtitle", "轉文字", "轉檔"]
        },
        smartcleaner: {
            name: "SmartCleanerPro",
            path: "D:/code/Claude/SmartCleanerPro",
            techStack: "Python, Tkinter / Windows registry, system cleanup, BSOD risk analysis, crash dump config",
            goldenRules: [
                "任何系統設定修改必須可回復，不能破壞 Windows 正常啟動與網路。",
                "涉及 registry、TEMP、CrashDump、pagefile 時必須明確列出風險與備份方式。",
                "不可自動刪除使用者重要資料；清理功能必須區分安全 / 風險項目。",
                "BSOD 分析只能做風險提示，不能假裝已百分百診斷硬體故障。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "python -m pytest",
                "手動測試：風險分析、IO diversion、清理預覽、取消操作"
            ].join("\n"),
            docsTargets: "README.md / docs/STABILITY.md / docs/BUGFIX_LOG.md / .cursor/rules/smartcleaner-project.mdc",
            keywords: ["smartcleaner", "bsod", "crashdump", "temp", "pagefile", "registry", "穩定性"]
        },
        generic: {
            name: "Generic Project",
            path: "",
            techStack: "未指定。請根據使用者提供的專案內容、檔案與 log 判斷。",
            goldenRules: [
                "原本可用功能不可被改壞。",
                "只針對指定異常做最小範圍修正。",
                "不可提供簡化版、閹割版、回退版。",
                "若提供程式碼，必須提供完整檔案，可直接覆蓋。",
                "必須列出測試方式、風險與可能 regression。"
            ].join("\n"),
            testCommands: "依專案 README / package / requirements / pyproject / 測試檔判斷。",
            docsTargets: "README.md / docs / CHANGELOG.md / .cursor/rules",
            keywords: []
        }
    };

    let selectedProjectKey = "auto";
    try {
        const storedProject = GM_getValue(PROJECT_KEY, "auto");
        if (typeof storedProject === "string" && PROJECTS[storedProject]) {
            selectedProjectKey = storedProject;
        }
    } catch (error) {
        selectedProjectKey = "auto";
    }


    function nowText() {
        const d = new Date();
        return d.toISOString().replace("T", " ").slice(0, 19);
    }

    function safeText(value) {
        return String(value || "");
    }

    function stripAnsi(text) {
        return safeText(text).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
    }

    function normalizeText(text) {
        return stripAnsi(text)
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n{5,}/g, "\n\n\n")
            .trim();
    }

    function getSiteName() {
        const host = location.hostname;
        if (host.includes("chatgpt") || host.includes("openai")) return "ChatGPT";
        if (host.includes("gemini")) return "Gemini";
        if (host.includes("claude")) return "Claude";
        if (host.includes("deepseek")) return "DeepSeek";
        if (host.includes("perplexity")) return "Perplexity";
        if (host.includes("qwen")) return "Qwen";
        if (host.includes("cursor")) return "Cursor";
        return host;
    }

    function extractCodeBlocks(text) {
        const cleaned = normalizeText(text);
        const blocks = [];
        const re = /```(?:python|py|javascript|js|typescript|ts|json|html|css|bash|powershell|text)?\s*([\s\S]*?)```/gi;
        let match;

        while ((match = re.exec(cleaned)) !== null) {
            const code = normalizeText(match[1]);
            if (code) {
                blocks.push(code);
            }
        }

        return blocks;
    }

    function preferCodeOrText(text) {
        const cleaned = normalizeText(text);
        const blocks = extractCodeBlocks(cleaned);

        if (blocks.length > 0) {
            return blocks.join("\n\n--- CODE BLOCK ---\n\n");
        }

        return cleaned;
    }

    function getSelectedText() {
        const selected = window.getSelection ? String(window.getSelection()).trim() : "";
        if (selected) {
            return selected;
        }

        const active = document.activeElement;
        if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
            const value = active.value || "";
            const start = active.selectionStart ?? 0;
            const end = active.selectionEnd ?? value.length;
            return value.substring(start, end).trim() || value.trim();
        }

        return "";
    }

    function getVisibleText(element) {
        if (!element) {
            return "";
        }

        const text = element.innerText || element.textContent || "";
        return normalizeText(text);
    }

    function pickLastNonEmpty(elements, minLength = 20) {
        const arr = Array.from(elements || []);

        for (let i = arr.length - 1; i >= 0; i--) {
            const text = getVisibleText(arr[i]);
            if (text && text.length >= minLength) {
                return text;
            }
        }

        return "";
    }

    function getLastBySelectors(selectors) {
        for (const selector of selectors) {
            const text = pickLastNonEmpty(document.querySelectorAll(selector));
            if (text) {
                return text;
            }
        }
        return "";
    }

    function getLastChatGPTAnswer() {
        return getLastBySelectors([
            '[data-message-author-role="assistant"]',
            '[data-testid*="conversation-turn"]',
            ".markdown",
            ".prose"
        ]);
    }

    function getLastGeminiAnswer() {
        return getLastBySelectors([
            "message-content",
            ".message-content",
            "[data-response-index]",
            ".model-response-text",
            ".markdown",
            ".response-container"
        ]);
    }

    function getLastClaudeAnswer() {
        return getLastBySelectors([
            '[data-testid="conversation-turn"]',
            ".font-claude-message",
            ".prose",
            ".markdown"
        ]);
    }

    function getLastDeepSeekAnswer() {
        return getLastBySelectors([
            ".ds-markdown",
            ".markdown",
            ".message",
            ".prose"
        ]);
    }

    function getLastPerplexityAnswer() {
        return getLastBySelectors([
            "article",
            ".prose",
            ".markdown",
            "[data-testid*='answer']"
        ]);
    }

    function getGenericAnswer() {
        const text = getLastBySelectors([
            ".markdown",
            ".prose",
            "article",
            "[role='article']",
            "[data-testid*='message']",
            ".message",
            ".answer",
            "main"
        ]);

        return text || normalizeText(document.body.innerText || "");
    }

    function getLastAnswer() {
        const selected = getSelectedText();
        if (selected) {
            return selected;
        }

        const site = getSiteName();

        if (site === "ChatGPT") return getLastChatGPTAnswer() || getGenericAnswer();
        if (site === "Gemini") return getLastGeminiAnswer() || getGenericAnswer();
        if (site === "Claude") return getLastClaudeAnswer() || getGenericAnswer();
        if (site === "DeepSeek") return getLastDeepSeekAnswer() || getGenericAnswer();
        if (site === "Perplexity") return getLastPerplexityAnswer() || getGenericAnswer();

        return getGenericAnswer();
    }

    function collectVisibleBlocks(selectors, minLength = 8) {
        const seen = new Set();
        const rows = [];

        selectors.forEach((selector) => {
            Array.from(document.querySelectorAll(selector)).forEach((element) => {
                const text = normalizeText(element.innerText || element.textContent || "");
                if (!text || text.length < minLength) return;

                const key = text.slice(0, 300);
                if (seen.has(key)) return;

                seen.add(key);
                rows.push(text);
            });
        });

        return rows;
    }

    function getChatGPTSession() {
        const turns = Array.from(document.querySelectorAll('[data-message-author-role]'));
        const rows = [];
        const seen = new Set();

        turns.forEach((element) => {
            const role = element.getAttribute("data-message-author-role") || "message";
            const text = normalizeText(element.innerText || element.textContent || "");
            if (!text || text.length < 2) return;

            const key = `${role}:${text.slice(0, 300)}`;
            if (seen.has(key)) return;

            seen.add(key);
            rows.push(`## ${role.toUpperCase()}\n${text}`);
        });

        if (rows.length > 0) {
            return rows.join("\n\n---\n\n");
        }

        return collectVisibleBlocks([
            '[data-testid*="conversation-turn"]',
            '[data-message-author-role="assistant"]',
            ".markdown",
            ".prose"
        ]).join("\n\n---\n\n");
    }

    function getGeminiSession() {
        const rows = collectVisibleBlocks([
            "message-content",
            ".message-content",
            "[data-response-index]",
            ".model-response-text",
            ".response-container",
            ".markdown"
        ]);

        return rows.join("\n\n---\n\n");
    }

    function getClaudeSession() {
        const rows = collectVisibleBlocks([
            '[data-testid="conversation-turn"]',
            ".font-claude-message",
            ".prose",
            ".markdown"
        ]);

        return rows.join("\n\n---\n\n");
    }

    function getDeepSeekSession() {
        const rows = collectVisibleBlocks([
            ".ds-markdown",
            ".markdown",
            ".message",
            ".prose"
        ]);

        return rows.join("\n\n---\n\n");
    }

    function getPerplexitySession() {
        const rows = collectVisibleBlocks([
            "article",
            ".prose",
            ".markdown",
            "[data-testid*='answer']"
        ]);

        return rows.join("\n\n---\n\n");
    }

    function getGenericSession() {
        const candidates = [
            document.querySelector("main"),
            document.querySelector('[role="main"]'),
            document.querySelector('[data-testid*="conversation"]'),
            document.querySelector(".conversation"),
            document.querySelector(".chat"),
            document.body
        ].filter(Boolean);

        let best = "";

        candidates.forEach((element) => {
            const text = normalizeText(element.innerText || element.textContent || "");
            if (text.length > best.length) {
                best = text;
            }
        });

        return best;
    }

    function getCurrentSessionText() {
        const site = getSiteName();

        let structuredContent = "";
        if (site === "ChatGPT") structuredContent = getChatGPTSession();
        if (site === "Gemini") structuredContent = getGeminiSession();
        if (site === "Claude") structuredContent = getClaudeSession();
        if (site === "DeepSeek") structuredContent = getDeepSeekSession();
        if (site === "Perplexity") structuredContent = getPerplexitySession();

        const genericContent = getGenericSession();

        // Use the longer result because some AI sites virtualize or change message selectors.
        // Manual Ctrl+A often follows the rendered page text, which is closer to genericContent.
        let content = structuredContent;
        if (genericContent && genericContent.length > structuredContent.length * 1.25) {
            content = genericContent;
        }

        if (!content) {
            content = genericContent || structuredContent;
        }

        const header = [
            `# Full Session Export`,
            `Source: ${site}`,
            `Captured_At: ${nowText()}`,
            `URL: ${location.href}`
        ].join("\n");

        return normalizeText(`${header}\n\n${content}`);
    }

    async function gmSet(key, value) {
        const result = GM_setValue(key, value);
        if (result && typeof result.then === "function") {
            await result;
        }
    }

    async function gmGet(key, fallbackValue) {
        const result = GM_getValue(key, fallbackValue);
        if (result && typeof result.then === "function") {
            return await result;
        }
        return result;
    }

    async function hasPayload() {
        const payload = await gmGet(STORAGE_KEY, null);
        return Boolean(payload && payload.content);
    }

    async function savePayload(text, sourceType = "last-answer", options = {}) {
        const preserveRaw = Boolean(options.preserveRaw);

        const payload = {
            source: getSiteName(),
            sourceUrl: location.href,
            sourceType,
            createdAt: nowText(),
            content: preserveRaw ? normalizeText(text) : preferCodeOrText(text)
        };

        await gmSet(STORAGE_KEY, payload);
        await updateStatus();
        return payload;
    }

    async function loadPayload() {
        return await gmGet(STORAGE_KEY, null);
    }

    function copyText(text, message = "已複製到剪貼簿") {
        GM_setClipboard(text, "text");
        toast(message);
    }

    function getProjectTextSource(payload = null) {
        return [
            safeText(document.title),
            safeText(document.body?.innerText).slice(0, 9000),
            safeText(payload?.content).slice(0, 12000)
        ].join(" ").toLowerCase();
    }

    function detectCurrentProjectKey(payload = null) {
        const text = getProjectTextSource(payload);

        for (const [key, project] of Object.entries(PROJECTS)) {
            if (key === "auto" || key === "generic") continue;
            if ((project.keywords || []).some((keyword) => text.includes(String(keyword).toLowerCase()))) {
                return key;
            }
        }

        return "generic";
    }

    function getActiveProjectKey(payload = null) {
        if (selectedProjectKey && selectedProjectKey !== "auto" && PROJECTS[selectedProjectKey]) {
            return selectedProjectKey;
        }
        return detectCurrentProjectKey(payload);
    }

    function getActiveProject(payload = null) {
        const key = getActiveProjectKey(payload);
        return PROJECTS[key] || PROJECTS.generic;
    }

    function buildProjectContext(payload = null) {
        const key = getActiveProjectKey(payload);
        const project = getActiveProject(payload);
        const mode = selectedProjectKey === "auto" ? `auto-detect:${key}` : `manual:${key}`;

        return [
            `Project_Mode: ${mode}`,
            `Project_Name: ${project.name}`,
            project.path ? `Project_Path: ${project.path}` : "",
            `Tech_Stack: ${project.techStack}`,
            `Critical_Rules:\n${project.goldenRules}`,
            project.testCommands ? `Test_Commands:\n${project.testCommands}` : "",
            project.docsTargets ? `Docs_Targets: ${project.docsTargets}` : ""
        ].filter(Boolean).join("\n");
    }

    function makeHeader(payload, projectPathOverride = "") {
        const projectContext = buildProjectContext(payload);
        const overrideLine = projectPathOverride ? `Project_Path_Override: ${projectPathOverride}` : "";

        return [
            `Source: ${payload?.source || getSiteName()}`,
            `Captured_At: ${payload?.createdAt || nowText()}`,
            payload?.sourceUrl ? `Source_URL: ${payload.sourceUrl}` : "",
            projectContext,
            overrideLine
        ].filter(Boolean).join("\n");
    }

    function createProjectSelector() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "4px";
        wrapper.style.marginBottom = "4px";

        const label = document.createElement("div");
        label.textContent = "Project Context";
        label.style.fontSize = "11px";
        label.style.color = "#d1d5db";
        label.style.fontWeight = "700";

        const select = document.createElement("select");
        select.style.width = "100%";
        select.style.padding = "6px 8px";
        select.style.borderRadius = "8px";
        select.style.border = "1px solid #374151";
        select.style.background = "#030712";
        select.style.color = "#fff";
        select.style.fontSize = "12px";

        Object.entries(PROJECTS).forEach(([key, project]) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key === "auto" ? "Auto Detect" : project.name;
            select.appendChild(option);
        });

        select.value = selectedProjectKey || "auto";

        select.addEventListener("change", async () => {
            selectedProjectKey = select.value;
            await gmSet(PROJECT_KEY, selectedProjectKey);
            toast(`Project: ${PROJECTS[selectedProjectKey]?.name || selectedProjectKey}`);
            await updateStatus();
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        return wrapper;
    }

    function buildVisualReview(payload) {
        const content = payload?.content || "";

        return [
            makeHeader(payload),
            "",
            "你是 UI / UX 視覺檢查專家。",
            "",
            "請只針對 UI / 截圖 / 視覺問題分析，不要直接重寫程式碼。",
            "請同時參考上方 Project_Context 的技術棧、Critical_Rules 與 Docs_Targets。",
            "",
            "請輸出：",
            "1. 哪個 icon / label / spacing / font / alignment 有問題",
            "2. 可能是哪個 layout / style / setText / widget 建立邏輯造成",
            "3. 需要工程師檢查的檔案或函式",
            "4. 最小修正策略",
            "5. 可能 regression 風險",
            "",
            "內容：",
            "```text",
            content,
            "```"
        ].join("\n");
    }

    function buildCodeReview(payload) {
        const content = payload?.content || "";

        return [
            makeHeader(payload),
            "",
            "你是嚴格的 code reviewer。",
            "",
            "請針對以下內容做攻擊性 review，並套用上方 Project_Context 的專案禁忌與測試指令：",
            "1. 找出 bug / regression 風險",
            "2. 找出 thread-safety / encoding / Windows path / file I/O 風險",
            "3. 不要重寫整個專案",
            "4. 只提出最小修改建議",
            "5. 若提供 code，必須提供完整檔案，不要片段",
            "",
            "內容：",
            "```text",
            content,
            "```"
        ].join("\n");
    }

    function buildCursorFix(payload) {
        const content = payload?.content || "";

        return [
            makeHeader(payload),
            "",
            "請根據以下多模型結論修正目前 Cursor 專案。請務必套用上方 Project_Context：Project_Path、Tech_Stack、Critical_Rules、Test_Commands、Docs_Targets。",
            "",
            "最高原則：",
            "1. 原本可用功能不可被改壞。",
            "2. 只針對指定異常做最小範圍修正。",
            "3. 不可刪除既有功能。",
            "4. 不可提供簡化版、閹割版、回退版。",
            "5. 必須以目前專案現有完整檔案為基準修改。",
            "6. 若提供程式碼，必須提供完整檔案，可直接覆蓋。",
            "",
            "請先列出：",
            "1. 需要修改的檔案",
            "2. 最小修改策略",
            "3. 可能 regression 風險",
            "4. 測試方式",
            "",
            "多模型結論 / 暫存內容：",
            "```text",
            content,
            "```"
        ].join("\n");
    }

    function buildRule(payload) {
        const content = payload?.content || "";

        return [
            makeHeader(payload),
            "",
            "請把以下多模型討論結論整理成 Cursor Project Rule，並納入上方 Project_Context 的專案路徑、技術棧、禁忌與測試方式。",
            "",
            "輸出格式必須適合存成 .cursor/rules/*.mdc。",
            "",
            "必須包含：",
            "1. Rule title",
            "2. Last_Updated",
            "3. Fix_Reason",
            "4. Source",
            "5. Rules 條列",
            "",
            "要求：",
            "- 規則要具體、可執行",
            "- 要避免模型重寫整個專案",
            "- 要強調完整檔案輸出",
            "- 要保留既有功能",
            "",
            "討論結論：",
            "```text",
            content,
            "```"
        ].join("\n");
    }

    function buildOneNotePrompt(payload) {
        const content = payload?.content || "";

        return [
            makeHeader(payload),
            "",
            "請把以下內容整理成「可直接貼到 OneNote / Notion / Markdown」的決策筆記。請同時納入上方 Project_Context，尤其是專案路徑、不可破壞原則、測試指令與 docs 同步位置。",
            "",
            "整理原則：",
            "1. 不要保留廢話。",
            "2. 不要逐字摘要，請整理成可執行筆記。",
            "3. 保留最終結論、具體步驟、風險、待辦。",
            "4. 如果是專案內容，請補上可同步到 README.md / docs 的版本。",
            "5. 如果有指令、Prompt、Git commit、測試步驟，請用 code block 保留。",
            "6. 如果內容有多個模型意見，請標記來源：ChatGPT / Gemini / DeepSeek / Claude / Perplexity / 我的最終決策。",
            "7. 若資訊不足，請列在「未確認風險」。",
            "",
            "輸出格式必須如下：",
            "",
            "# 主題",
            "",
            "## 1. 最終結論",
            "-",
            "",
            "## 2. 背景",
            "-",
            "",
            "## 3. 適用情境",
            "-",
            "",
            "## 4. 可執行步驟",
            "1.",
            "2.",
            "3.",
            "",
            "## 5. 不可破壞原則 / 保留原則",
            "-",
            "",
            "## 6. 指令 / Prompt / Git Commit / 測試步驟",
            "```text",
            "",
            "```",
            "",
            "## 7. 風險與注意事項",
            "-",
            "",
            "## 8. 下一步待辦",
            "- [ ]",
            "- [ ]",
            "",
            "## 9. 可同步到 README / docs 的內容",
            "-",
            "",
            "## 10. 來源",
            "- Source:",
            "- Date:",
            "- AI:",
            "",
            "原始內容：",
            "```text",
            content,
            "```"
        ].join("\\n");
    }


    function getSelectionHtml() {
        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || String(selection).trim().length === 0) {
                return null;
            }

            const container = document.createElement("div");
            for (let i = 0; i < selection.rangeCount; i += 1) {
                container.appendChild(selection.getRangeAt(i).cloneContents());
            }

            if (!normalizeText(container.innerText || container.textContent || "")) {
                return null;
            }

            return container;
        } catch (error) {
            console.warn("[AI Prompt Bridge] selection html failed", error);
            return null;
        }
    }

    function getLatestAnswerElement() {
        const site = getSiteName();
        let selectors = [];

        if (site === "ChatGPT") {
            selectors = [
                '[data-message-author-role="assistant"] .markdown',
                '[data-message-author-role="assistant"]',
                ".agent-turn .markdown",
                ".markdown"
            ];
        } else if (site === "Gemini") {
            selectors = [
                "message-content",
                ".message-content",
                "model-response",
                "render-viewer",
                "[data-response-index]",
                ".conversation-container"
            ];
        } else if (site === "Claude") {
            selectors = [
                '[data-testid*="message"]',
                ".font-claude-message",
                ".prose",
                "[class*='message']"
            ];
        } else if (site === "DeepSeek") {
            selectors = [
                ".ds-markdown",
                ".markdown",
                "[class*='markdown']",
                "[class*='message']"
            ];
        } else if (site === "Perplexity") {
            selectors = [
                ".prose",
                "[class*='answer']",
                "[class*='markdown']"
            ];
        } else {
            selectors = [
                ".markdown",
                ".prose",
                "[class*='markdown']",
                "[class*='message']",
                "main"
            ];
        }

        const candidates = [];
        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => {
                    const text = normalizeText(element.innerText || element.textContent || "");
                    if (text.length > 20) {
                        candidates.push({ element, textLength: text.length });
                    }
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] selector failed", selector, error);
            }
        });

        if (candidates.length === 0) {
            return null;
        }

        return candidates[candidates.length - 1].element;
    }


    function getSessionRootElement() {
        const site = getSiteName();
        let selectors = [];

        if (site === "ChatGPT") {
            selectors = [
                "main",
                '[role="main"]',
                '[data-testid*="conversation"]',
                ".conversation"
            ];
        } else if (site === "Gemini") {
            selectors = [
                "main",
                '[role="main"]',
                ".conversation-container",
                "bard-sidenav-content",
                "chat-window"
            ];
        } else if (site === "Claude") {
            selectors = [
                "main",
                '[role="main"]',
                ".conversation",
                "[class*='conversation']"
            ];
        } else if (site === "DeepSeek") {
            selectors = [
                "main",
                '[role="main"]',
                "[class*='chat']",
                "[class*='conversation']"
            ];
        } else if (site === "Perplexity") {
            selectors = [
                "main",
                '[role="main"]',
                "[class*='thread']",
                "[class*='answer']"
            ];
        } else {
            selectors = [
                "main",
                '[role="main"]',
                "article",
                ".prose",
                ".markdown",
                "body"
            ];
        }

        const candidates = [];

        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => {
                    const text = normalizeText(element.innerText || element.textContent || "");
                    if (text.length > 50) {
                        candidates.push({
                            element,
                            textLength: text.length
                        });
                    }
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] session selector failed", selector, error);
            }
        });

        if (candidates.length === 0) {
            return document.body || document.documentElement;
        }

        candidates.sort((a, b) => b.textLength - a.textLength);
        return candidates[0].element;
    }

    function pruneRichSessionClone(clone) {
        const site = getSiteName();

        const removeSelectors = [
            `#${PANEL_ID}`,
            `#${BUBBLE_ID}`,
            "#ai-prompt-bridge-startup-probe",
            "aside",
            "nav",
            "header",
            "footer",
            "form",
            "textarea",
            "input",
            "select",
            "button",
            "svg",
            "script",
            "style",
            "noscript",
            "[contenteditable='true']",
            "[data-testid*='sidebar']",
            "[data-testid*='composer']",
            "[data-testid*='copy']",
            "[aria-label*='Copy']",
            "[aria-label*='複製']",
            "[aria-label*='Send']",
            "[aria-label*='送出']",
            ".copy-button",
            ".code-copy-button",
            ".sr-only"
        ];

        removeSelectors.forEach((selector) => {
            try {
                clone.querySelectorAll(selector).forEach((el) => el.remove());
            } catch (_) {}
        });

        const transcriptSelectorsBySite = {
            ChatGPT: [
                '[data-message-author-role]',
                ".agent-turn",
                ".markdown"
            ],
            Gemini: [
                "user-query",
                "message-content",
                ".message-content",
                "model-response",
                "render-viewer"
            ],
            Claude: [
                '[data-testid*="user-message"]',
                '[data-testid*="assistant-message"]',
                '[data-testid*="message"]',
                ".prose"
            ],
            DeepSeek: [
                ".ds-markdown",
                ".markdown",
                "[class*='message']"
            ],
            Perplexity: [
                ".prose",
                "[class*='answer']",
                "[class*='query']"
            ]
        };

        const transcriptSelectors = transcriptSelectorsBySite[site] || [];
        const transcriptNodes = [];

        transcriptSelectors.forEach((selector) => {
            try {
                clone.querySelectorAll(selector).forEach((node) => {
                    const text = normalizeText(node.innerText || node.textContent || "");
                    if (text.length > 10 && !transcriptNodes.includes(node)) {
                        transcriptNodes.push(node);
                    }
                });
            } catch (_) {}
        });

        if (transcriptNodes.length >= 2) {
            const transcript = document.createElement("div");
            transcriptNodes.forEach((node, index) => {
                const block = document.createElement("section");
                block.setAttribute("data-ai-prompt-bridge-message", String(index + 1));
                block.appendChild(node.cloneNode(true));
                transcript.appendChild(block);
            });
            return transcript;
        }

        return clone;
    }

    async function copyFullSessionRichTextForOffice() {
        const sessionRoot = getSessionRootElement();

        if (!sessionRoot) {
            alert("沒有找到可複製的完整 session。請確認目前頁面已有對話內容。");
            return;
        }

        let clone = cleanRichClone(sessionRoot);
        clone = pruneRichSessionClone(clone);

        const textContent = normalizeText(clone.innerText || clone.textContent || "");

        if (!textContent || textContent.length < 20) {
            alert("抓到的 session 內容太短。請先往上捲動載入舊訊息，再按 Alt+Shift+W。");
            return;
        }

        const headerHtml = [
            `<h1>AI Session Export</h1>`,
            `<p><strong>Source:</strong> ${escapeHtml(getSiteName())}</p>`,
            `<p><strong>Captured At:</strong> ${escapeHtml(nowText())}</p>`,
            `<p><strong>URL:</strong> ${escapeHtml(location.href)}</p>`,
            `<hr>`
        ].join("");

        const htmlContent = normalizeRichHtml(headerHtml + (clone.innerHTML || `<pre>${escapeHtml(textContent)}</pre>`));

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([
                            [
                                "# AI Session Export",
                                `Source: ${getSiteName()}`,
                                `Captured_At: ${nowText()}`,
                                `URL: ${location.href}`,
                                "",
                                textContent
                            ].join("\n")
                        ], { type: "text/plain" })
                    })
                ]);
                toast(`已複製完整 Session 富文本格式（${textContent.length} 字）`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] full-session rich clipboard failed, fallback to plain text", error);
        }

        await copyText([
            "# AI Session Export",
            `Source: ${getSiteName()}`,
            `Captured_At: ${nowText()}`,
            `URL: ${location.href}`,
            "",
            textContent
        ].join("\n"), `已降級複製完整 Session 純文字（${textContent.length} 字）`);
    }


    function cleanRichClone(inputElement) {
        const clone = inputElement.cloneNode(true);

        const removeSelectors = [
            "button",
            "svg",
            "script",
            "style",
            "noscript",
            "textarea",
            "input",
            "select",
            "nav",
            "header",
            "footer",
            "[contenteditable='true']",
            "[data-testid*='copy']",
            "[aria-label*='Copy']",
            "[aria-label*='複製']",
            ".copy-button",
            ".code-copy-button",
            ".sr-only"
        ];

        removeSelectors.forEach((selector) => {
            clone.querySelectorAll(selector).forEach((el) => el.remove());
        });

        clone.querySelectorAll("*").forEach((el) => {
            el.removeAttribute("class");
            el.removeAttribute("style");
            el.removeAttribute("data-testid");
            el.removeAttribute("aria-label");
            el.removeAttribute("role");

            if (el.tagName === "A") {
                const href = el.getAttribute("href");
                if (href && href.startsWith("/")) {
                    try {
                        el.setAttribute("href", new URL(href, location.origin).href);
                    } catch (_) {}
                }
            }
        });

        return clone;
    }

    function escapeHtml(value) {
        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function normalizeRichHtml(html) {
        const body = safeText(html).trim();

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
  font-family: Calibri, "Microsoft JhengHei", "Noto Sans TC", Arial, sans-serif;
  font-size: 11pt;
  color: #111827;
  background: #ffffff;
  line-height: 1.45;
}
h1, h2, h3, h4 {
  color: #111827;
  font-weight: 700;
  margin: 14px 0 8px;
}
p { margin: 6px 0; }
ul, ol { margin: 6px 0 6px 22px; }
li { margin: 3px 0; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}
th, td {
  border: 1px solid #d1d5db;
  padding: 6px 8px;
  vertical-align: top;
}
th {
  background: #f3f4f6;
  font-weight: 700;
}
pre {
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 8px;
  border-radius: 4px;
}
code {
  font-family: Consolas, "Courier New", monospace;
  background: #f3f4f6;
  padding: 1px 3px;
}
blockquote {
  border-left: 3px solid #d1d5db;
  margin: 8px 0;
  padding-left: 10px;
  color: #374151;
}
</style>
</head>
<body>
${body}
</body>
</html>`;
    }

    async function copyRichTextForOffice() {
        const selectedContainer = getSelectionHtml();
        const targetElement = selectedContainer || getLatestAnswerElement();

        if (!targetElement) {
            alert("沒有找到可複製的 AI 回答。請先選取內容，或確認目前頁面有 AI 回覆。");
            return;
        }

        const clone = cleanRichClone(targetElement);
        const textContent = normalizeText(clone.innerText || clone.textContent || "");

        if (!textContent) {
            alert("抓到的內容是空的，請改用手動選取後再按 Alt+W。");
            return;
        }

        const htmlContent = normalizeRichHtml(clone.innerHTML || `<pre>${escapeHtml(textContent)}</pre>`);

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([textContent], { type: "text/plain" })
                    })
                ]);
                toast(`已複製 Word / OneNote 富文本格式（${textContent.length} 字）`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] rich clipboard failed, fallback to plain text", error);
        }

        await copyText(textContent, `已降級複製純文字（${textContent.length} 字）`);
    }


    async function captureCurrentAnswer() {
        const selected = getSelectedText();
        const text = getLastAnswer();

        if (!text) {
            alert("沒有抓到內容。請先選取文字，或確認目前頁面有 AI 回覆。");
            return;
        }

        const payload = await savePayload(text, selected ? "selection" : "last-answer");

        copyText(payload.content, `已暫存並複製原文：${payload.source}`);
    }

    async function captureFullSession() {
        const text = getCurrentSessionText();

        if (!text || text.length < 20) {
            alert("沒有抓到完整 session。請確認頁面已有對話內容。");
            return;
        }

        // Full-session export must preserve raw text.
        // Do NOT run preferCodeOrText() here, otherwise any Markdown code block will cause
        // the exporter to keep only code blocks and drop normal conversation text.
        const payload = await savePayload(text, "full-session", { preserveRaw: true });
        copyText(payload.content, `已複製完整 Session：${payload.source}（${payload.content.length} 字）`);
    }

    async function copyRawPayload() {
        const payload = await loadPayload();
        if (!payload || !payload.content) {
            alert("暫存區是空的。請先在另一個 AI 回覆頁按 Alt+C 或點 ①。");
            return;
        }

        copyText(payload.content, "已複製暫存原文");
    }

    async function copyPrompt(builder, message = "已複製 Prompt 到剪貼簿") {
        const payload = await loadPayload();

        if (!payload || !payload.content) {
            alert("暫存區是空的。請先在另一個 AI 回覆頁按 Alt+C 或點 ①。");
            return;
        }

        copyText(builder(payload), message);
    }

    function createButton(label, onClick, color = "#374151") {
        const button = document.createElement("button");

        button.textContent = label;
        button.style.cursor = "pointer";
        button.style.border = "0";
        button.style.borderRadius = "8px";
        button.style.padding = "7px 9px";
        button.style.background = color;
        button.style.color = "#fff";
        button.style.textAlign = "left";
        button.style.fontSize = "12px";
        button.style.fontWeight = "600";
        button.style.width = "100%";

        button.addEventListener("click", onClick);
        return button;
    }

    async function savePanelPosition(panel) {
        const pos = {
            right: panel.style.right,
            bottom: panel.style.bottom,
            left: panel.style.left,
            top: panel.style.top
        };
        await gmSet(PANEL_POS_KEY, pos);
    }

    async function restorePanelPosition(panel) {
        const pos = await gmGet(PANEL_POS_KEY, null);

        if (!pos) {
            panel.style.right = "14px";
            panel.style.bottom = "14px";
            return;
        }

        panel.style.right = pos.right || "";
        panel.style.bottom = pos.bottom || "";
        panel.style.left = pos.left || "";
        panel.style.top = pos.top || "";
    }

    async function updateStatus() {
        const title = document.querySelector(`#${PANEL_ID} .ai-bridge-panel-title`);
        if (!title) {
            return;
        }

        const collapsed = await gmGet(COLLAPSED_KEY, false);
        const ready = await hasPayload();
        const status = ready ? "🟢" : "⚪";
        const projectLabel = selectedProjectKey && selectedProjectKey !== "auto" ? ` [${selectedProjectKey}]` : " [auto]";
        title.textContent = collapsed ? `AI Prompt ${status}${projectLabel} △` : `AI Prompt Bridge ${status}${projectLabel} ▽`;
    }

    async function setCollapsed(panel, content, collapsed) {
        content.style.display = collapsed ? "none" : "flex";
        panel.style.width = collapsed ? "154px" : "270px";
        await gmSet(COLLAPSED_KEY, collapsed);
        await updateStatus();
    }

    function ensureRestoreBubble() {
        let bubble = document.getElementById(BUBBLE_ID);
        if (bubble) {
            return bubble;
        }

        bubble = document.createElement("button");
        bubble.id = BUBBLE_ID;
        bubble.textContent = "R";
        bubble.title = "AI Prompt Bridge 已隱藏。點擊恢復面板，或按 Alt+B。";
        bubble.style.position = "fixed";
        bubble.style.right = "14px";
        bubble.style.bottom = "14px";
        bubble.style.zIndex = "10001";
        bubble.style.width = "42px";
        bubble.style.height = "42px";
        bubble.style.borderRadius = "999px";
        bubble.style.border = "0";
        bubble.style.background = "#10b981";
        bubble.style.color = "#fff";
        bubble.style.fontWeight = "800";
        bubble.style.fontSize = "18px";
        bubble.style.cursor = "pointer";
        bubble.style.boxShadow = "0 8px 24px rgba(0,0,0,.30)";
        bubble.style.display = "none";

        bubble.addEventListener("click", async () => {
            await showPanelAtDefaultPosition();
        });

        (document.body || document.documentElement).appendChild(bubble);
        return bubble;
    }

    function showBubble(show) {
        const bubble = ensureRestoreBubble();
        bubble.style.display = show ? "block" : "none";
    }

    async function resetPanelPosition(panel) {
        panel.style.left = "";
        panel.style.top = "";
        panel.style.right = "14px";
        panel.style.bottom = "14px";
        await savePanelPosition(panel);
    }

    async function showPanelAtDefaultPosition() {
        let panel = document.getElementById(PANEL_ID);

        if (!panel) {
            await gmSet(HIDDEN_KEY, false);
            await gmSet(PANEL_POS_KEY, null);
            await ensurePanel();
            panel = document.getElementById(PANEL_ID);
        }

        if (panel) {
            await resetPanelPosition(panel);
            panel.style.display = "block";
        }

        showBubble(false);
        await gmSet(HIDDEN_KEY, false);
        toast("面板已恢復");
    }

    async function setHidden(panel, hidden) {
        if (!panel) {
            panel = document.getElementById(PANEL_ID);
        }

        if (panel) {
            panel.style.display = hidden ? "none" : "block";
        }

        showBubble(hidden);
        await gmSet(HIDDEN_KEY, hidden);

        if (hidden) {
            toast("面板已隱藏，點右下 R 或 Alt+B 可恢復");
        } else {
            toast("面板已顯示");
        }
    }

    function makeDraggable(panel, dragHandle) {
        let isDragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        dragHandle.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return;

            isDragging = true;
            moved = false;
            startX = event.clientX;
            startY = event.clientY;

            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            panel.style.left = `${startLeft}px`;
            panel.style.top = `${startTop}px`;
            panel.style.right = "";
            panel.style.bottom = "";

            event.preventDefault();
        });

        document.addEventListener("mousemove", (event) => {
            if (!isDragging) return;

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                moved = true;
            }

            const nextLeft = Math.max(4, Math.min(window.innerWidth - 80, startLeft + dx));
            const nextTop = Math.max(4, Math.min(window.innerHeight - 40, startTop + dy));

            panel.style.left = `${nextLeft}px`;
            panel.style.top = `${nextTop}px`;
        });

        document.addEventListener("mouseup", async () => {
            if (!isDragging) return;
            isDragging = false;
            await savePanelPosition(panel);

            if (moved) {
                dragHandle.dataset.justDragged = "1";
                setTimeout(() => {
                    dragHandle.dataset.justDragged = "0";
                }, 150);
            }
        });
    }

    async function ensurePanel() {
        if (document.getElementById(PANEL_ID)) {
            await updateStatus();
            return;
        }

        const hidden = await gmGet(HIDDEN_KEY, false);
        const collapsed = await gmGet(COLLAPSED_KEY, false);
        showBubble(hidden);

        const panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.style.position = "fixed";
        panel.style.zIndex = "9999";
        panel.style.background = "#111827";
        panel.style.color = "#fff";
        panel.style.padding = "10px";
        panel.style.borderRadius = "12px";
        panel.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)";
        panel.style.fontFamily = "Arial, sans-serif";
        panel.style.maxWidth = "300px";
        panel.style.userSelect = "none";
        panel.style.display = hidden ? "none" : "block";

        await restorePanelPosition(panel);

        const title = document.createElement("div");
        title.className = "ai-bridge-panel-title";
        title.style.fontWeight = "700";
        title.style.fontSize = "13px";
        title.style.marginBottom = "6px";
        title.style.cursor = "grab";
        title.style.color = "#ffffff";
        title.title = "拖曳移動；點擊可收合 / 展開";

        const content = document.createElement("div");
        content.style.display = collapsed ? "none" : "flex";
        content.style.flexDirection = "column";
        content.style.gap = "6px";

        title.addEventListener("click", async (event) => {
            if (event.detail !== 1) return;
            if (title.dataset.justDragged === "1") return;
            const nextCollapsed = content.style.display !== "none";
            await setCollapsed(panel, content, nextCollapsed);
        });

        content.appendChild(createProjectSelector());
        content.appendChild(createButton("① 抓這邊並複製 Alt+C", captureCurrentAnswer, "#2563eb"));
        content.appendChild(createButton("② 複製暫存原文", copyRawPayload, "#4b5563"));
        content.appendChild(createButton("③ 給 Gemini 看 UI", () => copyPrompt(buildVisualReview, "已複製 Visual Review Prompt"), "#374151"));
        content.appendChild(createButton("④ 給對方審 Code", () => copyPrompt(buildCodeReview, "已複製 Code Review Prompt"), "#374151"));
        content.appendChild(createButton("⑤ 給 ChatGPT 轉 Cursor Alt+V", () => copyPrompt(buildCursorFix, "已複製 Cursor Fix Prompt"), "#059669"));
        content.appendChild(createButton("⑥ 變成 Cursor Rule", () => copyPrompt(buildRule, "已複製 Make Rule Prompt"), "#7c3aed"));
        content.appendChild(createButton("⑦ 複製整個 Session Alt+S", captureFullSession, "#be123c"));
        content.appendChild(createButton("⑨ 整理成 OneNote 筆記 Alt+N", () => copyPrompt(buildOneNotePrompt, "已複製 OneNote 筆記整理 Prompt"), "#d97706"));
        content.appendChild(createButton("⑩ 複製 Word/OneNote 格式 Alt+W", copyRichTextForOffice, "#0891b2"));
        content.appendChild(createButton("⑪ 複製整頁 Word/OneNote Alt+Shift+W", copyFullSessionRichTextForOffice, "#0e7490"));
        content.appendChild(createButton("⑧ 重置面板位置", async () => {
            const p = document.getElementById(PANEL_ID);
            if (p) {
                await resetPanelPosition(p);
                await setHidden(p, false);
                toast("面板位置已重置到右下角");
            }
        }, "#0f766e"));

        const hint = document.createElement("div");
        hint.textContent = "Alt+C 原文 / Alt+S session / Alt+W 單段格式 / Alt+Shift+W 整頁格式";
        hint.style.fontSize = "11px";
        hint.style.color = "#d1d5db";
        hint.style.marginTop = "2px";
        hint.style.lineHeight = "1.35";

        const hideButton = createButton("🙈 隱藏 Alt+B", async () => setHidden(panel, true), "#4b5563");

        content.appendChild(hint);
        content.appendChild(hideButton);

        panel.appendChild(title);
        panel.appendChild(content);
        (document.body || document.documentElement).appendChild(panel);

        await setCollapsed(panel, content, collapsed);
        makeDraggable(panel, title);
        await updateStatus();
    }

    function toast(message, color = "#10b981") {
        const el = document.createElement("div");
        el.textContent = message;
        el.style.position = "fixed";
        el.style.right = "14px";
        el.style.bottom = "205px";
        el.style.zIndex = "10000";
        el.style.background = color;
        el.style.color = "#fff";
        el.style.padding = "8px 12px";
        el.style.borderRadius = "10px";
        el.style.fontSize = "13px";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)";
        (document.body || document.documentElement).appendChild(el);
        setTimeout(() => el.remove(), 1700);
    }

    document.addEventListener("keydown", async (event) => {
        const key = event.key.toLowerCase();

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "c") {
            event.preventDefault();
            await captureCurrentAnswer();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "v") {
            event.preventDefault();
            await copyPrompt(buildCursorFix, "已複製 Cursor Fix Prompt");
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "s") {
            event.preventDefault();
            await captureFullSession();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "n") {
            event.preventDefault();
            await copyPrompt(buildOneNotePrompt, "已複製 OneNote 筆記整理 Prompt");
        }

        if (event.altKey && event.shiftKey && !event.ctrlKey && key === "w") {
            event.preventDefault();
            await copyFullSessionRichTextForOffice();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "w") {
            event.preventDefault();
            await copyRichTextForOffice();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "b") {
            event.preventDefault();

            const panel = document.getElementById(PANEL_ID);

            if (!panel || panel.style.display === "none") {
                await showPanelAtDefaultPosition();
                return;
            }

            await setHidden(panel, true);
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && key === "r") {
            event.preventDefault();
            await showPanelAtDefaultPosition();
        }
    });

    let lastUrl = location.href;

    setInterval(async () => {
        if (lastUrl !== location.href) {
            lastUrl = location.href;
            await ensurePanel();
        }
        await updateStatus();
    }, 3000);

    if (typeof GM_registerMenuCommand === "function") {
        GM_registerMenuCommand("Show / Reset AI Prompt Bridge Panel", async () => {
            await showPanelAtDefaultPosition();
        });
        GM_registerMenuCommand("Copy Full Session", async () => {
            await captureFullSession();
        });
<<<<<<< HEAD
=======
        GM_registerMenuCommand("Copy Rich Text for Word / OneNote", async () => {
            await copyRichTextForOffice();
        });
        GM_registerMenuCommand("Copy Full Session Rich Text for Word / OneNote", async () => {
            await copyFullSessionRichTextForOffice();
        });
>>>>>>> 0f40809 (feat: add full-session rich text copy)
    }

    onReady(async () => {
        showStartupProbe();
        await ensurePanel();
        setTimeout(ensurePanel, 800);
        setTimeout(ensurePanel, 2000);
    });
})();
