// ==UserScript==
// @name         AI Prompt Bridge
// @namespace    https://ai-prompt-bridge.local/ai-prompt-bridge
// @version      1.34.0
// @description  Cross-AI prompt bridge for ChatGPT, Gemini, Claude, DeepSeek, Qwen, Perplexity and Cursor workflows. Fixes Alt+N layout fallback by reconstructing full sessions from structured DOM blocks instead of flattened innerText.
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

    const AI_PROMPT_BRIDGE_VERSION = "1.34.0";
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

    const STORAGE_KEY = "ai_prompt_bridge_payload_v134";
    const PANEL_POS_KEY = "ai_prompt_bridge_panel_position_v134";
    const PANEL_ID = "ai-prompt-bridge-panel-v134";
    const BUBBLE_ID = "ai-prompt-bridge-restore-bubble-v134";
    const COLLAPSED_KEY = "ai_prompt_bridge_collapsed_v134";
    const HIDDEN_KEY = "ai_prompt_bridge_hidden_v134";
    const PROJECT_KEY = "ai_prompt_bridge_project_key_v134";

    const PROJECTS = {
        auto: {
            name: "Auto Detect",
            path: "",
            techStack: "依頁面內容自動判斷專案類型。",
            goldenRules: "若無法判斷專案，使用通用最高原則：不可破壞既有功能、只做最小修改、完整檔案輸出。",
            testCommands: "",
            docsTargets: "README.md / docs / CHANGELOG.md / .cursor/rules",
            keywords: []
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
        },
        python_gui: {
            name: "Python GUI App",
            path: "",
            techStack: "Python, Tkinter / PyQt / GUI, background workers, file I/O",
            goldenRules: [
                "不可阻塞 GUI 主執行緒，耗時任務必須放到 worker / thread / async flow。",
                "GUI 元件更新必須回到主執行緒或框架允許的安全更新方式。",
                "必須處理 Windows / macOS / Linux 路徑差異、中文路徑、特殊字元與長路徑。",
                "修 progress / cancel / ETA / status bar 時，不可破壞既有任務流程。",
                "不可刪除既有功能，不可用簡化版取代完整檔案。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "python -m pytest",
                "手動測試：啟動 GUI、長任務、取消、進度、中文檔名、錯誤流程"
            ].join("\n"),
            docsTargets: "README.md / docs/BUGFIX_LOG.md / docs/DESIGN_DECISIONS.md / .cursor/rules/python-gui.mdc",
            keywords: ["python", "tkinter", "pyqt", "gui", "thread", "progress", "cancel", "eta", "視窗", "介面"]
        },
        browser_extension: {
            name: "Browser Extension / Userscript",
            path: "",
            techStack: "JavaScript, Tampermonkey / Chrome Extension, DOM, Clipboard API, browser permissions",
            goldenRules: [
                "不可破壞既有快捷鍵、剪貼簿與面板功能。",
                "所有 selector 必須有 fallback，避免單一網站 DOM 改版造成整體失效。",
                "涉及 clipboard / file / network / permissions 時，必須說明瀏覽器限制與降級方案。",
                "避免把 private project names、local paths、API keys、tokens 寫進公開腳本。",
                "修改後必須通過 JavaScript syntax check。"
            ].join("\n"),
            testCommands: [
                "node --check ai-prompt-bridge.user.js",
                "手動測試：ChatGPT、Gemini、DeepSeek、Claude、複製、貼上、拖曳、重置面板"
            ].join("\n"),
            docsTargets: "README.md / CHANGELOG.md / docs/USAGE.md / docs/PRIVACY.md",
            keywords: ["userscript", "tampermonkey", "extension", "clipboard", "browser", "dom", "javascript", "chatgpt", "gemini"]
        },
        data_analysis: {
            name: "Data / Quant Analysis",
            path: "",
            techStack: "Python, Pandas, SQLite / Parquet, API data source, analysis / backtesting",
            goldenRules: [
                "嚴格防止 look-ahead bias，不可偷看未來資料。",
                "資料清理、特徵工程、訓練、驗證、測試必須清楚分層。",
                "大型 DataFrame 運算優先向量化，避免不必要的慢速迴圈。",
                "外部 API 必須處理 rate limit、timeout、斷線與重試。",
                "任何績效、分析或結論都必須標明假設、限制與資料品質風險。"
            ].join("\n"),
            testCommands: [
                "python -m pytest",
                "手動測試：資料下載、清理、特徵、回測、報告輸出"
            ].join("\n"),
            docsTargets: "README.md / docs/ANALYSIS_NOTES.md / docs/TEST_LOG.md / .cursor/rules/data-analysis.mdc",
            keywords: ["data", "pandas", "quant", "backtest", "analysis", "api", "sqlite", "parquet", "資料", "回測"]
        },
        media_tool: {
            name: "Media Processing Tool",
            path: "",
            techStack: "Python, ffmpeg, audio / video processing, transcription / subtitles, background tasks",
            goldenRules: [
                "不可阻塞 GUI 或主流程，長時間媒體處理必須有進度、取消與 log。",
                "必須處理 ffmpeg 路徑、檔案不存在、壞檔、中文路徑與長路徑。",
                "GPU / CPU fallback 或外部工具 fallback 必須有明確錯誤訊息。",
                "不可刪除既有輸出、暫存、摘要、字幕或轉檔功能。",
                "大型檔案處理必須避免一次性讀入造成記憶體暴衝。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "python -m pytest",
                "手動測試：短檔、長檔、壞檔、中文檔名、取消、輸出檔案驗證"
            ].join("\n"),
            docsTargets: "README.md / docs/RUNTIME.md / docs/BUGFIX_LOG.md / .cursor/rules/media-tool.mdc",
            keywords: ["media", "audio", "video", "ffmpeg", "whisper", "subtitle", "transcribe", "mp3", "mp4", "音訊", "影片"]
        },
        downloader_tool: {
            name: "Downloader / Automation Tool",
            path: "",
            techStack: "Python / JavaScript, downloader, retries, cookies, browser automation, file I/O",
            goldenRules: [
                "不可破壞既有成功下載流程。",
                "下載失敗必須保留可重試狀態、明確錯誤原因與 log。",
                "必須嚴格處理檔名限制、路徑限制、重複檔名與部分下載檔。",
                "cookies、token、headers、browser automation fallback 不可互相覆蓋有效結果。",
                "遇到 DRM、付費牆、權限不足或伺服器封鎖，必須明確提示，不可假裝可繞過。"
            ].join("\n"),
            testCommands: [
                "python main.py",
                "python -m pytest",
                "手動測試：成功下載、失敗 retry、cookies/token 更新、重複檔名、取消與恢復"
            ].join("\n"),
            docsTargets: "README.md / docs/DOWNLOAD_FLOW.md / docs/BUGFIX_LOG.md / .cursor/rules/downloader-tool.mdc",
            keywords: ["download", "downloader", "yt-dlp", "playwright", "cookies", "retry", "automation", "下載"]
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
            const root = getPrimaryContentRoot(element);
            const text = cleanExportText(root.innerText || root.textContent || "");
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

    function cleanGenericSessionElement(element) {
        const clone = element.cloneNode(true);
        [
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
            "script",
            "style",
            "noscript",
            "[contenteditable='true']",
            "[data-testid*='sidebar']",
            "[data-testid*='composer']"
        ].forEach((selector) => {
            try {
                clone.querySelectorAll(selector).forEach((el) => el.remove());
            } catch (_) {}
        });
        return clone;
    }

    function getGenericSession() {
        const candidates = [
            document.querySelector('[data-testid*="conversation"]'),
            document.querySelector(".conversation"),
            document.querySelector(".chat"),
            document.querySelector("main"),
            document.querySelector('[role="main"]')
        ].filter(Boolean);

        let best = "";

        candidates.forEach((element) => {
            const cleaned = cleanGenericSessionElement(element);
            const text = normalizeText(cleaned.innerText || cleaned.textContent || "");
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

        // Alt+S should be a clean raw transcript, not Ctrl+A of the whole page.
        // Generic page text often includes sidebar, history list, model picker, and AI Prompt Bridge panel.
        if (structuredContent && structuredContent.length >= 20) {
            return normalizeText(structuredContent);
        }

        return normalizeText(getGenericSession());
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
        // Do not scan the whole page body here.
        // The bridge panel itself contains project keywords and can cause false auto-detect.
        return [
            safeText(document.title),
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
        // Keep prompts clean by default.
        // Only inject project context when user manually selects a concrete preset.
        if (!selectedProjectKey || selectedProjectKey === "auto" || selectedProjectKey === "generic") {
            return "";
        }

        const key = getActiveProjectKey(payload);
        const project = getActiveProject(payload);
        if (!project || key === "auto" || key === "generic") {
            return "";
        }

        return [
            `Project_Mode: manual:${key}`,
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

        // Source / timestamp / URL are intentionally omitted from generated prompts by default.
        // They are useful for logs, but noisy for Alt+V / review prompts.
        return [
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
        const header = makeHeader(payload);

        return [
            header,
            header ? "" : "",
            "請根據以下內容修正目前 Cursor 專案。",
            "",
            "要求：",
            "1. 只做最小必要修改。",
            "2. 原本可用功能不可被改壞。",
            "3. 不可提供簡化版、閹割版、回退版。",
            "4. 若需要改程式碼，請以目前專案完整檔案為基準，提供完整可覆蓋版本。",
            "5. 請列出修改檔案、測試方式與可能 regression 風險。",
            "",
            "內容：",
            "```text",
            content,
            "```"
        ].filter((line) => line !== null && line !== undefined).join("\n");
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


    function isBridgeOrNonContentElement(element) {
        if (!element || !element.closest) return true;

        if (
            element.closest(`#${PANEL_ID}`) ||
            element.closest(`#${BUBBLE_ID}`) ||
            element.closest("#ai-prompt-bridge-startup-probe") ||
            element.closest("textarea,input,select,form,nav,aside,header,footer")
        ) {
            return true;
        }

        const text = normalizeText(element.innerText || element.textContent || "");
        if (!text) return true;

        const lower = text.toLowerCase();
        const noisy = [
            "ai prompt bridge",
            "project context",
            "alt+c",
            "alt+v",
            "alt+n",
            "alt+w",
            "chatgpt 可能會出錯",
            "想問什麼都可以",
            "new chat",
            "search chats",
            "聊天紀錄",
            "專案"
        ];

        return noisy.some((token) => lower.includes(token)) && text.length < 600;
    }

    function isVisibleElement(element) {
        if (!element || !element.getBoundingClientRect) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
        if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) {
            return false;
        }

        return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    function isLikelyWholeSessionElement(element) {
        if (!element || !element.querySelectorAll) return true;

        if (element.getAttribute?.("data-ai-prompt-bridge-fallback")) return false;
        if (element.getAttribute?.("data-ai-prompt-bridge-single-answer")) return false;

        if (element === document.body || element === document.documentElement) return true;
        if (element.matches?.("main,[role='main']")) return true;

        const roleNodes = element.querySelectorAll("[data-message-author-role]");
        if (roleNodes.length > 1) return true;

        const turnNodes = element.querySelectorAll("[data-testid*='conversation-turn'], article");
        if (turnNodes.length > 3) return true;

        const text = normalizeText(element.innerText || element.textContent || "");
        if (!text) return true;

        // Alt+W is single-answer only. Extremely large containers are almost always a session/root.
        if (text.length > 8000) return true;

        const repeatedAssistant = (text.match(/Assistant|ChatGPT|Gemini|Claude|User|使用者|你說：/g) || []).length;
        if (text.length > 2500 && repeatedAssistant >= 4) return true;

        return false;
    }

    function getSingleAnswerTextLength(element) {
        return normalizeText(element?.innerText || element?.textContent || "").length;
    }

    function makeElementFromText(text, label = "AI Answer") {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-fallback", "text");
        const pre = document.createElement("div");
        pre.style.whiteSpace = "pre-wrap";
        pre.textContent = cleanExportText(text);
        wrapper.appendChild(pre);
        return wrapper;
    }


    function getVisibleContentFallbackElement() {
        const roots = [
            document.querySelector("main"),
            document.querySelector('[role="main"]')
        ].filter(Boolean);

        const selectors = [
            '[data-message-author-role="assistant"]',
            '[data-message-author-role="assistant"] .markdown',
            ".markdown",
            ".prose",
            "article",
            "section"
        ];

        const candidates = [];
        const seen = new Set();

        roots.forEach((root) => {
            selectors.forEach((selector) => {
                try {
                    root.querySelectorAll(selector).forEach((element) => {
                        if (seen.has(element)) return;
                        seen.add(element);

                        if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return;
                        if (isLikelyWholeSessionElement(element)) return;

                        const text = normalizeText(element.innerText || element.textContent || "");
                        if (text.length < 20 || text.length > 8000) return;

                        const rect = element.getBoundingClientRect();
                        const containsComposer =
                            element.querySelector("textarea,input,[contenteditable='true']") ||
                            text.includes("想問什麼都可以") ||
                            text.includes("問問 ChatGPT");

                        if (containsComposer) return;

                        candidates.push({
                            element,
                            textLength: text.length,
                            bottom: rect.bottom,
                            top: rect.top,
                            isAssistant: element.matches?.('[data-message-author-role="assistant"]') ? 1 : 0,
                            isMarkdown: element.matches?.(".markdown,.prose") ? 1 : 0
                        });
                    });
                } catch (error) {
                    console.warn("[AI Prompt Bridge] fallback selector failed", selector, error);
                }
            });
        });

        if (candidates.length === 0) {
            return null;
        }

        candidates.sort((a, b) => {
            const scoreA =
                a.isAssistant * 100000 +
                a.isMarkdown * 50000 +
                a.bottom +
                Math.min(a.textLength, 2000) -
                (a.textLength > 4000 ? 20000 : 0);
            const scoreB =
                b.isAssistant * 100000 +
                b.isMarkdown * 50000 +
                b.bottom +
                Math.min(b.textLength, 2000) -
                (b.textLength > 4000 ? 20000 : 0);
            return scoreA - scoreB;
        });

        return candidates[candidates.length - 1].element;
    }

    function getVisibleSingleAnswerTextFallbackElement() {
        // Last-resort fallback for Alt+W only.
        // It collects visible text blocks from the current viewport instead of copying a whole session/root.
        const root = document.querySelector("main") || document.querySelector('[role="main"]');
        if (!root) return null;

        const selectors = [
            "p",
            "li",
            "h1",
            "h2",
            "h3",
            "h4",
            "blockquote",
            "pre",
            "code",
            "table",
            "[data-testid*='message'] p",
            "[data-message-author-role='assistant'] p"
        ];

        const blocks = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                root.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return;
                    if (element.closest("textarea,input,select,form,nav,aside,header,footer")) return;

                    const text = normalizeText(element.innerText || element.textContent || "");
                    if (text.length < 2 || text.length > 3000) return;
                    if (
                        text.includes("想問什麼都可以") ||
                        text.includes("問問 ChatGPT") ||
                        text.includes("ChatGPT 可能會出錯")
                    ) {
                        return;
                    }

                    const rect = element.getBoundingClientRect();
                    // Keep only content actually near/current viewport. This prevents session-wide copy.
                    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

                    blocks.push({
                        text,
                        top: rect.top,
                        bottom: rect.bottom,
                        element
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] visible text fallback selector failed", selector, error);
            }
        });

        if (blocks.length === 0) return null;

        blocks.sort((a, b) => a.top - b.top);

        // Prefer content in the lower/current reading area, but cap total text.
        const visible = blocks
            .filter((block) => block.bottom > 80 && block.top < window.innerHeight - 80)
            .slice(-18);

        const chosen = visible.length ? visible : blocks.slice(-12);
        let text = chosen.map((block) => block.text).join("\n\n");
        text = normalizeText(text);

        if (!text || text.length < 20) return null;

        // Alt+W must never copy a huge session.
        if (text.length > 5000) {
            text = text.slice(-5000);
        }

        return makeElementFromText(text, "Visible AI Answer");
    }


    function cleanExportText(text) {
        let value = safeText(text)
            .replace(/\r\n/g, "\n")
            .replace(/\u00a0/g, " ");

        const noisyExact = new Set([
            "Visible AI Answer",
            "AI Answer",
            "ChatGPT 說",
            "ChatGPT說",
            "純文字",
            "啟用自動換行",
            "自動換行",
            "Plain text",
            "Wrap text",
            "複製",
            "編輯",
            "分享",
            "更多",
            "資料來源",
            "最新回覆",
            "回覆",
            "已複製",
            "正在載入較早的訊息…",
            "正在載入較早的訊息...",
            "轉為寫作區塊",
            "ChatGPT 可能會出錯。請查證重要資訊。",
            "ChatGPT 可能會出錯，請查證重要資訊。"
        ]);

        const noisyPatterns = [
            /^ChatGPT\s*(說|said)\s*[:：]?$/i,
            /^你說\s*[:：]?$/,
            /^(copy|copied|edit|share|more|regenerate|read aloud)$/i,
            /^Alt\+[A-Za-z]/,
            /^啟用.*自動換行$/,
            /^純文字$/,
            /^```$/,
            /^`{1,3}$/,
            /^已思考\s*\d+\s*s$/i,
            /^已思考\s*\d+\s*秒$/,
            /^思考\s*\d+\s*s$/i,
            /^\d{4}年\d{1,2}月\d{1,2}日\s*(上午|下午)?\s*\d{1,2}:\d{2}$/,
            /^\d{1,2}月\d{1,2}日週[一二三四五六日天]\s*(上午|下午)\d{1,2}:\d{2}$/
        ];

        const lines = value.split("\n")
            .map((line) => line.trim())
            .filter((line) => {
                if (!line) return false;
                if (noisyExact.has(line)) return false;
                if (noisyPatterns.some((pattern) => pattern.test(line))) return false;
                return true;
            });

        return normalizeText(lines.join("\n"));
    }

    function cleanExportLine(line) {
        const raw = safeText(line).replace(/\u00a0/g, " ").trim();
        if (!raw) return "";

        const noisyExact = new Set([
            "Visible AI Answer",
            "AI Answer",
            "ChatGPT 說",
            "ChatGPT說",
            "純文字",
            "啟用自動換行",
            "自動換行",
            "Plain text",
            "Wrap text",
            "複製",
            "編輯",
            "分享",
            "更多",
            "資料來源",
            "最新回覆",
            "回覆",
            "已複製",
            "正在載入較早的訊息…",
            "正在載入較早的訊息...",
            "轉為寫作區塊",
            "ChatGPT 可能會出錯。請查證重要資訊。",
            "ChatGPT 可能會出錯，請查證重要資訊。"
        ]);

        const noisyPatterns = [
            /^ChatGPT\s*(說|said)\s*[:：]?$/i,
            /^你說\s*[:：]?$/,
            /^(copy|copied|edit|share|more|regenerate|read aloud)$/i,
            /^Alt\+[A-Za-z]/,
            /^啟用.*自動換行$/,
            /^純文字$/,
            /^```$/,
            /^`{1,3}$/,
            /^已思考\s*\d+\s*s$/i,
            /^已思考\s*\d+\s*秒$/,
            /^思考\s*\d+\s*s$/i,
            /^\d{4}年\d{1,2}月\d{1,2}日\s*(上午|下午)?\s*\d{1,2}:\d{2}$/,
            /^\d{1,2}月\d{1,2}日週[一二三四五六日天]\s*(上午|下午)\d{1,2}:\d{2}$/
        ];

        if (noisyExact.has(raw)) return "";
        if (noisyPatterns.some((pattern) => pattern.test(raw))) return "";
        return raw.replace(/[ \t]+/g, " ");
    }

    function cleanExportMultiline(text) {
        const lines = safeText(text)
            .replace(/\r\n/g, "\n")
            .replace(/\u00a0/g, " ")
            .split("\n")
            .map((line) => cleanExportLine(line))
            .filter(Boolean);

        // Collapse excessive blank/duplicate UI lines but keep real paragraph boundaries.
        return lines.join("\n").trim();
    }


    function isNoisyAutoCopyBlockText(text) {
        const t = cleanExportText(text);
        if (!t) return true;

        const exact = new Set([
            "Visible AI Answer",
            "AI Answer",
            "ChatGPT 說",
            "ChatGPT說",
            "純文字",
            "啟用自動換行",
            "自動換行",
            "Plain text",
            "Wrap text",
            "複製",
            "編輯",
            "分享",
            "更多",
            "資料來源",
            "最新回覆"
        ]);

        if (exact.has(t)) return true;
        if (/^ChatGPT\s*(說|said)\s*[:：]?$/i.test(t)) return true;
        if (/^```/.test(t)) return true;
        if (/^(copy|copied|edit|share|more|regenerate|read aloud)$/i.test(t)) return true;
        return false;
    }

    function getPrimaryContentRoot(container) {
        if (!container || !container.querySelector) return container;

        const roots = Array.from(container.querySelectorAll(".markdown,.prose,[class*='markdown'],[class*='prose']"))
            .filter((node) => {
                const text = cleanExportText(node.innerText || node.textContent || "");
                return text.length >= 10 && isVisibleElement(node);
            });

        if (roots.length > 0) {
            roots.sort((a, b) => {
                const ar = a.getBoundingClientRect();
                const br = b.getBoundingClientRect();
                return ar.top - br.top;
            });
            return roots[roots.length - 1];
        }

        return container;
    }


    function getVisibleRatio(element) {
        if (!element || !element.getBoundingClientRect) return 0;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return 0;
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, window.innerHeight);
        const visibleHeight = Math.max(0, bottom - top);
        return visibleHeight / Math.max(1, rect.height);
    }

    function scoreLatestAssistantCandidate(element) {
        if (!element || !element.getBoundingClientRect) return -1;
        if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return -1;
        if (element === document.body || element === document.documentElement) return -1;
        if (element.matches?.("main,[role='main']")) return -1;

        const nestedRoles = element.querySelectorAll?.("[data-message-author-role]") || [];
        if (nestedRoles.length > 1) return -1;

        const root = getPrimaryContentRoot(element);
        const text = cleanExportText(root.innerText || root.textContent || "");
        const hasImage = Boolean(root.querySelector?.("img"));
        if (text.length < 10 && !hasImage) return -1;
        if (text.length > 60000) return -1;

        const rect = element.getBoundingClientRect();
        const roleScore = element.matches?.('[data-message-author-role="assistant"]') ? 1000000 : 0;
        const markdownScore = root !== element ? 100000 : 0;
        const bottomScore = rect.bottom;
        const lengthScore = Math.min(text.length, 8000);

        return roleScore + markdownScore + bottomScore + lengthScore;
    }

    function getLatestAssistantAnswerContainer() {
        const site = getSiteName();
        const selectorsBySite = {
            ChatGPT: [
                '[data-message-author-role="assistant"]',
                '[data-testid*="assistant"]',
                '.markdown',
                '.prose'
            ],
            Gemini: [
                "model-response",
                "message-content",
                ".message-content",
                "render-viewer",
                "[data-response-index]"
            ],
            Claude: [
                '[data-testid*="assistant-message"]',
                '[data-testid*="message"]',
                ".font-claude-message",
                ".prose"
            ],
            DeepSeek: [
                ".ds-markdown",
                ".markdown",
                ".prose",
                "[class*='message']"
            ],
            Perplexity: [
                "article",
                ".prose",
                "[class*='answer']"
            ]
        };

        const selectors = selectorsBySite[site] || [
            '[data-message-author-role="assistant"]',
            ".markdown",
            ".prose",
            "article"
        ];

        const candidates = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    const score = scoreLatestAssistantCandidate(element);
                    if (score < 0) return;

                    candidates.push({ element, score });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] latest assistant selector failed", selector, error);
            }
        });

        if (candidates.length === 0) return null;

        candidates.sort((a, b) => a.score - b.score);
        return candidates[candidates.length - 1].element;
    }

    function buildFullSingleAnswerElement(container) {
        if (!container) return null;

        const contentRoot = getPrimaryContentRoot(container);
        const clone = cleanRichClone(contentRoot);
        absolutizeImageSources(clone);

        const text = cleanExportText(clone.innerText || clone.textContent || "");
        const hasImage = Boolean(clone.querySelector?.("img"));
        if (text.length < 2 && !hasImage) return null;

        // Do not add any artificial heading such as "Visible AI Answer".
        clone.setAttribute("data-ai-prompt-bridge-single-answer", "1");
        return clone;
    }


    function isInsideComposerOrChrome(element) {
        if (!element || !element.closest) return true;
        return Boolean(
            element.closest(`#${PANEL_ID}`) ||
            element.closest(`#${BUBBLE_ID}`) ||
            element.closest("#ai-prompt-bridge-startup-probe") ||
            element.closest("textarea,input,select,form,nav,aside,header,footer,[contenteditable='true']") ||
            element.closest('[data-testid*="composer"]') ||
            element.closest('[aria-label*="Message"]') ||
            element.closest('[aria-label*="訊息"]')
        );
    }

    function isUsefulAnswerLine(line) {
        const text = cleanExportText(line);
        if (!text) return false;
        if (text.length < 2) return false;

        const noise = new Set([
            "複製",
            "編輯",
            "分享",
            "更多",
            "資料來源",
            "純文字",
            "ChatGPT 說",
            "ChatGPT說",
            "AI Answer",
            "Visible AI Answer",
            "ChatGPT 可能會出錯。請查證重要資訊。"
        ]);

        if (noise.has(text)) return false;
        if (/^(copy|copied|edit|share|more|regenerate|read aloud)$/i.test(text)) return false;
        if (/^Alt\+[A-Za-z]/.test(text)) return false;
        if (/^https?:\/\//.test(text) && text.length < 120) return false;
        return true;
    }

    function getReadableTextElements(root) {
        if (!root) return [];
        const selectors = [
            "h1", "h2", "h3", "h4",
            "p", "li", "blockquote",
            "table", "pre"
        ];

        const out = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                root.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    if (!isVisibleElement(element)) return;
                    if (isInsideComposerOrChrome(element)) return;
                    if (element.closest("button,svg")) return;

                    const raw = element.innerText || element.textContent || "";
                    const text = cleanExportText(raw);
                    if (!isUsefulAnswerLine(text)) return;

                    const rect = element.getBoundingClientRect();
                    if (rect.width <= 0 || rect.height <= 0) return;

                    out.push({
                        element,
                        text,
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] readable selector failed", selector, error);
            }
        });

        out.sort((a, b) => a.top - b.top || a.left - b.left);
        return out;
    }

    function commonAncestor(a, b) {
        if (!a) return b || null;
        if (!b) return a || null;
        const parents = new Set();
        let node = a;
        while (node) {
            parents.add(node);
            node = node.parentElement;
        }
        node = b;
        while (node) {
            if (parents.has(node)) return node;
            node = node.parentElement;
        }
        return null;
    }

    function buildElementFromLines(lines) {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-single-answer", "1");
        wrapper.setAttribute("data-ai-prompt-bridge-fallback", "text-lines");

        lines.forEach((line) => {
            const text = cleanExportText(line);
            if (!isUsefulAnswerLine(text)) return;
            const p = document.createElement("p");
            p.textContent = text;
            wrapper.appendChild(p);
        });

        return wrapper.childNodes.length ? wrapper : null;
    }

    function getLatestAnswerByReadableBlocks() {
        const main = document.querySelector("main") || document.querySelector('[role="main"]');
        if (!main) return null;

        const blocks = getReadableTextElements(main);
        if (!blocks.length) return null;

        const viewportBottom = window.innerHeight;
        const composerTopCandidates = Array.from(document.querySelectorAll("textarea,[contenteditable='true'],form,[data-testid*='composer']"))
            .map((el) => el.getBoundingClientRect?.())
            .filter((rect) => rect && rect.top > 0)
            .map((rect) => rect.top);
        const composerTop = composerTopCandidates.length ? Math.min(...composerTopCandidates) : viewportBottom;

        // Prefer blocks above composer and closest to it, which are usually the latest assistant answer.
        const visibleAnswerBlocks = blocks.filter((b) => b.bottom > 0 && b.top < composerTop - 10);
        const pool = visibleAnswerBlocks.length ? visibleAnswerBlocks : blocks;

        const anchor = pool[pool.length - 1];
        if (!anchor) return null;

        // Expand upward within the same visual answer area until a large vertical gap.
        const selected = [anchor];
        let lastTop = anchor.top;

        for (let i = pool.length - 2; i >= 0; i -= 1) {
            const current = pool[i];
            const gap = lastTop - current.bottom;

            // Stop at large gaps because they usually separate previous answer / cards / images.
            if (gap > 180 && selected.length > 0) break;

            // Stop before clearly older block far above viewport midline when we already have enough text.
            if (current.bottom < 0 && selected.length > 0) break;

            selected.unshift(current);
            lastTop = current.top;

            const chars = selected.reduce((sum, item) => sum + item.text.length, 0);
            if (chars > 12000) break;
        }

        // Try to find a common ancestor, but if it looks too broad, use clean text lines instead.
        let ancestor = null;
        selected.forEach((item) => {
            ancestor = commonAncestor(ancestor, item.element);
        });

        if (ancestor && ancestor !== document.body && ancestor !== document.documentElement && !ancestor.matches?.("main,[role='main']")) {
            const roles = ancestor.querySelectorAll?.("[data-message-author-role]") || [];
            const text = cleanExportText(ancestor.innerText || ancestor.textContent || "");
            if (roles.length <= 1 && text.length <= 60000 && text.length >= 10) {
                const root = getPrimaryContentRoot(ancestor);
                const clone = cleanRichClone(root);
                clone.setAttribute("data-ai-prompt-bridge-single-answer", "1");
                clone.setAttribute("data-ai-prompt-bridge-fallback", "readable-ancestor");
                return clone;
            }
        }

        return buildElementFromLines(selected.map((item) => item.text));
    }


    function getCurrentVisibleAssistantContainer() {
        const site = getSiteName();
        const selectorsBySite = {
            ChatGPT: [
                '[data-message-author-role="assistant"]',
                '[data-testid*="assistant"]',
                '.markdown',
                '.prose'
            ],
            Gemini: [
                "model-response",
                "message-content",
                ".message-content",
                "render-viewer",
                "[data-response-index]"
            ],
            Claude: [
                '[data-testid*="assistant-message"]',
                '[data-testid*="message"]',
                ".font-claude-message",
                ".prose"
            ],
            DeepSeek: [
                ".ds-markdown",
                ".markdown",
                ".prose",
                "[class*='message']"
            ],
            Perplexity: [
                "article",
                ".prose",
                "[class*='answer']"
            ]
        };

        const selectors = selectorsBySite[site] || [
            '[data-message-author-role="assistant"]',
            ".markdown",
            ".prose",
            "article"
        ];

        const candidates = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return;
                    if (element === document.body || element === document.documentElement) return;
                    if (element.matches?.("main,[role='main']")) return;

                    const nestedRoles = element.querySelectorAll?.("[data-message-author-role]") || [];
                    if (nestedRoles.length > 1) return;

                    const text = normalizeText(element.innerText || element.textContent || "");
                    const hasImage = Boolean(element.querySelector?.("img"));
                    if (text.length < 10 && !hasImage) return;
                    if (text.length > 12000) return;

                    const rect = element.getBoundingClientRect();
                    const ratio = getVisibleRatio(element);
                    if (ratio <= 0) return;

                    candidates.push({
                        element,
                        textLength: text.length,
                        top: rect.top,
                        bottom: rect.bottom,
                        ratio,
                        hasRole: element.matches?.('[data-message-author-role="assistant"]') ? 1 : 0,
                        hasMarkdown: element.querySelector?.(".markdown,.prose") ? 1 : 0
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] current visible assistant selector failed", selector, error);
            }
        });

        if (candidates.length === 0) return null;

        // The current answer is usually the visible assistant container closest to the composer/bottom.
        // This avoids copying older visible snippets above the current answer.
        candidates.sort((a, b) => {
            const scoreA =
                a.hasRole * 100000 +
                a.hasMarkdown * 5000 +
                Math.min(a.bottom, window.innerHeight) * 10 +
                a.ratio * 1000 -
                (a.textLength > 8000 ? 20000 : 0);
            const scoreB =
                b.hasRole * 100000 +
                b.hasMarkdown * 5000 +
                Math.min(b.bottom, window.innerHeight) * 10 +
                b.ratio * 1000 -
                (b.textLength > 8000 ? 20000 : 0);
            return scoreA - scoreB;
        });

        return candidates[candidates.length - 1].element;
    }

    function buildVisibleTextSegmentFromContainer(container) {
        if (!container) return null;

        const contentRoot = getPrimaryContentRoot(container);
        const selectors = [
            "h1",
            "h2",
            "h3",
            "h4",
            "p",
            "li",
            "blockquote",
            "table"
        ];

        const blocks = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                contentRoot.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return;
                    if (element.closest("textarea,input,select,form,nav,aside,header,footer")) return;
                    if (element.closest("pre,code")) return;

                    let text = cleanExportText(element.innerText || element.textContent || "");
                    if (isNoisyAutoCopyBlockText(text)) return;
                    if (text.length < 2 || text.length > 5000) return;

                    const rect = element.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

                    blocks.push({
                        text,
                        tag: element.tagName ? element.tagName.toLowerCase() : "p",
                        top: rect.top,
                        bottom: rect.bottom
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] visible segment selector failed", selector, error);
            }
        });

        if (blocks.length === 0) {
            const text = cleanExportText(contentRoot.innerText || contentRoot.textContent || "");
            if (!text || text.length < 10 || text.length > 8000) return null;
            const wrapper = document.createElement("div");
            wrapper.setAttribute("data-ai-prompt-bridge-fallback", "visible-current-answer");
            const p = document.createElement("p");
            p.textContent = text;
            wrapper.appendChild(p);
            return wrapper;
        }

        blocks.sort((a, b) => a.top - b.top);

        // Start from the first actually visible meaningful block in the current assistant answer.
        // This prevents copying the code block label "純文字", "ChatGPT 說", and older upper snippets.
        const firstIndex = blocks.findIndex((block) => {
            const t = cleanExportText(block.text);
            return t.length >= 6 && !isNoisyAutoCopyBlockText(t);
        });

        const chosen = blocks.slice(firstIndex >= 0 ? firstIndex : 0);
        let total = 0;
        const limited = [];
        chosen.forEach((block) => {
            if (total > 7000) return;
            limited.push(block);
            total += block.text.length;
        });

        if (limited.length === 0) return null;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-fallback", "visible-current-answer");

        limited.forEach((block) => {
            let tag = ["h1", "h2", "h3", "h4", "blockquote"].includes(block.tag) ? block.tag : "p";
            const el = document.createElement(tag);
            el.textContent = cleanExportText(block.text);
            if (el.textContent) wrapper.appendChild(el);
        });

        return wrapper.childNodes.length ? wrapper : null;
    }

    function getAltWRichCopyTarget() {
        const selectedContainer = getSelectionHtml();
        if (selectedContainer) {
            return { element: selectedContainer, source: "selection" };
        }

        // Alt+W means: copy the latest assistant answer as one complete answer.
        // Primary path: stable assistant message markers.
        const latestContainer = getLatestAssistantAnswerContainer();
        const fullAnswer = buildFullSingleAnswerElement(latestContainer);
        if (fullAnswer) {
            return { element: fullAnswer, source: "latest-full-answer" };
        }

        // Fallback path for ChatGPT layouts that no longer expose stable assistant markers.
        // This uses visible readable blocks near the composer instead of returning an error.
        const readableFallback = getLatestAnswerByReadableBlocks();
        if (readableFallback) {
            return { element: readableFallback, source: "readable-block-fallback" };
        }

        return null;
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
                '[data-message-author-role="assistant"] .prose',
                '[data-message-author-role="assistant"]',
                '[data-testid*="assistant"] .markdown',
                '[data-testid*="assistant"] .prose',
                ".agent-turn .markdown",
                ".markdown",
                ".prose"
            ];
        } else if (site === "Gemini") {
            selectors = [
                "message-content",
                ".message-content",
                "model-response",
                "render-viewer",
                "[data-response-index]",
                ".markdown",
                ".prose"
            ];
        } else if (site === "Claude") {
            selectors = [
                '[data-testid*="message"] .prose',
                '[data-testid*="message"]',
                ".font-claude-message",
                ".prose",
                ".markdown"
            ];
        } else if (site === "DeepSeek") {
            selectors = [
                ".ds-markdown",
                ".markdown",
                ".prose",
                "[class*='markdown']"
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
                "[class*='markdown']"
            ];
        }

        const candidates = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((element) => {
                    if (seen.has(element)) return;
                    seen.add(element);

                    if (!isVisibleElement(element) || isBridgeOrNonContentElement(element)) return;
                    if (isLikelyWholeSessionElement(element)) return;

                    const text = normalizeText(element.innerText || element.textContent || "");
                    if (text.length > 20 && text.length <= 8000) {
                        const rect = element.getBoundingClientRect();
                        candidates.push({
                            element,
                            textLength: text.length,
                            bottom: rect.bottom,
                            isAssistant: element.matches?.('[data-message-author-role="assistant"]') ? 1 : 0,
                            isMarkdown: element.matches?.(".markdown,.prose") ? 1 : 0
                        });
                    }
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] selector failed", selector, error);
            }
        });

        if (candidates.length > 0) {
            candidates.sort((a, b) => {
                const scoreA =
                    a.isAssistant * 100000 +
                    a.isMarkdown * 50000 +
                    a.bottom +
                    Math.min(a.textLength, 2000) -
                    (a.textLength > 4000 ? 20000 : 0);
                const scoreB =
                    b.isAssistant * 100000 +
                    b.isMarkdown * 50000 +
                    b.bottom +
                    Math.min(b.textLength, 2000) -
                    (b.textLength > 4000 ? 20000 : 0);
                return scoreA - scoreB;
            });
            return candidates[candidates.length - 1].element;
        }

        const fallback = getVisibleContentFallbackElement();
        if (fallback) {
            console.warn("[AI Prompt Bridge] latest answer selectors missed; using single visible answer fallback");
            return fallback;
        }

        const textFallback = getVisibleSingleAnswerTextFallbackElement();
        if (textFallback) {
            console.warn("[AI Prompt Bridge] latest answer selectors missed; using visible text-block fallback");
            return textFallback;
        }

        return null;
    }


    function absolutizeImageSources(root) {
        try {
            root.querySelectorAll("img").forEach((img, index) => {
                const src = img.getAttribute("src") || img.src || "";
                if (!src) return;

                try {
                    img.setAttribute("src", new URL(src, location.href).href);
                } catch (_) {
                    img.setAttribute("src", src);
                }

                img.setAttribute("alt", img.getAttribute("alt") || `AI image ${index + 1}`);
                img.setAttribute("style", [
                    "max-width:100%",
                    "height:auto",
                    "display:block",
                    "margin:10px 0",
                    "border:0"
                ].join(";"));
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] image source normalization failed", error);
        }
        return root;
    }

    function getRoleLabel(role) {
        if (role === "user") return "User";
        if (role === "assistant") return "Assistant";
        return role || "Message";
    }

    function paragraphizeText(text) {
        const raw = safeText(text).replace(/\r\n/g, "\n");
        const lines = raw.split("\n");
        const paragraphs = [];
        let buffer = [];

        const flush = () => {
            const joined = buffer.join(" ").replace(/\s+/g, " ").trim();
            if (joined) paragraphs.push(joined);
            buffer = [];
        };

        lines.forEach((line) => {
            const clean = cleanExportLine(line);
            if (!clean || isNoisyAutoCopyBlockText(clean)) {
                flush();
                return;
            }

            // Preserve explicit structure.
            if (
                /^#{1,6}\s+/.test(clean) ||
                /^[-*•◦○]\s+/.test(clean) ||
                /^\d+[.)]\s+/.test(clean) ||
                /^>/.test(clean)
            ) {
                flush();
                paragraphs.push(clean);
                return;
            }

            // Treat short title-like lines as standalone to keep ChatGPT-like layout.
            if (clean.length <= 40 && !/[。！？.!?]$/.test(clean) && buffer.length === 0) {
                paragraphs.push(clean);
                return;
            }

            buffer.push(clean);
        });

        flush();
        return paragraphs;
    }

    function appendTextBlockWithOfficeStyle(parent, line) {
        const clean = cleanExportText(line);
        if (!clean || isNoisyAutoCopyBlockText(clean)) return;

        let el = null;

        if (/^#{1,6}\s+/.test(clean)) {
            const level = Math.min(4, (clean.match(/^#+/) || ["##"])[0].length);
            el = document.createElement(`h${level}`);
            el.textContent = clean.replace(/^#{1,6}\s+/, "");
        } else if (/^>/.test(clean)) {
            el = document.createElement("blockquote");
            el.textContent = clean.replace(/^>\s?/, "");
            el.style.borderLeft = "4px solid #d1d5db";
            el.style.paddingLeft = "12px";
            el.style.margin = "8px 0";
        } else {
            el = document.createElement("p");
            el.textContent = clean;
        }

        parent.appendChild(el);
    }

    function cleanOfficeExportElement(root) {
        if (!root || !root.querySelectorAll) return root;

        const killSelectors = [
            "button",
            "svg",
            "textarea",
            "input",
            "select",
            "form",
            "nav",
            "aside",
            "header",
            "footer",
            "[contenteditable='true']",
            "[data-testid*='composer']",
            "[aria-label*='Message']",
            "[aria-label*='訊息']",
            `#${PANEL_ID}`,
            `#${BUBBLE_ID}`,
            "#ai-prompt-bridge-startup-probe"
        ];

        killSelectors.forEach((selector) => {
            try {
                root.querySelectorAll(selector).forEach((node) => node.remove());
            } catch (_) {}
        });

        // Remove empty/noisy text-only blocks.
        root.querySelectorAll("p,div,span,li,h1,h2,h3,h4,h5,h6,blockquote,pre,code").forEach((node) => {
            const text = cleanExportText(node.innerText || node.textContent || "");
            const hasMeaningfulMedia = Boolean(node.querySelector?.("img,table"));
            if (!text && !hasMeaningfulMedia) {
                node.remove();
                return;
            }
            if (isNoisyAutoCopyBlockText(text) && !hasMeaningfulMedia) {
                node.remove();
            }
        });

        applyOneNoteInlineStyles(root);
        return root;
    }


    function normalizeOfficeLayoutStyles(root) {
        if (!root || !root.querySelectorAll) return root;

        root.style.maxWidth = "980px";
        root.style.whiteSpace = "normal";
        root.style.wordBreak = "break-word";
        root.style.overflowWrap = "anywhere";
        root.style.fontFamily = "'Microsoft JhengHei','Segoe UI',Arial,sans-serif";
        root.style.fontSize = "20pt";
        root.style.lineHeight = "1.55";
        root.style.color = "#111111";

        root.querySelectorAll("p,li,blockquote,td,th").forEach((node) => {
            node.style.fontSize = "20pt";
            node.style.lineHeight = "1.55";
            node.style.whiteSpace = "normal";
            node.style.wordBreak = "break-word";
            node.style.overflowWrap = "anywhere";
            node.style.marginTop = node.style.marginTop || "0";
            node.style.marginBottom = node.style.marginBottom || "8px";
        });

        root.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((node) => {
            node.style.lineHeight = "1.35";
            node.style.marginTop = node.style.marginTop || "14px";
            node.style.marginBottom = node.style.marginBottom || "8px";
            node.style.whiteSpace = "normal";
            node.style.wordBreak = "break-word";
            node.style.overflowWrap = "anywhere";
        });

        root.querySelectorAll("pre,code").forEach((node) => {
            node.style.whiteSpace = "pre-wrap";
            node.style.wordBreak = "break-word";
            node.style.overflowWrap = "anywhere";
            node.style.fontFamily = "Consolas, 'Cascadia Mono', monospace";
            node.style.fontSize = "18pt";
            node.style.lineHeight = "1.45";
        });

        root.querySelectorAll("table").forEach((node) => {
            node.style.borderCollapse = "collapse";
            node.style.width = "auto";
            node.style.maxWidth = "980px";
            node.style.whiteSpace = "normal";
        });

        root.querySelectorAll("img").forEach((node) => {
            node.style.maxWidth = "920px";
            node.style.height = "auto";
        });

        return root;
    }

    function buildRichMessageSection(block, index) {
        const role = block?.role || "message";
        const section = document.createElement("section");
        section.setAttribute("data-ai-prompt-bridge-message", String(index + 1));
        section.setAttribute(
            "style",
            "margin:0 0 18px 0;padding:0 0 14px 0;border-bottom:1px solid #e5e7eb;max-width:980px;white-space:normal;word-break:break-word;overflow-wrap:anywhere;"
        );

        if (block?.node) {
            const clone = cleanRichClone(block.node);
            absolutizeImageSources(clone);
            cleanOfficeExportElement(clone);
            normalizeOfficeLayoutStyles(clone);

            const text = cleanExportText(clone.innerText || clone.textContent || "");
            const hasImage = Boolean(clone.querySelector?.("img"));
            if (text || hasImage) {
                section.appendChild(clone);
                return section;
            }
        }

        const bodyText = cleanExportText(block?.text || "");
        if (!bodyText || isNoisyAutoCopyBlockText(bodyText)) {
            return null;
        }

        const body = textToRichBlock(bodyText);
        normalizeOfficeLayoutStyles(body);
        section.appendChild(body);
        return section;
    }


    function textToRichBlock(text) {
        const body = document.createElement("div");
        const paragraphs = paragraphizeText(text);
        let list = null;
        let orderedList = null;

        const flushLists = () => {
            if (list) {
                body.appendChild(list);
                list = null;
            }
            if (orderedList) {
                body.appendChild(orderedList);
                orderedList = null;
            }
        };

        paragraphs.forEach((line) => {
            const clean = cleanExportText(line);
            if (!clean || isNoisyAutoCopyBlockText(clean)) {
                flushLists();
                return;
            }

            if (/^#{1,6}\s+/.test(clean)) {
                flushLists();
                appendTextBlockWithOfficeStyle(body, clean);
                return;
            }

            if (/^[-*•◦○]\s+/.test(clean)) {
                orderedList = null;
                if (!list) list = document.createElement("ul");
                const li = document.createElement("li");
                li.textContent = clean.replace(/^[-*•◦○]\s+/, "");
                list.appendChild(li);
                return;
            }

            if (/^\d+[.)]\s+/.test(clean)) {
                list = null;
                if (!orderedList) orderedList = document.createElement("ol");
                const li = document.createElement("li");
                li.textContent = clean.replace(/^\d+[.)]\s+/, "");
                orderedList.appendChild(li);
                return;
            }

            flushLists();

            if (clean.startsWith("[Image:")) {
                const p = document.createElement("p");
                p.textContent = clean;
                p.style.fontStyle = "italic";
                body.appendChild(p);
                return;
            }

            appendTextBlockWithOfficeStyle(body, clean);
        });

        flushLists();
        cleanOfficeExportElement(body);
        return body;
    }

    function normalizeChatTranscriptMarkers(rawText) {
        let text = safeText(rawText).replace(/\r\n/g, "\n");

        // Add line breaks around compact ChatGPT transcript markers.
        text = text
            .replace(/(正在載入較早的訊息…|正在載入較早的訊息\.\.\.)/g, "\n")
            .replace(/(\d{4}年\d{1,2}月\d{1,2}日\s*(?:上午|下午)\s*\d{1,2}:\d{2})/g, "\n$1\n")
            .replace(/(\d{1,2}月\d{1,2}日週[一二三四五六日天]\s*(?:上午|下午)\d{1,2}:\d{2})/g, "\n$1\n")
            .replace(/你說：/g, "\n__ROLE_USER__\n")
            .replace(/ChatGPT\s*說：/g, "\n__ROLE_ASSISTANT__\n")
            .replace(/Gemini\s*說：/g, "\n__ROLE_ASSISTANT__\n")
            .replace(/Claude\s*說：/g, "\n__ROLE_ASSISTANT__\n")
            .replace(/DeepSeek\s*說：/g, "\n__ROLE_ASSISTANT__\n");

        return text;
    }

    function parseRoleBlocksFromText(rawText) {
        const text = normalizeChatTranscriptMarkers(rawText);
        const lines = text.split("\n").map((line) => line.trim());
        const blocks = [];
        let currentRole = null;
        let buffer = [];

        const flush = () => {
            const body = cleanExportMultiline(buffer.join("\n"));
            if (currentRole && body && body.length >= 2 && !isNoisyAutoCopyBlockText(body)) {
                blocks.push({ role: currentRole, text: body });
            }
            buffer = [];
        };

        lines.forEach((line) => {
            if (!line) return;

            if (line === "__ROLE_USER__") {
                flush();
                currentRole = "user";
                return;
            }

            if (line === "__ROLE_ASSISTANT__") {
                flush();
                currentRole = "assistant";
                return;
            }

            const cleaned = cleanExportLine(line);
            if (!cleaned || isNoisyAutoCopyBlockText(cleaned)) {
                return;
            }

            if (!currentRole) {
                return;
            }

            buffer.push(cleaned);
        });

        flush();

        const deduped = [];
        const seen = new Set();
        blocks.forEach((block) => {
            const key = `${block.role}:${block.text.slice(0, 500)}`;
            if (seen.has(key)) return;
            seen.add(key);
            deduped.push(block);
        });

        return deduped;
    }

    function getMessageContentRoot(node) {
        if (!node || !node.querySelectorAll) return node || null;

        // For ChatGPT assistant messages, the useful answer body is usually inside markdown/prose.
        const richSelectors = [
            ".markdown",
            ".prose",
            "[class*='markdown']",
            "[class*='prose']",
            "[data-message-author-role='assistant'] .markdown",
            "[data-message-author-role='assistant'] .prose"
        ];

        const richCandidates = [];
        richSelectors.forEach((selector) => {
            try {
                node.querySelectorAll(selector).forEach((candidate) => {
                    const text = cleanExportMultiline(candidate.innerText || candidate.textContent || "");
                    const hasMedia = Boolean(candidate.querySelector("img,table,pre,code,ul,ol,blockquote"));
                    if ((text && text.length >= 2) || hasMedia) {
                        richCandidates.push({ candidate, score: text.length + (hasMedia ? 500 : 0) });
                    }
                });
            } catch (_) {}
        });

        if (richCandidates.length) {
            richCandidates.sort((a, b) => a.score - b.score);
            return richCandidates[richCandidates.length - 1].candidate;
        }

        // For user bubbles, there may be no markdown/prose. Prefer the smallest meaningful visible text container.
        const contentSelectors = [
            "[data-testid*='message']",
            "[class*='message-content']",
            "[class*='text-message']",
            "[class*='content']",
            "p",
            "div"
        ];

        const containers = [];
        contentSelectors.forEach((selector) => {
            try {
                node.querySelectorAll(selector).forEach((candidate) => {
                    if (candidate.closest?.("button,nav,aside,header,footer,form,textarea,input,select")) return;
                    const text = cleanExportMultiline(candidate.innerText || candidate.textContent || "");
                    if (!text || text.length < 2) return;
                    if (isNoisyAutoCopyBlockText(text)) return;
                    const rect = candidate.getBoundingClientRect?.();
                    const area = rect ? Math.max(1, rect.width * rect.height) : 1;
                    containers.push({ candidate, text, area, len: text.length });
                });
            } catch (_) {}
        });

        if (containers.length) {
            // Prefer a compact container for user text; avoid giant ancestors.
            containers.sort((a, b) => {
                const aScore = a.len * 10 - Math.min(a.area, 500000) / 1000;
                const bScore = b.len * 10 - Math.min(b.area, 500000) / 1000;
                return bScore - aScore;
            });
            return containers[0].candidate;
        }

        return node;
    }


    function getSessionBlocksFromDom() {
        const blocks = [];
        const seen = new Set();

        try {
            const roleNodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
            roleNodes.forEach((node) => {
                const role = node.getAttribute("data-message-author-role") || "message";
                if (!["user", "assistant", "tool"].includes(role)) return;

                const root = getMessageContentRoot(node) || getPrimaryContentRoot(node);
                const text = cleanExportText(root.innerText || root.textContent || "");
                const hasImage = Boolean(root.querySelector?.("img"));
                if ((!text || text.length < 2) && !hasImage) return;

                const key = `${role}:${text.slice(0, 500)}`;
                if (seen.has(key)) return;
                seen.add(key);

                blocks.push({ role, text, node: root });
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] role-node session extraction failed", error);
        }

        if (blocks.length >= 2) {
            return blocks;
        }

        // v1.34: Newer ChatGPT layouts may not expose stable data-message-author-role.
        // Use rich DOM message candidates before falling back to plain text.
        const domCandidates = collectDomMessageCandidates();
        if (domCandidates.length >= 1) {
            return domCandidates;
        }

        return blocks;
    }

    function getFullSessionBlocks() {
        const domBlocks = getSessionBlocksFromDom();
        if (domBlocks.length >= 1) return domBlocks;

        const main = document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
        const raw = safeText(main?.innerText || document.body.innerText || "");
        const parsed = parseRoleBlocksFromText(raw);

        if (parsed.length >= 1) return parsed;

        const rawSession = getCurrentSessionText();
        return parseRoleBlocksFromText(rawSession);
    }

    function roleBlocksToRawBlocks(blocks) {
        return blocks
            .map((block) => {
                const role = block.role || "message";
                const text = cleanExportText(block.text || "");
                if (!text) return "";
                return `## ${role}\n${text}`;
            })
            .filter(Boolean);
    }


    function splitRawSessionIntoBlocks(rawText) {
        const parsed = parseRoleBlocksFromText(rawText);
        if (parsed.length >= 1) {
            return roleBlocksToRawBlocks(parsed);
        }

        const text = safeText(rawText).replace(/\r\n/g, "\n").trim();
        if (!text) return [];

        const byRule = text
            .split(/\n\s*---\s*\n/g)
            .map((x) => cleanExportText(x.trim()))
            .filter((block) => {
                if (!block) return false;
                if (/^##\s+\w+\s*$/i.test(block)) return false;
                if (isNoisyAutoCopyBlockText(block)) return false;
                return block.length >= 2;
            });

        return byRule.length ? byRule : [cleanExportText(text)].filter(Boolean);
    }

    function createTranscriptBlockFromText(rawBlock, index) {
        let role = "message";
        let bodyText = cleanExportText(rawBlock.trim());

        const roleMatch = bodyText.match(/^##\s+([A-Za-z\u4e00-\u9fff_-]+)\s*\n([\s\S]*)$/);
        if (roleMatch) {
            role = roleMatch[1].toLowerCase();
            bodyText = cleanExportText(roleMatch[2].trim());
        }

        if (!bodyText || isNoisyAutoCopyBlockText(bodyText)) {
            return null;
        }

        const section = document.createElement("section");
        section.setAttribute("data-ai-prompt-bridge-message", String(index + 1));
        section.setAttribute("style", "margin:14px 0 18px 0;padding:8px 0 12px 0;border-bottom:1px solid #e5e7eb;max-width:980px;white-space:normal;");

        const heading = document.createElement("h3");
        heading.textContent = getRoleLabel(role);
        heading.setAttribute("style", "font-weight:700;margin:8px 0 10px;color:#6b7280;font-size:12pt;line-height:1.35;");
        section.appendChild(heading);

        const body = textToRichBlock(bodyText);
        if (!cleanExportText(body.innerText || body.textContent || "")) {
            return null;
        }
        applyOneNoteInlineStyles(body);
        section.appendChild(body);

        return section;
    }


    function createTranscriptBlock(role, sourceNode, index) {
        const section = document.createElement("section");
        section.setAttribute("data-ai-prompt-bridge-message", String(index + 1));
        section.setAttribute("style", "margin:14px 0;padding:10px 0;border-bottom:1px solid #e5e7eb;");

        const heading = document.createElement("h2");
        heading.textContent = `${index + 1}. ${getRoleLabel(role)}`;
        heading.setAttribute("style", "font-weight:700;margin:10px 0 8px;color:#111111;");
        section.appendChild(heading);

        const body = cleanRichClone(sourceNode);
        absolutizeImageSources(body);
        applyOneNoteInlineStyles(body);
        section.appendChild(body);

        return section;
    }

    function collectChatGPTTranscriptNodes() {
        const nodes = [];
        document.querySelectorAll('[data-message-author-role]').forEach((node) => {
            const role = node.getAttribute("data-message-author-role") || "";
            if (!["user", "assistant", "tool"].includes(role)) return;

            const root = getPrimaryContentRoot(node);
            const text = cleanExportText(root.innerText || root.textContent || "");
            const hasImage = root.querySelector("img");
            if (text.length < 2 && !hasImage) return;

            nodes.push({ role, node: root });
        });
        return nodes;
    }

    function collectGenericTranscriptNodes() {
        const site = getSiteName();
        const selectorsBySite = {
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

        const selectors = selectorsBySite[site] || [
            ".markdown",
            ".prose",
            "[class*='message']",
            "article"
        ];

        const nodes = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                document.querySelectorAll(selector).forEach((node) => {
                    if (seen.has(node)) return;
                    const text = normalizeText(node.innerText || node.textContent || "");
                    const hasImage = node.querySelector("img");
                    if (text.length < 10 && !hasImage) return;

                    seen.add(node);
                    nodes.push({ role: "message", node });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] transcript selector failed", selector, error);
            }
        });

        return nodes;
    }

    function getOfficialRoleDomBlocks() {
        const blocks = [];

        try {
            Array.from(document.querySelectorAll('[data-message-author-role]')).forEach((node, index) => {
                const role = node.getAttribute("data-message-author-role") || "message";
                if (!["user", "assistant", "tool"].includes(role)) return;

                const root = getMessageContentRoot(node) || getPrimaryContentRoot(node) || node;
                const text = cleanExportMultiline(root.innerText || root.textContent || "");
                const hasImage = Boolean(root.querySelector?.("img"));
                if ((!text || text.length < 2) && !hasImage) return;

                blocks.push({ role, node: root, text, order: index });
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] official role DOM extraction failed", error);
        }

        // Only remove exact adjacent duplicates caused by mirrored DOM, not different roles.
        const filtered = [];
        blocks.forEach((block) => {
            const prev = filtered[filtered.length - 1];
            if (prev && prev.role === block.role && prev.text === block.text) return;
            filtered.push(block);
        });

        return filtered;
    }

    function getRawMainTranscriptText() {
        const main = document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
        return safeText(main?.innerText || document.body.innerText || "");
    }


    function getFullSessionRichDomBlocks() {
        const blocks = [];
        const seen = new Set();

        const pushBlock = (role, node, order) => {
            if (!node) return;

            const root = getMessageContentRoot(node) || getPrimaryContentRoot(node) || node;
            const text = cleanExportText(root.innerText || root.textContent || "");
            const hasImage = Boolean(root.querySelector?.("img"));
            if ((!text || text.length < 2) && !hasImage) return;

            const key = `${role}:${text.slice(0, 600)}`;
            if (seen.has(key)) return;
            seen.add(key);

            blocks.push({ role, node: root, text, order });
        };

        try {
            // Best path: official ChatGPT roles. This preserves user questions and assistant answers.
            Array.from(document.querySelectorAll('[data-message-author-role]')).forEach((node, index) => {
                const role = node.getAttribute("data-message-author-role") || "message";
                if (!["user", "assistant", "tool"].includes(role)) return;
                pushBlock(role, node, index);
            });

            if (blocks.length >= 2) {
                blocks.sort((a, b) => a.order - b.order);
                return blocks;
            }

            // Fallback: conversation turns / articles. Infer role but still keep both sides.
            const candidates = [];
            const selectors = [
                "article",
                "[data-testid*='conversation-turn']",
                "[data-testid*='message']",
                "[class*='conversation-turn']",
                "[class*='group\\/conversation-turn']"
            ];

            const seenElements = new Set();
            selectors.forEach((selector) => {
                try {
                    document.querySelectorAll(selector).forEach((element) => {
                        if (seenElements.has(element)) return;
                        seenElements.add(element);
                        if (!isGoodMessageDomCandidate(element)) return;

                        const rect = element.getBoundingClientRect();
                        const text = cleanExportText(element.innerText || element.textContent || "");
                        if (!text && !element.querySelector("img")) return;

                        candidates.push({
                            element,
                            text,
                            top: rect.top + window.scrollY
                        });
                    });
                } catch (error) {
                    console.warn("[AI Prompt Bridge] full session DOM selector failed", selector, error);
                }
            });

            candidates.sort((a, b) => a.top - b.top);

            candidates.forEach((item, index) => {
                const role = inferMessageRoleFromElement(item.element, index);
                pushBlock(role, item.element, item.top);
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] full session rich DOM extraction failed", error);
        }

        blocks.sort((a, b) => a.order - b.order);
        return blocks;
    }

    function buildChatLikeMessageSection(block, index) {
        const role = block?.role || "message";
        const section = document.createElement("section");
        section.setAttribute("data-ai-prompt-bridge-message", String(index + 1));
        section.setAttribute(
            "style",
            "margin:0 0 22px 0;padding:0;max-width:980px;white-space:normal;word-break:break-word;overflow-wrap:anywhere;clear:both;"
        );

        let clone = null;

        if (role === "user") {
            // User prompt should be clean and complete. Do not clone broad user wrapper UI.
            clone = document.createElement("div");
            const userText = cleanExportMultiline(block?.text || block?.node?.innerText || block?.node?.textContent || "");
            paragraphizeText(userText).forEach((line) => {
                const p = document.createElement("p");
                p.textContent = line;
                p.style.margin = "0 0 6px 0";
                clone.appendChild(p);
            });
        } else {
            clone = block?.node ? cleanRichClone(block.node) : textToRichBlock(block?.text || "");
            absolutizeImageSources(clone);
            cleanOfficeExportElement(clone);
            normalizeOfficeLayoutStyles(clone);
        }

        const text = cleanExportMultiline(clone.innerText || clone.textContent || "");
        const hasImage = Boolean(clone.querySelector?.("img"));
        if (!text && !hasImage) return null;

        if (role === "user") {
            const bubbleRow = document.createElement("div");
            bubbleRow.setAttribute(
                "style",
                "width:100%;text-align:right;margin:10px 0 18px 0;clear:both;"
            );

            const bubble = document.createElement("div");
            bubble.setAttribute(
                "style",
                [
                    "display:inline-block",
                    "text-align:left",
                    "max-width:760px",
                    "background:#eef6ff",
                    "border-radius:18px",
                    "padding:10px 16px",
                    "font-family:'Microsoft JhengHei','Segoe UI',Arial,sans-serif",
                    "font-size:20pt",
                    "line-height:1.55",
                    "color:#111111",
                    "white-space:normal",
                    "word-break:break-word",
                    "overflow-wrap:anywhere"
                ].join(";")
            );
            bubble.appendChild(clone);
            bubbleRow.appendChild(bubble);
            section.appendChild(bubbleRow);
            return section;
        }

        const body = document.createElement("div");
        body.setAttribute(
            "style",
            [
                "margin:10px 0 20px 0",
                "max-width:900px",
                "font-family:'Microsoft JhengHei','Segoe UI',Arial,sans-serif",
                "font-size:20pt",
                "line-height:1.55",
                "color:#111111",
                "white-space:normal",
                "word-break:break-word",
                "overflow-wrap:anywhere"
            ].join(";")
        );
        body.appendChild(clone);
        section.appendChild(body);
        return section;
    }

    function isLayoutVisibleEnough(element) {
        if (!element || !element.getBoundingClientRect) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
        if (style && (style.display === "none" || style.visibility === "hidden")) return false;
        return true;
    }

    function isInsideExportNoise(element) {
        if (!element || !element.closest) return true;
        return Boolean(
            element.closest(`#${PANEL_ID}`) ||
            element.closest(`#${BUBBLE_ID}`) ||
            element.closest("#ai-prompt-bridge-startup-probe") ||
            element.closest("button,svg,textarea,input,select,form,nav,aside,header,footer,[contenteditable='true']") ||
            element.closest('[data-testid*="composer"]')
        );
    }

    function isUserBubbleLike(element) {
        if (!element || !element.getBoundingClientRect) return false;

        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1200;

        if (rect.left < viewportWidth * 0.32) {
            return false;
        }

        let node = element;
        let depth = 0;
        while (node && node !== document.body && depth < 8) {
            try {
                const style = window.getComputedStyle(node);
                const bg = style?.backgroundColor || "";
                const radius = parseFloat(style?.borderRadius || "0");

                // ChatGPT user bubble is usually a light blue / tinted rounded bubble.
                if (
                    radius >= 8 &&
                    (
                        /rgb\(\s*219\s*,\s*234\s*,\s*254\s*\)/.test(bg) ||
                        /rgb\(\s*239\s*,\s*246\s*,\s*255\s*\)/.test(bg) ||
                        /rgb\(\s*224\s*,\s*242\s*,\s*254\s*\)/.test(bg) ||
                        /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(bg)
                    )
                ) {
                    // Avoid white/transparent assistant body.
                    if (!/rgba?\(\s*255\s*,\s*255\s*,\s*255/.test(bg) && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) {
                        return true;
                    }
                }
            } catch (_) {}
            node = node.parentElement;
            depth += 1;
        }

        // Fallback: short right-side bubble-like text.
        const text = cleanExportMultiline(element.innerText || element.textContent || "");
        return rect.left > viewportWidth * 0.45 && text.length > 1 && text.length < 1200;
    }

    function inferRoleFromBlockElement(element) {
        const roleNode = element.closest?.("[data-message-author-role]");
        const role = roleNode?.getAttribute?.("data-message-author-role");
        if (role === "user" || role === "assistant" || role === "tool") return role;

        return isUserBubbleLike(element) ? "user" : "assistant";
    }

    function shouldSkipNestedStructuredBlock(element, selectedSet) {
        const listParent = element.parentElement?.closest?.("ol,ul");
        if ((element.tagName === "LI") && listParent && selectedSet.has(listParent)) {
            return true;
        }

        // If a parent blockquote/pre/table is selected, skip inner children.
        const parentBlock = element.parentElement?.closest?.("blockquote,pre,table");
        if (parentBlock && selectedSet.has(parentBlock)) {
            return true;
        }

        return false;
    }

    function collectStructuredDomTranscriptBlocks() {
        const main = document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
        if (!main) return [];

        const selector = [
            "h1", "h2", "h3", "h4",
            "p",
            "ol", "ul",
            "blockquote",
            "table",
            "pre"
        ].join(",");

        const rawElements = Array.from(main.querySelectorAll(selector))
            .filter((element) => {
                if (!isLayoutVisibleEnough(element)) return false;
                if (isInsideExportNoise(element)) return false;

                const text = cleanExportMultiline(element.innerText || element.textContent || "");
                const hasMedia = Boolean(element.querySelector("img,table,pre,code"));
                if ((!text || text.length < 2) && !hasMedia) return false;
                if (isNoisyAutoCopyBlockText(text)) return false;

                return true;
            });

        const selectedSet = new Set(rawElements);
        const elements = rawElements
            .filter((element) => !shouldSkipNestedStructuredBlock(element, selectedSet))
            .map((element) => {
                const rect = element.getBoundingClientRect();
                return {
                    element,
                    role: inferRoleFromBlockElement(element),
                    text: cleanExportMultiline(element.innerText || element.textContent || ""),
                    top: rect.top + window.scrollY,
                    left: rect.left,
                    height: rect.height
                };
            })
            .sort((a, b) => a.top - b.top || a.left - b.left);

        if (!elements.length) return [];

        const blocks = [];
        let current = null;
        let lastTop = null;

        const flush = () => {
            if (!current || !current.items.length) {
                current = null;
                return;
            }

            const wrapper = document.createElement("div");
            current.items.forEach((item) => {
                const cloned = cleanRichClone(item.element);
                absolutizeImageSources(cloned);
                cleanOfficeExportElement(cloned);
                normalizeOfficeLayoutStyles(cloned);
                wrapper.appendChild(cloned);
            });

            const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
            if (text || wrapper.querySelector("img,table,pre,code")) {
                blocks.push({
                    role: current.role,
                    node: wrapper,
                    text,
                    order: current.order
                });
            }
            current = null;
        };

        elements.forEach((item, index) => {
            const gap = lastTop === null ? 0 : item.top - lastTop;
            const roleChanged = current && current.role !== item.role;

            // User bubble is always its own turn. Assistant items are grouped until a user bubble or large gap.
            if (!current || roleChanged || (item.role === "user") || (gap > 260 && current.items.length > 0)) {
                flush();
                current = {
                    role: item.role,
                    items: [item],
                    order: item.top
                };
            } else {
                current.items.push(item);
            }

            lastTop = item.top + item.height;
        });

        flush();

        // Remove exact duplicate neighboring blocks only.
        const filtered = [];
        blocks.forEach((block) => {
            const prev = filtered[filtered.length - 1];
            if (prev && prev.role === block.role && prev.text === block.text) return;
            filtered.push(block);
        });

        return filtered;
    }


    function buildFullSessionTranscriptElement() {
        const transcript = document.createElement("div");
        transcript.setAttribute("data-ai-prompt-bridge-transcript", "1");
        transcript.setAttribute(
            "style",
            "font-family:'Microsoft JhengHei','Segoe UI',Arial,sans-serif;font-size:20pt;line-height:1.55;color:#111111;max-width:980px;white-space:normal;word-break:break-word;overflow-wrap:anywhere;"
        );

        // v1.34:
        // Alt+N must behave like "Alt+W for every loaded message".
        // 1) Official role DOM if available.
        // 2) Structured DOM blocks preserving p/ol/ul/blockquote/table/pre if role DOM is unavailable.
        // 3) Raw text parser only as the last fallback.
        let blocks = getOfficialRoleDomBlocks();

        if (blocks.length < 2) {
            const structured = collectStructuredDomTranscriptBlocks();
            if (structured.length >= 2) {
                blocks = structured;
            }
        }

        if (blocks.length < 1) {
            const parsed = parseRoleBlocksFromText(getRawMainTranscriptText());
            if (parsed.length >= 1) {
                blocks = parsed;
            }
        }

        let realIndex = 0;
        blocks.forEach((block) => {
            const section = buildChatLikeMessageSection(block, realIndex);
            if (section) {
                transcript.appendChild(section);
                realIndex += 1;
            }
        });

        return transcript;
    }

    function richElementToPlainText(root) {
        const lines = [];
        const walk = (node) => {
            if (!node) return;
            if (node.nodeType === Node.TEXT_NODE) {
                const text = cleanExportText(node.textContent || "");
                if (text) lines.push(text);
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const tag = node.tagName ? node.tagName.toLowerCase() : "";
            if (tag === "img") {
                const alt = node.getAttribute("alt") || "image";
                const src = node.getAttribute("src") || "";
                lines.push(`[Image: ${alt}${src ? " | " + src : ""}]`);
                return;
            }

            if (tag === "a") {
                const text = normalizeText(node.innerText || node.textContent || "");
                const href = node.getAttribute("href") || "";
                if (text || href) {
                    lines.push(`${text || "Link"}${href ? " (" + href + ")" : ""}`);
                }
                return;
            }

            node.childNodes.forEach(walk);
            if (["p", "div", "section", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr"].includes(tag)) {
                lines.push("\\n");
            }
        };

        walk(root);
        return normalizeText(lines.join(" "));
    }

    async function copyFullSessionRichTextForOffice(triggerName = "Alt+N") {
        // Full-session export MUST ignore current selection.
        // Alt+W is the only selection/single-answer rich copy shortcut.
        try {
            const selection = window.getSelection?.();
            if (selection && selection.rangeCount > 0) {
                selection.removeAllRanges();
            }
        } catch (_) {}

        const transcript = buildFullSessionTranscriptElement();
        // Do not run cleanOfficeExportElement() on the whole transcript here.
        // Each message clone is already cleaned; transcript-level cleanup strips the user bubble/background styles.
        normalizeOfficeLayoutStyles(transcript);

        const messageCount = transcript.querySelectorAll("[data-ai-prompt-bridge-message]").length;
        const textContent = richElementToPlainText(transcript);

        if (!textContent || textContent.length < 20) {
            alert("抓到的 session 內容太短。請先往上捲動載入舊訊息，再按 Alt+N。");
            return;
        }

        if (messageCount <= 1) {
            console.warn("[AI Prompt Bridge] full-session export captured only one message. The page may not have loaded older messages yet.");
        }

        // v1.34: Do not add AI Session Export / Source / URL metadata to OneNote/Word.
        // The user wants clean content only.
        const htmlContent = normalizeRichHtml(transcript.innerHTML);
        const plainText = textContent;

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([plainText], { type: "text/plain" })
                    })
                ]);

                const countLabel = messageCount ? `${messageCount} 則 / ` : "";
                const warn = messageCount <= 1 ? "（只抓到 1 則，請先往上捲動載入舊訊息）" : "";
                toast(`${triggerName} 全 Session 已複製到 OneNote / Word：${countLabel}${textContent.length} 字${warn}`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] full-session rich clipboard failed, fallback to plain text", error);
        }

        await copyText(plainText, `${triggerName} 已降級複製完整 Session 純文字（${messageCount || "?"} 則 / ${textContent.length} 字）`);
    }

    function isUtilityButtonText(text) {
        const t = normalizeText(text).toLowerCase();
        if (!t) return true;

        const utilityPatterns = [
            "copy",
            "copied",
            "複製",
            "send",
            "送出",
            "edit",
            "編輯",
            "share",
            "分享",
            "more",
            "更多",
            "thumb",
            "like",
            "dislike",
            "regenerate",
            "重新產生",
            "read aloud",
            "朗讀",
            "model",
            "close",
            "關閉"
        ];

        return utilityPatterns.some((pattern) => t === pattern || t.includes(pattern));
    }

    function preserveMeaningfulButtons(clone) {
        try {
            clone.querySelectorAll("button").forEach((button) => {
                const label = normalizeText([
                    button.innerText,
                    button.getAttribute("aria-label"),
                    button.getAttribute("title")
                ].filter(Boolean).join(" "));

                const links = Array.from(button.querySelectorAll("a[href]"));
                const images = Array.from(button.querySelectorAll("img"));

                const hasUsefulText = label.length >= 2 && !isUtilityButtonText(label);
                const hasUsefulContent = links.length > 0 || images.length > 0;

                if (!hasUsefulText && !hasUsefulContent) return;

                const replacement = document.createElement("div");
                replacement.setAttribute("data-ai-prompt-bridge-preserved-button", "1");
                replacement.setAttribute("style", "margin:6px 0;");

                if (links.length > 0) {
                    links.forEach((link) => replacement.appendChild(link.cloneNode(true)));
                }

                if (images.length > 0) {
                    images.forEach((img) => replacement.appendChild(img.cloneNode(true)));
                }

                if (hasUsefulText) {
                    const p = document.createElement("p");
                    p.textContent = label;
                    replacement.appendChild(p);
                }

                button.replaceWith(replacement);
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] preserve meaningful buttons failed", error);
        }
        return clone;
    }

    function cleanRichClone(inputElement) {
        const clone = inputElement.cloneNode(true);
        preserveMeaningfulButtons(clone);

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
            el.removeAttribute("data-testid");
            el.removeAttribute("aria-label");
            el.removeAttribute("role");

            // Keep styles that are added by AI Prompt Bridge itself for images / preserved blocks.
            if (!el.hasAttribute("data-ai-prompt-bridge-preserved-button") && el.tagName !== "IMG") {
                el.removeAttribute("style");
            }

            if (el.tagName === "A") {
                const href = el.getAttribute("href");
                if (href && href.startsWith("/")) {
                    try {
                        el.setAttribute("href", new URL(href, location.origin).href);
                    } catch (_) {}
                }
            }
        });

        absolutizeImageSources(clone);
        return clone;
    }

    function escapeHtml(value) {
        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }


    function applyOneNoteInlineStyles(root) {
        try {
            if (!root || !root.querySelectorAll) return root;

            root.setAttribute("style", [
                "font-family:'Microsoft JhengHei','Segoe UI',Calibri,'Noto Sans TC',Arial,sans-serif",
                "font-size:20pt",
                "line-height:1.6",
                "color:#111111",
                "background:#ffffff"
            ].join(";"));

            // Body text gets enlarged for OneNote readability.
            root.querySelectorAll("p, li, td, th, div, span").forEach((el) => {
                el.style.fontSize = "20pt";
                el.style.lineHeight = "1.6";
                el.style.color = "#111111";
                el.style.backgroundColor = "transparent";
            });

            // Preserve heading sizes from the source page as much as possible.
            // Only normalize color / spacing; do not force H1/H2/H3/H4 to 30/26/23/21pt.
            root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
                el.style.color = "#111111";
                el.style.fontWeight = el.style.fontWeight || "700";
                el.style.backgroundColor = "transparent";
                el.style.lineHeight = el.style.lineHeight || "1.35";
            });

            // Code remains smaller than body text for readability and layout.
            root.querySelectorAll("pre, code").forEach((el) => {
                el.style.fontSize = "16pt";
                el.style.lineHeight = "1.45";
            });

            root.querySelectorAll("table").forEach((el) => {
                el.style.borderCollapse = "collapse";
                el.style.width = "100%";
            });

            root.querySelectorAll("th, td").forEach((el) => {
                el.style.border = "1px solid #d1d5db";
                el.style.padding = "8px 10px";
                el.style.verticalAlign = "top";
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] apply inline OneNote styles failed", error);
        }
        return root;
    }


    function normalizeRichHtml(html) {
        const body = safeText(html).trim();

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body,
.ai-prompt-bridge-onenote-export {
  font-family: "Microsoft JhengHei", "Segoe UI", Calibri, "Noto Sans TC", Arial, sans-serif;
  font-size: 20pt;
  color: #111111;
  background: #ffffff;
  line-height: 1.6;
}
.ai-prompt-bridge-onenote-export p,
.ai-prompt-bridge-onenote-export li,
.ai-prompt-bridge-onenote-export td,
.ai-prompt-bridge-onenote-export th,
.ai-prompt-bridge-onenote-export div,
.ai-prompt-bridge-onenote-export span {
  font-size: 20pt;
  line-height: 1.6;
}
.ai-prompt-bridge-onenote-export h1,
.ai-prompt-bridge-onenote-export h2,
.ai-prompt-bridge-onenote-export h3,
.ai-prompt-bridge-onenote-export h4,
.ai-prompt-bridge-onenote-export h5,
.ai-prompt-bridge-onenote-export h6 {
  color: #111111;
  font-weight: 700;
  line-height: 1.35;
  margin: 14px 0 8px;
}
.ai-prompt-bridge-onenote-export p {
  margin: 8px 0;
}
.ai-prompt-bridge-onenote-export ul,
.ai-prompt-bridge-onenote-export ol {
  margin: 8px 0 8px 28px;
  padding-left: 18px;
}
.ai-prompt-bridge-onenote-export li {
  margin: 5px 0;
}
.ai-prompt-bridge-onenote-export table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}
.ai-prompt-bridge-onenote-export th,
.ai-prompt-bridge-onenote-export td {
  border: 1px solid #d1d5db;
  padding: 8px 10px;
  vertical-align: top;
}
.ai-prompt-bridge-onenote-export th {
  background: #f3f4f6;
  font-weight: 700;
}
.ai-prompt-bridge-onenote-export pre {
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 10px;
  border-radius: 6px;
  font-size: 16pt;
  line-height: 1.45;
}
.ai-prompt-bridge-onenote-export code {
  font-family: Consolas, "Courier New", monospace;
  background: #f3f4f6;
  padding: 1px 4px;
  font-size: 16pt;
}
.ai-prompt-bridge-onenote-export pre code {
  font-size: 16pt;
  background: transparent;
  padding: 0;
}
.ai-prompt-bridge-onenote-export blockquote {
  border-left: 4px solid #d1d5db;
  margin: 10px 0;
  padding-left: 12px;
  color: #374151;
}
.ai-prompt-bridge-onenote-export hr {
  border: 0;
  border-top: 1px solid #d1d5db;
  margin: 16px 0;
}
</style>
</head>
<body>
<div class="ai-prompt-bridge-onenote-export" style="font-family:'Microsoft JhengHei','Segoe UI',Calibri,'Noto Sans TC',Arial,sans-serif;font-size:20pt;line-height:1.6;color:#111111;background:#ffffff;">
${body}
</div>
</body>
</html>`;
    }

    async function copyRichTextForOffice() {
        const target = getAltWRichCopyTarget();

        if (!target || !target.element) {
            alert("Alt+W 仍沒有找到最新 AI 回答。請手動框選要複製的段落後再按 Alt+W；完整 session 請用 Alt+N。");
            return;
        }

        if (target.source !== "selection" && isLikelyWholeSessionElement(target.element)) {
            alert("Alt+W 只複製單段內容。偵測到候選內容像完整 session，已停止複製。請手動框選單段後再按 Alt+W；完整 session 請用 Alt+N。");
            return;
        }

        const clone = cleanRichClone(target.element);
        absolutizeImageSources(clone);
        cleanOfficeExportElement(clone);
        const textContent = richElementToPlainText(clone);

        if (!textContent || textContent.length < 2) {
            alert("抓到的內容是空的，請改用手動選取後再按 Alt+W。");
            return;
        }

        applyOneNoteInlineStyles(clone);
        const htmlContent = normalizeRichHtml(clone.innerHTML || `<pre>${escapeHtml(textContent)}</pre>`);

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([textContent], { type: "text/plain" })
                    })
                ]);
                toast(`Alt+W 已複製最新回答整段到 OneNote / Word：${textContent.length} 字`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] rich clipboard failed, fallback to plain text", error);
        }

        await copyText(textContent, `Alt+W 已降級複製最新回答純文字（${textContent.length} 字）`);
    }


    async function captureCurrentAnswer() {
        const selected = getSelectedText();
        let text = getLastAnswer();

        if (!text) {
            const fallback = getLatestAnswerElement();
            text = fallback ? normalizeText(fallback.innerText || fallback.textContent || "") : "";
        }

        if (!text) {
            alert("沒有抓到內容。請先手動選取文字，或確認目前頁面有 AI 回覆。");
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

    async function copyFullSessionRawText() {
        await captureFullSession();
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

    function isInteractivePanelTarget(target) {
        if (!target || !target.closest) return false;

        return Boolean(target.closest([
            "button",
            "select",
            "option",
            "input",
            "textarea",
            "a",
            "label",
            "[contenteditable='true']",
            "[role='button']",
            "[data-ai-bridge-no-drag='1']"
        ].join(",")));
    }

    function makeDraggable(panel, dragSurface, clickHandle = null) {
        let isDragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        dragSurface.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return;
            if (isInteractivePanelTarget(event.target)) return;

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
            panel.style.cursor = "grabbing";

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
            panel.style.cursor = "";

            await savePanelPosition(panel);

            if (moved) {
                panel.dataset.justDragged = "1";
                if (clickHandle) {
                    clickHandle.dataset.justDragged = "1";
                }

                setTimeout(() => {
                    panel.dataset.justDragged = "0";
                    if (clickHandle) {
                        clickHandle.dataset.justDragged = "0";
                    }
                }, 180);
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
        panel.title = "空白處可拖曳移動；按鈕與下拉選單仍可正常點擊";
        panel.style.display = hidden ? "none" : "block";

        await restorePanelPosition(panel);

        const title = document.createElement("div");
        title.className = "ai-bridge-panel-title";
        title.style.fontWeight = "700";
        title.style.fontSize = "13px";
        title.style.marginBottom = "6px";
        title.style.cursor = "grab";
        title.style.color = "#ffffff";
        title.title = "可拖曳移動；點擊可收合 / 展開。面板其他非功能區域也可拖曳。";

        const content = document.createElement("div");
        content.style.display = collapsed ? "none" : "flex";
        content.style.flexDirection = "column";
        content.style.gap = "6px";

        title.addEventListener("click", async (event) => {
            if (event.detail !== 1) return;
            if (title.dataset.justDragged === "1" || panel.dataset.justDragged === "1") return;
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
        content.appendChild(createButton("⑦ Alt+S 全 Session 原始純文字", copyFullSessionRawText, "#be123c"));
        content.appendChild(createButton("⑨ Alt+N 全 Session → OneNote/Word 20pt", () => copyFullSessionRichTextForOffice("Alt+N"), "#d97706"));
        content.appendChild(createButton("⑫ 整理成筆記 Prompt Alt+Shift+N", () => copyPrompt(buildOneNotePrompt, "已複製 OneNote 筆記整理 Prompt"), "#92400e"));
        content.appendChild(createButton("⑩ Alt+W 最新回答整段 → OneNote/Word", copyRichTextForOffice, "#0891b2"));
        content.appendChild(createButton("⑪ 全 Session → OneNote/Word 備用按鈕", () => copyFullSessionRichTextForOffice("Button"), "#0e7490"));
        content.appendChild(createButton("⑧ 重置面板位置", async () => {
            const p = document.getElementById(PANEL_ID);
            if (p) {
                await resetPanelPosition(p);
                await setHidden(p, false);
                toast("面板位置已重置到右下角");
            }
        }, "#0f766e"));

        const hint = document.createElement("div");
        hint.textContent = "Alt+W=最新回答整段 / Alt+N=全Session到OneNote / Alt+S=全Session原文";
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
        makeDraggable(panel, panel, title);
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
        const key = (event.key || "").toLowerCase();
        const code = event.code || "";

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "c" || code === "KeyC")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await captureCurrentAnswer();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "v" || code === "KeyV")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyPrompt(buildCursorFix, "已複製 Cursor Fix Prompt");
        }

        if (event.altKey && event.shiftKey && !event.ctrlKey && (key === "s" || code === "KeyS")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyFullSessionRawText();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "s" || code === "KeyS")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyFullSessionRawText();
        }

        if (event.altKey && event.shiftKey && !event.ctrlKey && (key === "n" || code === "KeyN")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyPrompt(buildOneNotePrompt, "已複製 OneNote 筆記整理 Prompt");
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "n" || code === "KeyN")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyFullSessionRichTextForOffice("Alt+N");
        }

        if (event.altKey && event.shiftKey && !event.ctrlKey && (key === "w" || code === "KeyW")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyRichTextForOffice();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "w" || code === "KeyW")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await copyRichTextForOffice();
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "b" || code === "KeyB")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const panel = document.getElementById(PANEL_ID);

            if (!panel || panel.style.display === "none") {
                await showPanelAtDefaultPosition();
                return;
            }

            await setHidden(panel, true);
        }

        if (event.altKey && !event.shiftKey && !event.ctrlKey && (key === "r" || code === "KeyR")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            await showPanelAtDefaultPosition();
        }
    }, true);

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
        GM_registerMenuCommand("Test Shortcut / Copy Raw Session Now", async () => {
            await copyFullSessionRawText();
        });
        GM_registerMenuCommand("Copy Full Session Raw Text (Alt+S)", async () => {
            await copyFullSessionRawText();
        });
        GM_registerMenuCommand("Alt+W Copy Single Answer Rich Text", async () => {
            await copyRichTextForOffice();
        });
        GM_registerMenuCommand("Alt+N Copy Full Session Rich Text", async () => {
            await copyFullSessionRichTextForOffice("Menu Alt+N");
        });
    }

    onReady(async () => {
        showStartupProbe();
        await ensurePanel();
        setTimeout(ensurePanel, 800);
        setTimeout(ensurePanel, 2000);
    });
})();
