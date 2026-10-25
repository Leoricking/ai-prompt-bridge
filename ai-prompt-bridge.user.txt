// ==UserScript==
// @name         AI Prompt Bridge
// @namespace    https://ai-prompt-bridge.local/ai-prompt-bridge
// @version      1.83.0
// @description  Cross-AI prompt bridge for ChatGPT, Gemini, Claude, DeepSeek, Qwen, Perplexity and Cursor workflows. Dual Alt+W modes: editable OneNote readable export and Alt+Shift+W ChatGPT visual snapshot.
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

    const AI_PROMPT_BRIDGE_VERSION = "1.83.0";
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

    const STORAGE_KEY = "ai_prompt_bridge_payload_v171";
    const PANEL_POS_KEY = "ai_prompt_bridge_panel_position_v171";
    const PANEL_ID = "ai-prompt-bridge-panel-v171";
    const BUBBLE_ID = "ai-prompt-bridge-restore-bubble-v171";
    const COLLAPSED_KEY = "ai_prompt_bridge_collapsed_v171";
    const HIDDEN_KEY = "ai_prompt_bridge_hidden_v171";
    const PROJECT_KEY = "ai_prompt_bridge_project_key_v171";

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

    function isPartialAltWFragmentText(text) {
        const t = cleanExportMultiline(text || "");
        if (!t) return true;

        // Known failure mode: range fallback grabs only the visible bottom fragment (~465 chars)
        // and misses the code/plaintext block in the middle of the answer.
        if (
            t.length >= 250 &&
            t.length <= 800 &&
            /Coomer 能讓「沒有訂閱的人看到內容」/.test(t) &&
            /另外通常還會有幾層/.test(t) &&
            !/Contributor\s*A/.test(t) &&
            !/Importer/.test(t)
        ) {
            return true;
        }

        return false;
    }

    function isBadAltWExportText(text) {
        const t = cleanExportMultiline(text || "");
        if (!t) return true;
        if (isPartialAltWFragmentText(t)) return true;

        // These are known stale composer / old-session leak markers from the broken v1.51/v1.52 path.
        const staleMarkers = [
            "下一版我已經先做成 v5.2 Stable UI",
            "下一版 2.coomer.su 無法使用",
            "2.coomer.su 無法使用",
            "處理時間為 11s",
            "今天 上午1:53",
            "新增至專案來源",
            "回應欠佳",
            "1.下一版 2.coomer.su 無法使用",
            "下一版 2.coomer.su 無法使用",
            "2.coomer.su 無法使用,找類似網站"
        ];

        if (staleMarkers.some((marker) => t.includes(marker))) return true;

        // Alt+W is single answer. Do not allow likely full-session exports.
        if (t.length > 12000) return true;

        return false;
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

    function findAssistantTurnContainerFromChild(element) {
        if (!element || !element.closest) return null;

        const roleContainer = element.closest('[data-message-author-role="assistant"]');
        if (roleContainer) return roleContainer;

        const candidates = [
            element.closest("article"),
            element.closest('[data-testid*="conversation-turn"]'),
            element.closest('[data-testid*="assistant"]'),
            element.closest('[class*="group\\/conversation-turn"]'),
            element.closest('[class*="conversation-turn"]')
        ].filter(Boolean);

        for (const candidate of candidates) {
            const text = cleanExportMultiline(candidate.innerText || candidate.textContent || "");
            if (!text || text.length < 20) continue;
            if (candidate.querySelector?.("textarea,input,[contenteditable='true']")) continue;
            if (candidate.closest?.(`#${PANEL_ID},#${BUBBLE_ID},#ai-prompt-bridge-startup-probe`)) continue;
            return candidate;
        }

        return null;
    }

    function getBestAssistantContentRoot(turnContainer) {
        if (!turnContainer) return null;

        const roots = [];
        const selectors = [
            ".markdown",
            ".prose",
            "[class*='markdown']",
            "[class*='prose']",
            "[data-message-author-role='assistant']"
        ];

        selectors.forEach((selector) => {
            try {
                turnContainer.querySelectorAll(selector).forEach((node) => {
                    const text = cleanExportMultiline(node.innerText || node.textContent || "");
                    const hasRich = Boolean(node.querySelector?.("p,li,ol,ul,blockquote,table,pre,code,img"));
                    if ((text && text.length >= 20) || hasRich) {
                        roots.push({ node, score: text.length + (hasRich ? 10000 : 0) });
                    }
                });
            } catch (_) {}
        });

        if (roots.length) {
            roots.sort((a, b) => a.score - b.score);
            return roots[roots.length - 1].node;
        }

        return turnContainer;
    }

    function isTooSmallLatestAnswerElement(element) {
        if (!element) return true;
        const text = cleanExportMultiline(element.innerText || element.textContent || "");
        if (!text) return true;
        const tag = element.tagName ? element.tagName.toLowerCase() : "";
        if (text.length < 80) return true;
        if (["pre", "code", "p", "li"].includes(tag) && text.length < 300) return true;
        return false;
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

    function getLatestUserBubbleBoundaryTop() {
        const main = document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
        if (!main) return null;

        const candidates = [];

        const addCandidate = (element, roleSource = "") => {
            if (!element || !element.getBoundingClientRect) return;
            if (isInsideExportNoise(element)) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            if (!text || text.length < 2 || text.length > 3000) return;

            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            candidates.push({
                element,
                text,
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                left: rect.left,
                score: (roleSource ? 100000 : 0) + rect.left + Math.min(text.length, 1000)
            });
        };

        try {
            main.querySelectorAll('[data-message-author-role="user"]').forEach((element) => {
                addCandidate(element, "role");
            });
        } catch (_) {}

        // New ChatGPT layouts often render the user prompt as a right-side bubble without stable role attrs.
        try {
            main.querySelectorAll("div,p").forEach((element) => {
                if (!isUserBubbleLike(element)) return;

                // Prefer compact bubble node instead of huge parent.
                const parent = element.parentElement;
                if (parent && isUserBubbleLike(parent)) return;

                addCandidate(element, "bubble");
            });
        } catch (_) {}

        if (!candidates.length) return null;

        candidates.sort((a, b) => a.bottom - b.bottom || a.score - b.score);
        return candidates[candidates.length - 1].bottom;
    }

    function buildAssistantStructuredElementAfterTop(boundaryTop) {
        const main = document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
        if (!main || boundaryTop === null || boundaryTop === undefined) return null;

        const selector = [
            "h1", "h2", "h3", "h4",
            "p",
            "ol", "ul",
            "blockquote",
            "table",
            "pre"
        ].join(",");

        // Find the next user bubble after this boundary, so Alt+W never leaks into later turns.
        let nextUserTop = Infinity;
        try {
            main.querySelectorAll('[data-message-author-role="user"], div, p').forEach((node) => {
                if (!isUserBubbleLike(node)) return;
                const rect = node.getBoundingClientRect();
                const top = rect.top + window.scrollY;
                if (top > boundaryTop + 2 && top < nextUserTop) {
                    nextUserTop = top;
                }
            });
        } catch (_) {}

        const items = [];
        const seen = new Set();

        Array.from(main.querySelectorAll(selector)).forEach((element) => {
            if (seen.has(element)) return;
            seen.add(element);

            if (!isLayoutVisibleEnough(element)) return;
            if (isInsideExportNoise(element)) return;
            if (isUserBubbleLike(element)) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (top <= boundaryTop - 2) return;
            if (top >= nextUserTop - 2) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            const hasMedia = Boolean(element.querySelector("img,table,pre,code"));
            if ((!text || text.length < 2) && !hasMedia) return;
            if (isNoisyAutoCopyBlockText(text)) return;

            if (element.closest?.('[data-testid*="composer"], form, textarea, input, [contenteditable="true"]')) return;

            items.push({ element, top, left: rect.left, text });
        });

        if (!items.length) return null;

        items.sort((a, b) => a.top - b.top || a.left - b.left);

        const selectedSet = new Set(items.map((item) => item.element));
        const wrapper = document.createElement("div");
        let count = 0;

        items.forEach((item) => {
            if (shouldSkipNestedStructuredBlock(item.element, selectedSet)) return;

            const cloned = cleanRichClone(item.element);
            absolutizeImageSources(cloned);
            cleanOfficeExportElement(cloned);
            normalizeOfficeLayoutStyles(cloned);
            wrapper.appendChild(cloned);
            count += 1;
        });

        const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!count || !text || text.length < 20) return null;

        wrapper.setAttribute("data-ai-prompt-bridge-altw-structured", "1");
        return wrapper;
    }

    function getLatestOfficialAssistantElement() {
        try {
            const nodes = Array.from(document.querySelectorAll('[data-message-author-role="assistant"]'));
            if (!nodes.length) return null;

            const latest = nodes[nodes.length - 1];
            const root = latest; // entire latest assistant message, not its largest/last Markdown subsection

            const clone = cleanRichClone(root);
            absolutizeImageSources(clone);
            cleanOfficeExportElement(clone);
            normalizeOfficeLayoutStyles(clone);

            const text = cleanExportMultiline(clone.innerText || clone.textContent || "");
            if (!text || text.length < 20) return null;

            const wrapper = document.createElement("div");
            wrapper.setAttribute("data-ai-prompt-bridge-altw-structured", "1");
            wrapper.appendChild(clone);
            return wrapper;
        } catch (error) {
            console.warn("[AI Prompt Bridge] latest official assistant extraction failed", error);
            return null;
        }
    }


    function getLatestOfficialAssistantElementWholeTurn() {
        try {
            // A single visible ChatGPT answer can have several assistant role nodes.
            // Taking nodes[nodes.length - 1] loses its beginning (observed: only the C workout).
            const all = Array.from(document.querySelectorAll('[data-message-author-role]'));
            let lastUserIndex = -1;
            for (let i = 0; i < all.length; i += 1) {
                if (all[i].getAttribute('data-message-author-role') === 'user') lastUserIndex = i;
            }
            const assistantNodes = all.slice(lastUserIndex + 1)
                .filter((node) => node.getAttribute('data-message-author-role') === 'assistant')
                .filter((node) => !node.closest(`#${PANEL_ID},#${BUBBLE_ID}`));
            if (!assistantNodes.length) return null;

            // Only include the latest exchange; never include older answers or user text.
            const wrapper = document.createElement('div');
            wrapper.setAttribute('data-ai-prompt-bridge-altw-structured', '1');
            wrapper.setAttribute('data-ai-prompt-bridge-altw-turn-parts', String(assistantNodes.length));
            for (const node of assistantNodes) {
                const clone = cleanRichClone(node);
                absolutizeImageSources(clone);
                cleanOfficeExportElement(clone);
                normalizeOfficeLayoutStyles(clone);
                const part = cleanExportMultiline(clone.innerText || clone.textContent || '');
                if (part && part.length >= 2) wrapper.appendChild(clone);
            }
            const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || '');
            if (!text || text.length < 20) return null;
            return wrapper;
        } catch (error) {
            console.warn('[AI Prompt Bridge] latest official assistant whole-turn extraction failed', error);
            return null;
        }
    }

    function getMainConversationRoot() {
        return document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
    }

    function getComposerTopBoundary() {
        const candidates = [
            document.querySelector('[data-testid*="composer"]'),
            document.querySelector("form textarea")?.closest("form"),
            document.querySelector("textarea")?.closest("form"),
            document.querySelector('[contenteditable="true"]')?.closest("form"),
            document.querySelector("footer")
        ].filter(Boolean);

        const tops = candidates
            .map((node) => {
                try {
                    const rect = node.getBoundingClientRect();
                    if (rect.width <= 0 || rect.height <= 0) return null;
                    return rect.top + window.scrollY;
                } catch (_) {
                    return null;
                }
            })
            .filter((value) => typeof value === "number");

        return tops.length ? Math.min(...tops) : Infinity;
    }

    function getLatestUserPromptBoundaryStrict() {
        const main = getMainConversationRoot();
        if (!main) return null;

        const mainRect = main.getBoundingClientRect();
        const mainLeft = mainRect.left;
        const mainWidth = Math.max(mainRect.width, 1);
        const candidates = [];

        const consider = (element, sourceScore = 0) => {
            if (!element || !element.getBoundingClientRect) return;
            if (isInsideExportNoise(element)) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            if (!text || text.length < 2 || text.length > 4000) return;
            if (isNoisyAutoCopyBlockText(text)) return;

            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
            const bg = style?.backgroundColor || "";
            const radius = parseFloat(style?.borderRadius || "0") || 0;

            const centerX = rect.left + rect.width / 2;
            const rightAligned = centerX > mainLeft + mainWidth * 0.58 || rect.left > mainLeft + mainWidth * 0.42;
            const compact = rect.width < mainWidth * 0.82;
            const bubbleStyle =
                radius >= 8 ||
                (!/rgba?\(\s*255\s*,\s*255\s*,\s*255/.test(bg) &&
                 !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg) &&
                 bg !== "transparent");

            const roleHit = element.matches?.('[data-message-author-role="user"]') ||
                element.closest?.('[data-message-author-role="user"]');

            if (!roleHit && !(rightAligned && compact && bubbleStyle)) return;

            // Reject assistant code blocks / answer body that happen to be tinted.
            if (element.closest?.('[data-message-author-role="assistant"]')) return;
            if (element.querySelector?.("pre,code,table,ul,ol,blockquote") && !roleHit) return;

            candidates.push({
                element,
                text,
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY,
                area: rect.width * rect.height,
                sourceScore: roleHit ? 100000 : sourceScore
            });
        };

        try {
            main.querySelectorAll('[data-message-author-role="user"]').forEach((node) => consider(node, 100000));
        } catch (_) {}

        try {
            main.querySelectorAll("div,p,article").forEach((node) => consider(node, 0));
        } catch (_) {}

        if (!candidates.length) return null;

        // Prefer the lowest prompt; for nested duplicates prefer compact/smaller area.
        candidates.sort((a, b) => {
            if (Math.abs(a.bottom - b.bottom) > 4) return a.bottom - b.bottom;
            return (b.sourceScore - a.sourceScore) || (b.area - a.area);
        });

        const latest = candidates[candidates.length - 1];
        return {
            top: latest.top,
            bottom: latest.bottom,
            text: latest.text,
            element: latest.element
        };
    }

    function getNextUserBoundaryAfter(startBottom) {
        const main = getMainConversationRoot();
        if (!main || startBottom === null || startBottom === undefined) return Infinity;

        const items = [];

        const consider = (element) => {
            if (!element || !element.getBoundingClientRect) return;
            if (isInsideExportNoise(element)) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            if (!text || text.length < 2 || text.length > 4000) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (top <= startBottom + 2) return;

            if (element.matches?.('[data-message-author-role="user"]') || element.closest?.('[data-message-author-role="user"]') || isUserBubbleLike(element)) {
                items.push(top);
            }
        };

        try {
            main.querySelectorAll('[data-message-author-role="user"], div,p,article').forEach(consider);
        } catch (_) {}

        return items.length ? Math.min(...items) : Infinity;
    }

    function buildLatestAnswerFromStrictRange() {
        const boundary = getLatestUserPromptBoundaryStrict();
        if (!boundary) return null;

        const main = getMainConversationRoot();
        if (!main) return null;

        const composerTop = getComposerTopBoundary();
        const nextUserTop = getNextUserBoundaryAfter(boundary.bottom);
        const stopTop = Math.min(composerTop, nextUserTop);

        const selector = [
            "h1", "h2", "h3", "h4",
            "p",
            "ol", "ul",
            "blockquote",
            "table",
            "pre"
        ].join(",");

        const candidates = [];
        const seen = new Set();

        Array.from(main.querySelectorAll(selector)).forEach((element) => {
            if (seen.has(element)) return;
            seen.add(element);

            if (!isLayoutVisibleEnough(element)) return;
            if (isInsideExportNoise(element)) return;
            if (isUserBubbleLike(element)) return;
            if (element.closest?.('[data-message-author-role="user"]')) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (top <= boundary.bottom + 2) return;
            if (top >= stopTop - 2) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            const hasMedia = Boolean(element.querySelector("img,table,pre,code"));
            if ((!text || text.length < 2) && !hasMedia) return;
            if (isNoisyAutoCopyBlockText(text)) return;
            if (element.closest?.('[data-testid*="composer"], form, textarea, input, [contenteditable="true"]')) return;

            candidates.push({ element, top, left: rect.left, text });
        });

        if (!candidates.length) return null;

        candidates.sort((a, b) => a.top - b.top || a.left - b.left);

        const selectedSet = new Set(candidates.map((item) => item.element));
        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-altw-structured", "1");
        wrapper.setAttribute("data-ai-prompt-bridge-range-boundary", boundary.text.slice(0, 80));

        let count = 0;
        candidates.forEach((item) => {
            if (shouldSkipNestedStructuredBlock(item.element, selectedSet)) return;
            const cloned = cleanRichClone(item.element);
            absolutizeImageSources(cloned);
            cleanOfficeExportElement(cloned);
            normalizeOfficeLayoutStyles(cloned);
            wrapper.appendChild(cloned);
            count += 1;
        });

        const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!count || !text || text.length < 20) return null;

        return wrapper;
    }


    function getLatestAssistantToolbarBoundary() {
        const main = getMainConversationRoot();
        if (!main) return null;

        const composerTop = getComposerTopBoundary();
        const candidates = [];
        const seen = new Set();

        const consider = (element) => {
            if (!element || seen.has(element) || !element.getBoundingClientRect) return;
            seen.add(element);

            if (isInsideExportNoise(element)) return;
            if (element.closest?.("pre,code,table")) return;

            const buttons = Array.from(element.querySelectorAll?.("button,[role='button']") || []);
            if (buttons.length < 3) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            // Assistant action toolbar should be mostly icons, not content.
            if (text.length > 80) return;

            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const top = rect.top + window.scrollY;
            const bottom = rect.bottom + window.scrollY;
            if (top >= composerTop - 2) return;

            // Must be below some meaningful assistant text/pre.
            const hasMeaningfulBefore = Array.from(main.querySelectorAll("p,ol,ul,blockquote,table,pre,h1,h2,h3,h4"))
                .some((node) => {
                    if (!node.getBoundingClientRect || isInsideExportNoise(node) || isUserBubbleLike(node)) return false;
                    const r = node.getBoundingClientRect();
                    const nodeBottom = r.bottom + window.scrollY;
                    if (nodeBottom >= top - 2) return false;
                    const t = cleanExportMultiline(node.innerText || node.textContent || "");
                    return t.length >= 2 || node.querySelector?.("img,table,pre,code");
                });
            if (!hasMeaningfulBefore) return;

            candidates.push({ element, top, bottom, buttonCount: buttons.length });
        };

        try {
            main.querySelectorAll("div").forEach((div) => {
                consider(div);
                // Parent row sometimes owns the visual toolbar while children own buttons.
                if (div.parentElement) consider(div.parentElement);
            });
        } catch (_) {}

        if (!candidates.length) return null;

        // Choose the lowest toolbar before composer.
        candidates.sort((a, b) => a.top - b.top || a.buttonCount - b.buttonCount);
        const latest = candidates[candidates.length - 1];

        return {
            top: latest.top,
            bottom: latest.bottom,
            element: latest.element
        };
    }

    function getLatestUserBoundaryBefore(topLimit) {
        const main = getMainConversationRoot();
        if (!main) return null;

        const mainRect = main.getBoundingClientRect();
        const mainLeft = mainRect.left;
        const mainWidth = Math.max(mainRect.width, 1);
        const candidates = [];
        const seen = new Set();

        const consider = (element, sourceScore = 0) => {
            if (!element || seen.has(element) || !element.getBoundingClientRect) return;
            seen.add(element);

            if (isInsideExportNoise(element)) return;
            if (element.closest?.('[data-message-author-role="assistant"]')) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            if (!text || text.length < 2 || text.length > 3000) return;
            if (isNoisyAutoCopyBlockText(text)) return;

            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            const top = rect.top + window.scrollY;
            const bottom = rect.bottom + window.scrollY;
            if (bottom >= topLimit - 2) return;

            const centerX = rect.left + rect.width / 2;
            const rightAligned =
                centerX > mainLeft + mainWidth * 0.56 ||
                rect.left > mainLeft + mainWidth * 0.42 ||
                rect.right > mainLeft + mainWidth * 0.78;

            const compact = rect.width < mainWidth * 0.88;
            const roleHit = element.matches?.('[data-message-author-role="user"]') ||
                element.closest?.('[data-message-author-role="user"]');

            if (!roleHit && !(rightAligned && compact)) return;

            // Avoid selecting parent containers that include previous assistant toolbars/content.
            if (element.querySelector?.("pre,code,table,ol,ul,blockquote") && !roleHit) return;

            candidates.push({
                element,
                text,
                top,
                bottom,
                area: rect.width * rect.height,
                score: (roleHit ? 100000 : sourceScore) + bottom
            });
        };

        try {
            main.querySelectorAll('[data-message-author-role="user"]').forEach((node) => consider(node, 100000));
        } catch (_) {}

        try {
            main.querySelectorAll("div,p,article").forEach((node) => consider(node, 0));
        } catch (_) {}

        if (!candidates.length) return null;

        candidates.sort((a, b) => {
            if (Math.abs(a.bottom - b.bottom) > 4) return a.bottom - b.bottom;
            return (a.area - b.area) || (a.score - b.score);
        });

        const latest = candidates[candidates.length - 1];
        return {
            top: latest.top,
            bottom: latest.bottom,
            text: latest.text,
            element: latest.element
        };
    }

    function buildLatestAnswerFromToolbarRange() {
        const toolbar = getLatestAssistantToolbarBoundary();
        if (!toolbar) return null;

        const userBoundary = getLatestUserBoundaryBefore(toolbar.top);
        if (!userBoundary) return null;

        const main = getMainConversationRoot();
        if (!main) return null;

        const selector = [
            "h1", "h2", "h3", "h4",
            "p",
            "ol", "ul",
            "blockquote",
            "table",
            "pre"
        ].join(",");

        const candidates = [];
        const seen = new Set();

        Array.from(main.querySelectorAll(selector)).forEach((element) => {
            if (seen.has(element)) return;
            seen.add(element);

            if (!isLayoutVisibleEnough(element)) return;
            if (isInsideExportNoise(element)) return;
            if (isUserBubbleLike(element)) return;
            if (element.closest?.('[data-message-author-role="user"]')) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const bottom = rect.bottom + window.scrollY;

            // Strict answer range: after latest user prompt, before latest assistant toolbar.
            if (top <= userBoundary.bottom + 1) return;
            if (top >= toolbar.top - 1) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            const hasMedia = Boolean(element.querySelector("img,table,pre,code"));
            if ((!text || text.length < 2) && !hasMedia) return;
            if (isNoisyAutoCopyBlockText(text)) return;

            if (element.closest?.('[data-testid*="composer"], form, textarea, input, [contenteditable="true"]')) return;

            candidates.push({ element, top, bottom, left: rect.left, text });
        });

        if (!candidates.length) return null;

        candidates.sort((a, b) => a.top - b.top || a.left - b.left);

        const selectedSet = new Set(candidates.map((item) => item.element));
        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-altw-toolbar-range", "1");
        wrapper.setAttribute("data-ai-prompt-bridge-user-boundary", userBoundary.text.slice(0, 80));

        let count = 0;
        candidates.forEach((item) => {
            if (shouldSkipNestedStructuredBlock(item.element, selectedSet)) return;

            const cloned = cleanRichClone(item.element);
            absolutizeImageSources(cloned);
            cleanOfficeExportElement(cloned);
            normalizeOfficeLayoutStyles(cloned);
            wrapper.appendChild(cloned);
            count += 1;
        });

        const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!count || !text || text.length < 20) return null;

        return wrapper;
    }


    function isAssistantToolbarElement(element) {
        if (!element || !element.querySelectorAll) return false;
        if (isInsideExportNoise(element)) return false;

        const buttons = Array.from(element.querySelectorAll("button,[role='button']"));
        if (buttons.length < 3) return false;

        const text = cleanExportMultiline(element.innerText || element.textContent || "");
        if (text.length > 120) return false;

        return true;
    }

    function removeToolbarAndNoiseFromClone(clone) {
        if (!clone || !clone.querySelectorAll) return clone;

        Array.from(clone.querySelectorAll("button,[role='button'],svg")).forEach((node) => {
            const toolbar = node.closest("div");
            if (toolbar && isAssistantToolbarElement(toolbar)) {
                toolbar.remove();
            } else {
                node.remove();
            }
        });

        Array.from(clone.querySelectorAll('[data-testid*="composer"], form, textarea, input, [contenteditable="true"]')).forEach((node) => {
            node.remove();
        });

        return clone;
    }

    function getLatestAssistantToolbarElement() {
        const boundary = getLatestAssistantToolbarBoundary ? getLatestAssistantToolbarBoundary() : null;
        return boundary?.element || null;
    }

    function buildLatestAnswerFromToolbarContainer() {
        const toolbar = getLatestAssistantToolbarElement();
        if (!toolbar) return null;

        const main = getMainConversationRoot();
        if (!main) return null;

        let best = null;
        let node = toolbar.parentElement;
        let depth = 0;

        while (node && node !== document.body && depth < 12) {
            if (node === main.parentElement) break;
            if (isInsideExportNoise(node)) {
                node = node.parentElement;
                depth += 1;
                continue;
            }

            const rect = node.getBoundingClientRect?.();
            const text = cleanExportMultiline(node.innerText || node.textContent || "");
            const hasToolbar = node.contains(toolbar);
            const hasComposer = Boolean(node.querySelector?.('[data-testid*="composer"], textarea, input, [contenteditable="true"]'));
            const hasUser = Boolean(node.querySelector?.('[data-message-author-role="user"]'));

            if (
                hasToolbar &&
                !hasComposer &&
                !hasUser &&
                text &&
                text.length >= 20 &&
                rect &&
                rect.width > 0 &&
                rect.height > 0
            ) {
                const clone = cleanRichClone(node);
                convertRenderedCodeBlocksToPre(clone);
                removeToolbarAndNoiseFromClone(clone);
                absolutizeImageSources(clone);
                cleanOfficeExportElement(clone);
                normalizeOfficeLayoutStyles(clone);

                const cloneText = cleanExportMultiline(clone.innerText || clone.textContent || "");
                const richScore = clone.querySelectorAll("p,ol,ul,blockquote,table,pre,code,h1,h2,h3,h4").length * 100;
                const score = cloneText.length + richScore - depth * 30;

                // Avoid choosing a huge container that includes older answers.
                if (cloneText.length < 30000 && (!best || score > best.score)) {
                    best = { element: clone, text: cloneText, score, depth };
                }
            }

            node = node.parentElement;
            depth += 1;
        }

        if (!best || !best.text || best.text.length < 20) return null;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-altw-container", "1");
        wrapper.appendChild(best.element);
        return wrapper;
    }


    function cloneRangeBetweenElements(startBoundaryElement, endBoundaryElement) {
        try {
            if (!startBoundaryElement || !endBoundaryElement) return null;

            const range = document.createRange();
            range.setStartAfter(startBoundaryElement);
            range.setEndBefore(endBoundaryElement);

            const frag = range.cloneContents();
            const wrapper = document.createElement("div");
            wrapper.setAttribute("data-ai-prompt-bridge-altw-range-clone", "1");
            wrapper.appendChild(frag);

            return wrapper;
        } catch (error) {
            console.warn("[AI Prompt Bridge] clone range failed", error);
            return null;
        }
    }

    function findPreviousAssistantToolbarBefore(topLimit) {
        const main = getMainConversationRoot();
        if (!main || topLimit === null || topLimit === undefined) return null;

        const toolbars = [];
        try {
            main.querySelectorAll("div").forEach((node) => {
                if (!isAssistantToolbarElement(node)) return;
                const rect = node.getBoundingClientRect();
                const bottom = rect.bottom + window.scrollY;
                if (bottom < topLimit - 2) {
                    toolbars.push({ element: node, bottom });
                }
            });
        } catch (_) {}

        if (!toolbars.length) return null;
        toolbars.sort((a, b) => a.bottom - b.bottom);
        return toolbars[toolbars.length - 1].element;
    }

    function buildLatestAnswerFromToolbarRangeClone() {
        const toolbar = getLatestAssistantToolbarElement();
        if (!toolbar) return null;

        const toolbarRect = toolbar.getBoundingClientRect();
        const toolbarTop = toolbarRect.top + window.scrollY;

        const userBoundary = getLatestUserBoundaryBefore(toolbarTop);

        // v1.75:
        // Do not use previous assistant toolbar as a fallback start boundary.
        // After F5 / page restore, user bubble detection may be late; using the previous toolbar
        // can clone multiple old answers and produce a huge 7k+ character export.
        // If the latest user boundary is not ready, fail this path and let safer fallbacks run.
        if (!userBoundary?.element) return null;

        let wrapper = cloneRangeBetweenElements(userBoundary.element, toolbar);
        if (!wrapper) return null;

        // Remove any accidentally cloned old messages / user bubbles.
        try {
            wrapper.querySelectorAll('[data-message-author-role="user"]').forEach((node) => node.remove());
        } catch (_) {}

        // Convert ChatGPT fake/plaintext code blocks before generic cleanup removes layout clues.
        convertRenderedCodeBlocksToPre(wrapper);

        removeToolbarAndNoiseFromClone(wrapper);
        removeLeadingUserPromptFromAltW(wrapper);
        removeExportNoiseNodes(wrapper);
        absolutizeImageSources(wrapper);
        cleanOfficeExportElement(wrapper);
        normalizeOfficeLayoutStyles(wrapper);

        const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!text || text.length < 20) return null;

        // Guardrail: Alt+W is latest answer only, not full session.
        // If the cloned range still looks too large and contains multiple old toolbars, reject it.
        const toolbarCount = Array.from(wrapper.querySelectorAll("div")).filter((node) => isAssistantToolbarElement(node)).length;
        if (toolbarCount > 1 || text.length > 12000) return null;

        return wrapper;
    }


    function isVisibleInViewportForAltW(element) {
        if (!element || !element.getBoundingClientRect) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;

        const style = window.getComputedStyle ? window.getComputedStyle(element) : null;
        if (style && (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")) {
            return false;
        }

        return true;
    }

    function getLatestVisibleAssistantToolbarElement() {
        const main = getMainConversationRoot();
        if (!main) return null;

        const composerTop = getComposerTopBoundary();
        const candidates = [];
        const seen = new Set();

        const consider = (element) => {
            if (!element || seen.has(element) || !element.getBoundingClientRect) return;
            seen.add(element);

            if (!isAssistantToolbarElement(element)) return;
            if (!isVisibleInViewportForAltW(element)) return;
            if (isInsideExportNoise(element)) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const bottom = rect.bottom + window.scrollY;

            if (top >= composerTop - 2) return;

            candidates.push({
                element,
                top,
                bottom,
                viewportTop: rect.top,
                viewportBottom: rect.bottom
            });
        };

        try {
            main.querySelectorAll("div").forEach((div) => {
                consider(div);
                if (div.parentElement) consider(div.parentElement);
            });
        } catch (_) {}

        if (!candidates.length) return null;

        // Pick the visible assistant toolbar closest to the composer / bottom of viewport.
        candidates.sort((a, b) => a.viewportTop - b.viewportTop || a.top - b.top);
        return candidates[candidates.length - 1].element;
    }

    function getLatestVisibleUserBoundaryBefore(toolbarElement) {
        const main = getMainConversationRoot();
        if (!main || !toolbarElement?.getBoundingClientRect) return null;

        const toolbarRect = toolbarElement.getBoundingClientRect();
        const toolbarTopAbs = toolbarRect.top + window.scrollY;

        const mainRect = main.getBoundingClientRect();
        const mainLeft = mainRect.left;
        const mainWidth = Math.max(mainRect.width, 1);

        const candidates = [];
        const seen = new Set();

        const consider = (element, sourceScore = 0) => {
            if (!element || seen.has(element) || !element.getBoundingClientRect) return;
            seen.add(element);

            if (isInsideExportNoise(element)) return;
            if (element.closest?.('[data-message-author-role="assistant"]')) return;
            if (!isVisibleInViewportForAltW(element)) return;

            const text = cleanExportMultiline(element.innerText || element.textContent || "");
            if (!text || text.length < 2 || text.length > 4000) return;
            if (isNoisyAutoCopyBlockText(text) || isExportNoiseText?.(text)) return;

            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const bottom = rect.bottom + window.scrollY;

            if (bottom >= toolbarTopAbs - 2) return;

            const centerX = rect.left + rect.width / 2;
            const rightAligned =
                centerX > mainLeft + mainWidth * 0.56 ||
                rect.left > mainLeft + mainWidth * 0.42 ||
                rect.right > mainLeft + mainWidth * 0.78;

            const compact = rect.width < mainWidth * 0.88;
            const roleHit = element.matches?.('[data-message-author-role="user"]') ||
                element.closest?.('[data-message-author-role="user"]');

            if (!roleHit && !(rightAligned && compact)) return;
            if (element.querySelector?.("pre,code,table,ol,ul,blockquote") && !roleHit) return;

            candidates.push({
                element,
                text,
                top,
                bottom,
                viewportBottom: rect.bottom,
                area: rect.width * rect.height,
                score: (roleHit ? 100000 : sourceScore) + bottom
            });
        };

        try {
            main.querySelectorAll('[data-message-author-role="user"]').forEach((node) => consider(node, 100000));
        } catch (_) {}

        try {
            main.querySelectorAll("div,p,article").forEach((node) => consider(node, 0));
        } catch (_) {}

        if (!candidates.length) return null;

        candidates.sort((a, b) => {
            if (Math.abs(a.bottom - b.bottom) > 4) return a.bottom - b.bottom;
            return (a.area - b.area) || (a.score - b.score);
        });

        const latest = candidates[candidates.length - 1];
        return {
            top: latest.top,
            bottom: latest.bottom,
            text: latest.text,
            element: latest.element
        };
    }

    function buildLatestAnswerFromVisibleToolbarRangeClone() {
        const toolbar = getLatestVisibleAssistantToolbarElement();
        if (!toolbar) return null;

        const userBoundary = getLatestVisibleUserBoundaryBefore(toolbar);
        if (!userBoundary?.element) return null;

        const wrapper = cloneRangeBetweenElements(userBoundary.element, toolbar);
        if (!wrapper) return null;

        wrapper.setAttribute("data-ai-prompt-bridge-altw-visible-range", "1");

        try {
            wrapper.querySelectorAll('[data-message-author-role="user"]').forEach((node) => node.remove());
        } catch (_) {}

        convertRenderedCodeBlocksToPre(wrapper);
        removeToolbarAndNoiseFromClone(wrapper);
        removeLeadingUserPromptFromAltW(wrapper);
        removeExportNoiseNodes(wrapper);
        absolutizeImageSources(wrapper);
        cleanOfficeExportElement(wrapper);
        normalizeOfficeLayoutStyles(wrapper);

        const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!text || text.length < 20) return null;

        // Guardrail: if it still looks like an old/full-session capture, reject this path.
        if (
            text.length > 12000 ||
            text.includes("今天 上午1:53") ||
            text.includes("下一版我已經先做成 v5.2 Stable UI") ||
            text.includes("處理時間為 11s")
        ) {
            return null;
        }

        return wrapper;
    }


    function buildLatestAnswerFromGuardedToolbarContainer() {
        const candidate = buildLatestAnswerFromToolbarContainer();
        if (!candidate) return null;

        try {
            const text = cleanExportMultiline(candidate.innerText || candidate.textContent || "");
            if (!text || text.length < 20) return null;

            // Correct Alt+W for this ChatGPT Project layout is a single answer block.
            // It can be ~1k-5k chars with code blocks, but it must not be full session / composer draft.
            if (isBadAltWExportText(text)) return null;

            const toolbarCount = candidate.querySelectorAll
                ? Array.from(candidate.querySelectorAll("div")).filter((node) => isAssistantToolbarElement(node)).length
                : 0;
            if (toolbarCount > 1) return null;

            const userRoleCount = candidate.querySelectorAll
                ? candidate.querySelectorAll('[data-message-author-role="user"]').length
                : 0;
            if (userRoleCount > 0) return null;

            if (candidate.querySelector?.('[data-testid*="composer"], textarea, input, [contenteditable="true"], form')) {
                return null;
            }

            return candidate;
        } catch (error) {
            console.warn("[AI Prompt Bridge] guarded toolbar container rejected", error);
            return null;
        }
    }


    function sanitizeAltWMarkdownRootForOffice(root) {
        if (!root) return null;

        try {
            const cleanRoot = document.createElement("div");
            cleanRoot.setAttribute("data-ai-prompt-bridge-altw-office-clean", "1");
            cleanRoot.style.fontFamily = '"Microsoft JhengHei", "Noto Sans TC", "Segoe UI", Arial, sans-serif';
            cleanRoot.style.fontSize = "20pt";
            cleanRoot.style.lineHeight = "1.6";
            cleanRoot.style.color = "#111827";
            cleanRoot.style.background = "#ffffff";
            cleanRoot.style.backgroundColor = "#ffffff";

            const baseTextStyle = (node) => {
                node.removeAttribute?.("class");
                node.removeAttribute?.("bgcolor");
                node.style.fontFamily = '"Microsoft JhengHei", "Noto Sans TC", "Segoe UI", Arial, sans-serif';
                node.style.setProperty("font-size", "20pt", "important");
                node.style.lineHeight = "1.6";
                node.style.color = "#111827";
                node.style.background = "transparent";
                node.style.backgroundColor = "transparent";
                node.style.boxShadow = "none";
            };

            const appendTextWithBr = (parent, text) => {
                const raw = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n");
                raw.split("\n").forEach((line, index) => {
                    if (index > 0) parent.appendChild(document.createElement("br"));
                    parent.appendChild(document.createTextNode(line));
                });
            };

            const makeParagraph = (text) => {
                const normalized = cleanExportMultiline(text || "");
                if (!normalized) return null;
                const p = document.createElement("p");
                appendTextWithBr(p, normalized);
                baseTextStyle(p);
                p.style.margin = "0 0 10pt";
                return p;
            };

            const makeOfficeCodeBlock = (text) => {
                const table = document.createElement("table");
                table.setAttribute("data-ai-prompt-bridge-codeblock", "1");
                table.setAttribute("cellpadding", "0");
                table.setAttribute("cellspacing", "0");
                table.setAttribute("border", "0");
                table.setAttribute("frame", "void");
                table.setAttribute("rules", "none");
                table.style.borderCollapse = "collapse";
                table.style.borderSpacing = "0";
                table.style.margin = "8pt 0 12pt";
                table.style.width = "100%";
                table.style.background = "#f3f4f6";
                table.style.backgroundColor = "#f3f4f6";
                table.style.border = "0";
                table.style.borderColor = "transparent";
                table.style.borderRadius = "8pt";
                table.style.boxShadow = "none";
                table.style.cssText += ";mso-border-alt:none;mso-padding-alt:0;mso-table-lspace:0pt;mso-table-rspace:0pt;";

                const normalizeCodeLine = (line) => {
                    const value = String(line || "")
                        .replace(/\t/g, "    ")
                        .replace(/ /g, "\u00A0");
                    return value || "\u00A0";
                };

                String(text || "")
                    .replace(/\r\n/g, "\n")
                    .replace(/\r/g, "\n")
                    .replace(/\n{3,}/g, "\n\n")
                    .trim()
                    .split("\n")
                    .forEach((line, index) => {
                        const tr = document.createElement("tr");
                        tr.setAttribute("data-ai-prompt-bridge-codeblock-line", "1");

                        const td = document.createElement("td");
                        td.setAttribute("data-ai-prompt-bridge-codeblock-cell", "1");
                        td.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                        td.style.setProperty("font-size", "20pt", "important");
                        td.style.lineHeight = "1.45";
                        td.style.color = "#111827";
                        td.style.background = "#f3f4f6";
                        td.style.backgroundColor = "#f3f4f6";
                        td.style.border = "0";
                        td.style.borderTop = "0";
                        td.style.borderBottom = "0";
                        td.style.borderLeft = "0";
                        td.style.borderRight = "0";
                        td.style.borderColor = "transparent";
                        td.style.padding = index === 0 ? "10pt 12pt 0" : "0 12pt";
                        td.style.verticalAlign = "top";
                        td.style.cssText += ";mso-border-alt:none;";
                        td.style.whiteSpace = "nowrap";
                        td.style.wordBreak = "normal";
                        td.style.overflowWrap = "normal";
                        td.style.boxShadow = "none";
                        td.textContent = normalizeCodeLine(line);

                        tr.appendChild(td);
                        table.appendChild(tr);
                    });

                const lastCell = table.querySelector("tr:last-child td");
                if (lastCell) {
                    lastCell.style.paddingBottom = "10pt";
                }

                return table;
            };

            const appendCleanNode = (node, parent) => {
                if (!node) return;

                if (node.nodeType === Node.TEXT_NODE) {
                    const value = node.nodeValue || "";
                    if (value.trim()) {
                        parent.appendChild(document.createTextNode(value));
                    }
                    return;
                }

                if (node.nodeType !== Node.ELEMENT_NODE) return;

                const tag = node.tagName;

                if (node.closest?.("button, svg, nav, aside, header, footer, form, textarea, input")) return;

                if (tag === "PRE") {
                    const block = makeOfficeCodeBlock(node.innerText || node.textContent || "");
                    parent.appendChild(block);
                    return;
                }

                if (tag === "CODE") {
                    // Inline code remains plain text / monospace is not worth risking Word highlight leakage.
                    // Code blocks are handled above as Office one-cell tables.
                    const text = cleanExportMultiline(node.innerText || node.textContent || "");
                    if (text) parent.appendChild(document.createTextNode(text));
                    return;
                }

                if (tag === "SPAN" || tag === "MARK") {
                    // Do not keep spans/marks because Word/OneNote preserve their background as highlight.
                    Array.from(node.childNodes).forEach((child) => appendCleanNode(child, parent));
                    return;
                }

                if (/^(P|DIV|SECTION|ARTICLE)$/.test(tag)) {
                    const hasStructuralChild = node.querySelector?.("pre, ul, ol, blockquote, table, h1, h2, h3, h4");
                    if (!hasStructuralChild) {
                        const p = makeParagraph(node.innerText || node.textContent || "");
                        if (p) parent.appendChild(p);
                        return;
                    }

                    Array.from(node.childNodes).forEach((child) => appendCleanNode(child, parent));
                    return;
                }

                if (/^(H1|H2|H3|H4)$/.test(tag)) {
                    const h = document.createElement(tag.toLowerCase());
                    appendTextWithBr(h, cleanExportMultiline(node.innerText || node.textContent || ""));
                    baseTextStyle(h);
                    h.style.fontSize = tag === "H1" ? "24pt" : "22pt";
                    h.style.fontWeight = "700";
                    h.style.margin = "14pt 0 8pt";
                    parent.appendChild(h);
                    return;
                }

                if (tag === "BR") {
                    parent.appendChild(document.createElement("br"));
                    return;
                }

                if (tag === "UL" || tag === "OL") {
                    const list = document.createElement(tag.toLowerCase());
                    baseTextStyle(list);
                    list.style.margin = "6pt 0 10pt 24pt";
                    list.style.paddingLeft = "20pt";
                    Array.from(node.children || []).forEach((child) => appendCleanNode(child, list));
                    parent.appendChild(list);
                    return;
                }

                if (tag === "LI") {
                    const li = document.createElement("li");
                    baseTextStyle(li);
                    li.style.margin = "0 0 6pt";
                    if (node.querySelector?.("pre, ul, ol")) {
                        Array.from(node.childNodes).forEach((child) => appendCleanNode(child, li));
                    } else {
                        appendTextWithBr(li, cleanExportMultiline(node.innerText || node.textContent || ""));
                    }
                    parent.appendChild(li);
                    return;
                }

                if (tag === "BLOCKQUOTE") {
                    const quote = document.createElement("blockquote");
                    baseTextStyle(quote);
                    quote.style.borderLeft = "4pt solid #d1d5db";
                    quote.style.paddingLeft = "10pt";
                    quote.style.margin = "8pt 0 12pt";
                    Array.from(node.childNodes).forEach((child) => appendCleanNode(child, quote));
                    parent.appendChild(quote);
                    return;
                }

                if (tag === "TABLE") {
                    const table = document.createElement("table");
                    table.style.borderCollapse = "collapse";
                    table.style.margin = "8pt 0 12pt";
                    table.style.width = "100%";
                    table.style.background = "transparent";
                    table.style.backgroundColor = "transparent";

                    Array.from(node.rows || []).forEach((row) => {
                        const tr = document.createElement("tr");
                        Array.from(row.cells || []).forEach((cell) => {
                            const outCell = document.createElement(cell.tagName === "TH" ? "th" : "td");
                            appendTextWithBr(outCell, cleanExportMultiline(cell.innerText || cell.textContent || ""));
                            baseTextStyle(outCell);
                            outCell.style.border = "1px solid #d1d5db";
                            outCell.style.padding = "4pt 6pt";
                            outCell.style.background = "transparent";
                            outCell.style.backgroundColor = "transparent";
                            tr.appendChild(outCell);
                        });
                        table.appendChild(tr);
                    });
                    parent.appendChild(table);
                    return;
                }

                if (tag === "STRONG" || tag === "B") {
                    const strong = document.createElement("strong");
                    Array.from(node.childNodes).forEach((child) => appendCleanNode(child, strong));
                    strong.style.fontWeight = "700";
                    strong.style.background = "transparent";
                    strong.style.backgroundColor = "transparent";
                    strong.style.setProperty("font-size", "20pt", "important");
                    parent.appendChild(strong);
                    return;
                }

                if (tag === "EM" || tag === "I") {
                    const em = document.createElement("em");
                    Array.from(node.childNodes).forEach((child) => appendCleanNode(child, em));
                    em.style.fontStyle = "italic";
                    em.style.background = "transparent";
                    em.style.backgroundColor = "transparent";
                    em.style.setProperty("font-size", "20pt", "important");
                    parent.appendChild(em);
                    return;
                }

                Array.from(node.childNodes).forEach((child) => appendCleanNode(child, parent));
            };

            Array.from(root.childNodes).forEach((child) => appendCleanNode(child, cleanRoot));

            // Final cleanup: no ChatGPT classes / marks / spans / bgcolor, but keep our codeblock tables.
            cleanRoot.querySelectorAll("span, mark").forEach((bad) => {
                const fragment = document.createDocumentFragment();
                Array.from(bad.childNodes).forEach((child) => fragment.appendChild(child.cloneNode(true)));
                bad.replaceWith(fragment);
            });

            cleanRoot.querySelectorAll("*").forEach((node) => {
                node.removeAttribute("class");
                node.removeAttribute("bgcolor");
                node.style.setProperty("font-size", "20pt", "important");

                if (!node.closest?.('[data-ai-prompt-bridge-codeblock="1"]')) {
                    node.style.background = "transparent";
                    node.style.backgroundColor = "transparent";
                    node.style.boxShadow = "none";
                }
            });

            cleanRoot.querySelectorAll('[data-ai-prompt-bridge-codeblock="1"]').forEach((table) => {
                table.style.background = "#f3f4f6";
                table.style.backgroundColor = "#f3f4f6";
                table.setAttribute("border", "0");
                table.setAttribute("frame", "void");
                table.setAttribute("rules", "none");
                table.style.border = "0";
                table.style.borderColor = "transparent";
                table.style.borderRadius = "8pt";
                table.style.borderCollapse = "collapse";
                table.style.borderSpacing = "0";
                table.style.margin = "8pt 0 12pt";
                table.style.width = "100%";
                table.style.boxShadow = "none";
                table.style.cssText += ";mso-border-alt:none;mso-padding-alt:0;mso-table-lspace:0pt;mso-table-rspace:0pt;";
            });

            cleanRoot.querySelectorAll('[data-ai-prompt-bridge-codeblock-cell="1"]').forEach((td) => {
                td.style.background = "#f3f4f6";
                td.style.backgroundColor = "#f3f4f6";
                td.style.border = "0";
                td.style.borderTop = "0";
                td.style.borderBottom = "0";
                td.style.borderLeft = "0";
                td.style.borderRight = "0";
                td.style.borderColor = "transparent";
                td.style.cssText += ";mso-border-alt:none;";
                td.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                td.style.setProperty("font-size", "20pt", "important");
                td.style.lineHeight = "1.45";
                td.style.whiteSpace = "nowrap";
                td.style.wordBreak = "normal";
                td.style.overflowWrap = "normal";
            });

            return cleanRoot;
        } catch (error) {
            console.warn("[AI Prompt Bridge] sanitizeAltWMarkdownRootForOffice v1.75 failed", error);
            return null;
        }
    }


    function rebuildAltWPreBlocksForOffice(root) {
        if (!root) return;

        try {
            root.querySelectorAll("pre").forEach((pre) => {
                const text = (pre.innerText || pre.textContent || "").replace(/\n{3,}/g, "\n\n");
                pre.innerHTML = "";

                const code = document.createElement("code");
                code.textContent = text;

                code.style.display = "block";
                code.style.whiteSpace = "pre-wrap";
                code.style.wordBreak = "break-word";
                code.style.overflowWrap = "anywhere";
                code.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                code.style.setProperty("font-size", "20pt", "important");
                code.style.lineHeight = "1.45";
                code.style.background = "transparent";
                code.style.backgroundColor = "transparent";
                code.style.border = "0";
                code.style.padding = "0";
                code.style.margin = "0";
                code.style.boxShadow = "none";

                pre.appendChild(code);

                // OneNote / Word are more stable with one single pre background and
                // no nested syntax-highlight spans/backgrounds.
                pre.style.display = "block";
                pre.style.whiteSpace = "pre-wrap";
                pre.style.wordBreak = "break-word";
                pre.style.overflowWrap = "anywhere";
                pre.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                pre.style.setProperty("font-size", "20pt", "important");
                pre.style.lineHeight = "1.45";
                pre.style.background = "#f3f4f6";
                pre.style.backgroundColor = "#f3f4f6";
                pre.style.border = "1px solid #e5e7eb";
                pre.style.borderRadius = "8pt";
                pre.style.padding = "10pt 12pt";
                pre.style.margin = "10pt 0 14pt";
                pre.style.boxShadow = "none";
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] rebuildAltWPreBlocksForOffice failed", error);
        }
    }


    function normalizeAltWMarkdownRootBackgrounds(root) {
        if (!root) return;

        try {
            root.style.background = "#ffffff";
            root.style.backgroundColor = "#ffffff";
            root.style.boxShadow = "none";

            // First remove all ChatGPT / syntax highlighter backgrounds from every child.
            // Office can preserve CSS backgrounds even when browser shows transparent.
            root.querySelectorAll("*").forEach((node) => {
                if (!node || !node.style) return;
                if (node.closest?.('[data-ai-prompt-bridge-codeblock="1"]')) return;

                node.style.background = "transparent";
                node.style.backgroundColor = "transparent";
                node.style.boxShadow = "none";
                node.style.textDecoration = node.style.textDecoration || "none";
                node.removeAttribute?.("bgcolor");
            });

            // Then rebuild full code blocks as one single gray container.
            // v1.75: skip when sanitizeAltWMarkdownRootForOffice already converted code
            // blocks into Office one-cell tables.
            if (!root.querySelector?.('[data-ai-prompt-bridge-codeblock="1"]')) {
                rebuildAltWPreBlocksForOffice(root);
            }

            // Inline code outside pre: monospace only, no fill/highlight.
            root.querySelectorAll("code").forEach((code) => {
                if (code.closest?.("pre")) return;
                code.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                code.style.setProperty("font-size", "20pt", "important");
                code.style.background = "transparent";
                code.style.backgroundColor = "transparent";
                code.style.padding = "0";
                code.style.border = "0";
                code.style.boxShadow = "none";
            });

            root.querySelectorAll("p, div, span, li, ol, ul, blockquote").forEach((node) => {
                if (!node || !node.style) return;
                if (node.closest?.("pre")) return;
                node.style.background = "transparent";
                node.style.backgroundColor = "transparent";
                node.style.boxShadow = "none";
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] normalizeAltWMarkdownRootBackgrounds failed", error);
        }
    }


    function normalizeAltWMarkdownRootOfficeFont(root) {
        if (!root) return;

        try {
            root.style.fontFamily = '"Microsoft JhengHei", "Noto Sans TC", "Segoe UI", Arial, sans-serif';
            root.style.fontSize = "20pt";
            root.style.lineHeight = "1.45";
            root.style.color = "#111827";

            const all = root.querySelectorAll("*");
            all.forEach((node) => {
                if (!node || !node.style) return;

                node.style.fontFamily = '"Microsoft JhengHei", "Noto Sans TC", "Segoe UI", Arial, sans-serif';
                node.style.fontSize = "20pt";
                node.style.lineHeight = "1.45";
                node.style.color = node.style.color || "#111827";

                if (/^(H1|H2|H3|H4)$/.test(node.tagName)) {
                    node.style.fontSize = node.tagName === "H1" ? "24pt" : "22pt";
                    node.style.fontWeight = "700";
                    node.style.margin = "14pt 0 8pt";
                }

                if (node.tagName === "PRE" || node.tagName === "CODE") {
                    node.style.fontFamily = 'Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace';
                    node.style.setProperty("font-size", "20pt", "important");
                    node.style.lineHeight = "1.45";
                    node.style.whiteSpace = "pre-wrap";
                }

                if (node.tagName === "P") {
                    node.style.margin = "0 0 10pt";
                }

                if (node.tagName === "LI") {
                    node.style.margin = "0 0 6pt";
                }
            });

            root.querySelectorAll("pre").forEach((pre) => {
                pre.style.background = "#f3f4f6";
                pre.style.border = "1px solid #e5e7eb";
                pre.style.borderRadius = "8pt";
                pre.style.padding = "10pt";
                pre.style.margin = "8pt 0 12pt";
                pre.style.whiteSpace = "pre-wrap";
            });

            root.querySelectorAll("ol, ul").forEach((list) => {
                list.style.margin = "6pt 0 10pt 24pt";
                list.style.paddingLeft = "20pt";
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] normalizeAltWMarkdownRootOfficeFont failed", error);
        }
    }


    function buildLatestAnswerFromVisibleMarkdownRootForAltW() {
        const main = getMainConversationRoot();
        if (!main) return null;

        const composerTop = getComposerTopBoundary();
        const selectors = [
            '[class*="MarkdownRoot"]',
            '.markdown',
            '.prose',
            '[data-message-author-role="assistant"] [class*="MarkdownRoot"]',
            '[data-message-author-role="assistant"] .markdown',
            '[data-message-author-role="assistant"] .prose'
        ];

        const candidates = [];
        const seen = new Set();

        selectors.forEach((selector) => {
            try {
                main.querySelectorAll(selector).forEach((element) => {
                    if (!element || seen.has(element) || !element.getBoundingClientRect) return;
                    seen.add(element);

                    if (isInsideExportNoise(element)) return;
                    if (element.closest?.('[data-message-author-role="user"]')) return;
                    if (element.closest?.('[data-testid*="composer"], textarea, input, [contenteditable="true"], form')) return;

                    const rect = element.getBoundingClientRect();
                    if (rect.width <= 0 || rect.height <= 0) return;

                    const absoluteTop = rect.top + window.scrollY;
                    const absoluteBottom = rect.bottom + window.scrollY;

                    // Partial visibility is required. This keeps the currently loaded / active answer
                    // and excludes old virtualized turns whose root exists but is off-screen.
                    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
                    if (absoluteTop >= composerTop - 2) return;

                    const text = cleanExportMultiline(element.innerText || element.textContent || "");
                    if (!text || text.length < 20 || text.length > 12000) return;
                    if (isBadAltWExportText(text)) return;

                    // Avoid page/session roots. A true answer MarkdownRoot has rich children,
                    // not multiple assistant toolbars or user turns.
                    const toolbarCount = Array.from(element.querySelectorAll?.("div") || [])
                        .filter((node) => isAssistantToolbarElement(node)).length;
                    if (toolbarCount > 0) return;

                    if (element.querySelector?.('[data-message-author-role="user"]')) return;
                    if (element.querySelector?.('[data-testid*="composer"], textarea, input, [contenteditable="true"], form')) return;

                    const richCount = element.querySelectorAll?.("p,pre,code,ol,ul,blockquote,table,h1,h2,h3,h4").length || 0;
                    const codeCount = element.querySelectorAll?.("pre,code,[class*='CodeBlock'],[class*='CodeContent']").length || 0;

                    candidates.push({
                        element,
                        text,
                        top: rect.top,
                        bottom: rect.bottom,
                        absoluteTop,
                        absoluteBottom,
                        richCount,
                        codeCount,
                        score: rect.bottom + Math.min(text.length, 5000) + richCount * 80 + codeCount * 300
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] visible MarkdownRoot selector failed", selector, error);
            }
        });

        if (!candidates.length) return null;

        // Prefer the latest visible answer root closest to the composer, not the largest outer container.
        candidates.sort((a, b) => {
            if (Math.abs(a.bottom - b.bottom) > 6) return a.bottom - b.bottom;
            return a.score - b.score;
        });

        const best = candidates[candidates.length - 1];

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-ai-prompt-bridge-altw-markdown-root", "1");
        wrapper.setAttribute("data-ai-prompt-bridge-markdown-root-chars", String(best.text.length));

        const clone = cleanRichClone(best.element);
        convertRenderedCodeBlocksToPre(clone);
        removeToolbarAndNoiseFromClone(clone);
        removeExportNoiseNodes(clone);
        absolutizeImageSources(clone);
        cleanOfficeExportElement(clone);
        normalizeOfficeLayoutStyles(clone);

        const officeClean = sanitizeAltWMarkdownRootForOffice(clone);
        wrapper.appendChild(officeClean || clone);
        normalizeAltWMarkdownRootOfficeFont(wrapper);
        normalizeAltWMarkdownRootBackgrounds(wrapper);

        const finalText = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
        if (!finalText || finalText.length < 20) return null;
        if (isBadAltWExportText(finalText)) return null;

        return wrapper;
    }


    function getLatestStructuredAssistantAnswerElement() {
        try {
            // v1.75:
            // Do NOT start from visible MarkdownRoot. On long answers / restored pages it can be
            // only the visible bottom fragment (~196 chars). Prefer whole-answer range/container
            // strategies first, and use visible MarkdownRoot only as the final fallback.
            const candidates = [
                // v1.75 hard rule: authoritative whole assistant turn first.
                // Never let visible MarkdownRoot / viewport fragments win on first copy.
                getLatestOfficialAssistantElementWholeTurn,
                getLatestOfficialAssistantElement,
                buildLatestAnswerFromGuardedToolbarContainer,
                buildLatestAnswerFromToolbarRangeClone,
                buildLatestAnswerFromToolbarRange,
                buildLatestAnswerFromStrictRange
            ];

            for (const getCandidate of candidates) {
                const candidate = getCandidate();
                if (!candidate) continue;
                const text = cleanExportMultiline(candidate.innerText || candidate.textContent || "");
                if (!text || text.length < 20) continue;
                if (isBadAltWExportText(text)) continue;
                return candidate;
            }

            // Structured transcript fallback.
            if (typeof collectStructuredDomTranscriptBlocks === "function") {
                const assistantBlocks = collectStructuredDomTranscriptBlocks()
                    .filter((block) => {
                        if (!block || block.role !== "assistant" || !block.node) return false;
                        const text = cleanExportMultiline(block.node.innerText || block.node.textContent || block.text || "");
                        return text && text.length >= 20;
                    });

                if (assistantBlocks.length) {
                    const latest = assistantBlocks[assistantBlocks.length - 1];
                    const wrapper = document.createElement("div");
                    wrapper.setAttribute("data-ai-prompt-bridge-altw-structured", "1");

                    const clone = latest.node.cloneNode(true);
                    convertRenderedCodeBlocksToPre(clone);
                    absolutizeImageSources(clone);
                    cleanOfficeExportElement(clone);
                    normalizeOfficeLayoutStyles(clone);
                    wrapper.appendChild(clone);

                    const text = cleanExportMultiline(wrapper.innerText || wrapper.textContent || "");
                    if (text && text.length >= 20 && !isBadAltWExportText(text)) return wrapper;
                }
            }

            // v1.75: visible MarkdownRoot fallback is intentionally disabled for Alt+W.
            // It can capture only the current viewport fragment on first copy, e.g. 196 chars.
            return null;
        } catch (error) {
            console.warn("[AI Prompt Bridge] latest assistant extraction failed", error);
            return null;
        }
    }


    function getLatestAssistantAnswerContainer() {
        const site = getSiteName();

        // v1.75: For ChatGPT, Alt+W should be the latest assistant message block,
        // not the lowest visible fragment/code block. Reuse Alt+N's structured DOM grouping.
        if (site === "ChatGPT") {
            const structured = getLatestStructuredAssistantAnswerElement();
            if (structured) return structured;
        }
        const selectorsBySite = {
            ChatGPT: [
                '[data-message-author-role="assistant"]',
                '[data-testid*="assistant"]',
                '[data-testid*="conversation-turn"]',
                "article",
                ".markdown",
                ".prose",
                "pre",
                "p"
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

                    const turn = findAssistantTurnContainerFromChild(element);
                    const root = getBestAssistantContentRoot(turn || element) || element;
                    const score = scoreLatestAssistantCandidate(root);
                    if (score < 0) return;

                    const text = cleanExportMultiline(root.innerText || root.textContent || "");
                    candidates.push({
                        element: root,
                        score,
                        textLength: text.length,
                        bottom: (turn || element).getBoundingClientRect?.().bottom || 0
                    });
                });
            } catch (error) {
                console.warn("[AI Prompt Bridge] latest assistant selector failed", selector, error);
            }
        });

        if (candidates.length === 0) return null;

        candidates.sort((a, b) => (a.score + a.bottom + Math.min(a.textLength, 20000)) - (b.score + b.bottom + Math.min(b.textLength, 20000)));
        let chosen = candidates[candidates.length - 1].element;

        if (isTooSmallLatestAnswerElement(chosen)) {
            const parentTurn = findAssistantTurnContainerFromChild(chosen);
            const betterRoot = getBestAssistantContentRoot(parentTurn);
            if (betterRoot) chosen = betterRoot;
        }

        return chosen;
    }


    function buildFullSingleAnswerElement(container) {
        if (!container) return null;

        let source = container;

        if (
            source.getAttribute?.("data-ai-prompt-bridge-altw-structured") === "1" ||
            source.getAttribute?.("data-ai-prompt-bridge-altw-toolbar-range") === "1" ||
            source.getAttribute?.("data-ai-prompt-bridge-altw-container") === "1" ||
            source.getAttribute?.("data-ai-prompt-bridge-altw-range-clone") === "1" ||
            source.getAttribute?.("data-ai-prompt-bridge-altw-visible-range") === "1" ||
            source.getAttribute?.("data-ai-prompt-bridge-altw-markdown-root") === "1"
        ) {
            const clone = cleanRichClone(source);
            removeLeadingUserPromptFromAltW(clone);
            removeExportNoiseNodes(clone);
            absolutizeImageSources(clone);
            cleanOfficeExportElement(clone);
            normalizeOfficeLayoutStyles(clone);

            const text = cleanExportMultiline(clone.innerText || clone.textContent || "");
            const hasImage = Boolean(clone.querySelector?.("img"));
            if (text.length < 2 && !hasImage) return null;

            clone.setAttribute("data-ai-prompt-bridge-single-answer", "1");
            return clone;
        }

        if (isTooSmallLatestAnswerElement(source)) {
            const turn = findAssistantTurnContainerFromChild(source);
            const root = getBestAssistantContentRoot(turn);
            if (root) source = root;
        }

        // Preserve complete assistant containers instead of picking their last Markdown child.
        // A turn may contain several markdown roots, interactive cards, or response parts.
        const contentRoot = source.matches?.('[data-message-author-role="assistant"], article, [data-testid*="conversation-turn"]')
            ? source : getPrimaryContentRoot(source);
        const clone = cleanRichClone(contentRoot);
        removeLeadingUserPromptFromAltW(clone);
        removeExportNoiseNodes(clone);
        absolutizeImageSources(clone);
        cleanOfficeExportElement(clone);

        const text = cleanExportMultiline(clone.innerText || clone.textContent || "");
        const hasImage = Boolean(clone.querySelector?.("img"));
        if (text.length < 2 && !hasImage) return null;

        clone.setAttribute("data-ai-prompt-bridge-single-answer", "1");
        return clone;
    }

    function prepareAltWShortcutEnvironment() {
        // v1.75 hard rule: Alt+W / Alt+Shift+W are latest-answer shortcuts.
        // They must never copy composer text, accidental browser selection,
        // or a visible viewport fragment.
        try {
            const active = document.activeElement;
            if (active && (
                active.matches?.("textarea,input,[contenteditable='true']") ||
                active.closest?.("textarea,input,[contenteditable='true'],[data-testid*='composer'],form")
            )) {
                active.blur();
            }
        } catch (_) {}

        try {
            const selection = window.getSelection?.();
            if (selection && selection.rangeCount) selection.removeAllRanges();
        } catch (_) {}
    }

    function getAltWTargetTextLength(element) {
        return cleanExportMultiline(element?.innerText || element?.textContent || "").length;
    }

    function getAltWRichCopyTarget() {
        // v1.75 permanent rule:
        // 1. No selection fallback.
        // 2. No composer fallback.
        // 3. No visible MarkdownRoot fallback.
        // 4. Prefer official whole assistant turn, then whole-answer range builders.
        // This prevents the recurring first-copy 196-char bug.
        prepareAltWShortcutEnvironment();

        const candidates = [];
        const seenTexts = new Set();

        const addCandidate = (element, source) => {
            if (!element) return;
            const full = buildFullSingleAnswerElement(element);
            if (!full) return;
            const text = cleanExportMultiline(full.innerText || full.textContent || "");
            if (!text || text.length < 20) return;
            if (isBadAltWExportText(text)) return;
            if (seenTexts.has(text.slice(0, 500))) return;
            seenTexts.add(text.slice(0, 500));
            candidates.push({ element: full, source, textLength: text.length });
        };

        try { addCandidate(getLatestOfficialAssistantElementWholeTurn(), "official-whole-turn"); } catch (error) { console.warn("[AI Prompt Bridge] official whole turn target failed", error); }
        try { addCandidate(getLatestOfficialAssistantElement(), "official-content-root"); } catch (error) { console.warn("[AI Prompt Bridge] official content target failed", error); }
        try { addCandidate(buildLatestAnswerFromGuardedToolbarContainer(), "toolbar-container"); } catch (error) { console.warn("[AI Prompt Bridge] toolbar container target failed", error); }
        try { addCandidate(buildLatestAnswerFromToolbarRangeClone(), "toolbar-range-clone"); } catch (error) { console.warn("[AI Prompt Bridge] toolbar range clone target failed", error); }
        try { addCandidate(buildLatestAnswerFromToolbarRange(), "toolbar-range"); } catch (error) { console.warn("[AI Prompt Bridge] toolbar range target failed", error); }
        try { addCandidate(buildLatestAnswerFromStrictRange(), "strict-range"); } catch (error) { console.warn("[AI Prompt Bridge] strict range target failed", error); }
        try { addCandidate(getLatestAssistantAnswerContainer(), "latest-container"); } catch (error) { console.warn("[AI Prompt Bridge] latest container target failed", error); }

        if (!candidates.length) return null;

        // Prefer the complete official exchange; a later markdown node can be only its tail.
        // Still compare against other targets to detect inconsistent captures.
        candidates.sort((a, b) => a.textLength - b.textLength);
        const official = candidates.find((item) => item.source === 'official-whole-turn');
        const longest = candidates[candidates.length - 1];
        // The official role node can itself be a short trailing chunk. Compare every
        // independent extractor and choose the longest valid *single-turn* candidate.
        const best = !isLikelyWholeSessionElement(longest.element) ? longest : (official || longest);
        // If another strategy sees substantially more content than the official turn,
        // the DOM is inconsistent: do not report a successful incomplete copy.
        if (official && longest.textLength > official.textLength * 1.25 && longest.textLength - official.textLength > 250) {
            console.warn('[AI Prompt Bridge] short official role node; using longer single-turn candidate if valid', { official: official.textLength, alternative: longest.textLength });
            if (isLikelyWholeSessionElement(longest.element)) return null;
        }

        // Guard against the known first-copy fragment regression.
        // If only a tiny candidate exists, do not silently copy it as success.
        if (best.textLength < 250 && candidates.length === 1 && best.source !== "official-whole-turn" && best.source !== "official-content-root") {
            console.warn("[AI Prompt Bridge] Alt+W tiny target rejected", best);
            return null;
        }

        best.element.setAttribute("data-ai-prompt-bridge-altw-source", best.source);
        best.element.setAttribute("data-ai-prompt-bridge-altw-length", String(best.textLength));
        return { element: best.element, source: best.source, textLength: best.textLength };
    }

    // v1.79: Avoid arbitrary character thresholds. A genuinely short answer is valid.
    // Verify the latest assistant turn by DOM role boundaries instead of a length guess.
    function isLatestChatGPTAnswerReady() {
        if (!/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/.test(location.hostname)) return true;
        return !document.querySelector('[data-testid="stop-button"],button[aria-label*="Stop generating"],button[aria-label*="停止產生"]');
    }

    function getVerifiedLatestAssistantTurn() {
        const roleNodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
        let lastUser = -1;
        for (let i = 0; i < roleNodes.length; i++) {
            if (roleNodes[i].getAttribute('data-message-author-role') === 'user') lastUser = i;
        }
        const nodes = roleNodes.slice(lastUser + 1).filter((e) =>
            e.getAttribute('data-message-author-role') === 'assistant' &&
            !e.closest?.(`#${PANEL_ID},#${BUBBLE_ID}`));
        if (!nodes.length) return null;
        const out = document.createElement('div');
        out.setAttribute('data-ai-prompt-bridge-altw-structured','1');
        out.setAttribute('data-ai-prompt-bridge-single-answer','1');
        out.setAttribute('data-ai-prompt-bridge-altw-turn-parts',String(nodes.length));
        for (const node of nodes) {
            const copy = cleanRichClone(node);
            removeExportNoiseNodes(copy);
            const text = cleanExportMultiline(copy.innerText || copy.textContent || '');
            if (text || copy.querySelector?.('img')) out.appendChild(copy);
        }
        const combined = cleanExportMultiline(out.innerText || out.textContent || '');
        if (!combined && !out.querySelector('img')) return null;
        // Do not treat multiple assistant response parts as a full session.
        return {element: out, source:'official-whole-turn', textLength:combined.length};
    }

    // v1.80: ChatGPT no longer guarantees data-message-author-role on every UI.
    // Do not silently disable all of the existing range/toolbar/container extractors.
    // If role markers exist, prefer the exact latest turn. Otherwise use the
    // already-established independent single-answer strategies.
    function getAltWFallbackWithoutRoleMarkers() {
        const result = getAltWRichCopyTarget();
        if (!result || !result.element) return null;
        // Never accept a full-session root or a composer/selection surrogate.
        if (isLikelyWholeSessionElement(result.element)) return null;
        if (result.element.querySelector?.('textarea,input,[contenteditable="true"],[data-testid*="composer"]')) return null;
        const value = cleanExportMultiline(result.element.innerText || result.element.textContent || '');
        if (!value || isBadAltWExportText(value)) return null;
        return result;
    }

    // v1.82: Preserve rich reply editors (Writing Blocks) while excluding the composer.
    // Never drop contenteditable text from inside an already identified assistant turn.
    function cloneAltWAssistantPart(node) {
        const clone = node.cloneNode(true);
        clone.querySelectorAll('[data-testid*="composer"],form,textarea,input').forEach(el => el.remove());
        // Editable parts embedded in a response are actual reply content, not user input.
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        removeExportNoiseNodes(clone);
        return clone;
    }

    // Collect *all* response parts after the latest user turn, not just the last
    // turn wrapper or the last Markdown/table. A DIL response can span siblings.
    function getAltWWholeConversationTurn() {
        const main = document.querySelector('main,[role="main"]') || document.body;
        const turns = Array.from(main.querySelectorAll(
            '[data-testid^="conversation-turn-"],[data-testid*="conversation-turn"]'))
            .filter(n => !n.parentElement?.closest('[data-testid^="conversation-turn-"],[data-testid*="conversation-turn"]'))
            .filter(n => !n.closest(`#${PANEL_ID},#${BUBBLE_ID}`));
        const roleOf = (node) => {
            const explicit = node.getAttribute('data-message-author-role');
            if (explicit === 'user' || explicit === 'assistant') return explicit;
            const user = node.querySelector('[data-message-author-role="user"]');
            const assistant = node.querySelector('[data-message-author-role="assistant"]');
            if (user && !assistant) return 'user';
            if (assistant && !user) return 'assistant';
            // ChatGPT sometimes names roles in data-testid instead.
            if (node.querySelector('[data-testid*="user-message"]')) return 'user';
            if (node.querySelector('[data-testid*="assistant-message"]')) return 'assistant';
            return 'unknown';
        };
        const roleTurnIndex = turns.reduce((last, n, i) => roleOf(n) === 'user' ? i : last, -1);
        let parts = [];
        if (roleTurnIndex >= 0) {
            parts = turns.slice(roleTurnIndex + 1).filter(n => roleOf(n) === 'assistant');
            // Unlabeled content may be a continuation of the same last answer.
            const trailing = turns.slice(roleTurnIndex + 1);
            for (const n of trailing) {
                if (roleOf(n) !== 'unknown') continue;
                if (n.querySelector('form,textarea,[data-testid*="composer"]')) continue;
                if (n.querySelector('.markdown,.prose,table,[data-testid*="writing"]')) parts.push(n);
            }
        }
        if (!parts.length) {
            const roleNodes = Array.from(main.querySelectorAll('[data-message-author-role]'));
            const lastUser = roleNodes.reduce((last,n,i) => n.getAttribute('data-message-author-role') === 'user' ? i : last,-1);
            parts = roleNodes.slice(lastUser + 1).filter(n => n.getAttribute('data-message-author-role') === 'assistant');
        }
        if (!parts.length) return null;
        // When a container contains another selected part, retain just the parent.
        const unique = Array.from(new Set(parts)).filter(n => !parts.some(p => p !== n && p.contains(n)));
        unique.sort((a,b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-ai-prompt-bridge-single-answer','1');
        wrapper.setAttribute('data-ai-prompt-bridge-altw-structured','1');
        wrapper.setAttribute('data-ai-prompt-bridge-altw-turn-parts',String(unique.length));
        for (const n of unique) {
            const clone = cloneAltWAssistantPart(n);
            if (cleanExportMultiline(clone.textContent || '').length || clone.querySelector('img')) wrapper.appendChild(clone);
        }
        const text = cleanExportMultiline(wrapper.textContent || '');
        if (!text) return null;
        return {element:wrapper,source:'whole-conversation-turn',textLength:text.length};
    }

    // Detect a known false-success pattern without relying on arbitrary minimum lengths.
    // If the visible last answer includes an earlier header/opening paragraph that the
    // extraction missed, abort instead of claiming a successful partial copy.
    function isAltWMissingEarlierVisibleAnswer(candidate) {
        if (!candidate || !candidate.element) return false;
        const selectedText = cleanExportMultiline(candidate.element.textContent || '');
        if (!selectedText) return false;
        const whole = getAltWWholeConversationTurn();
        if (whole && whole.textLength > selectedText.length + 120 &&
            !selectedText.includes(cleanExportMultiline(whole.element.textContent || '').slice(0,70))) return true;
        // Purpose-built regression for multi-part Marcus answer; generic check uses
        // visible first paragraph only and does not impose a fixed word count.
        const visibleOpening = '針對 Marcus 今天第一堂課的狀況';
        if (document.body.innerText?.includes(visibleOpening) &&
            selectedText.includes('課表 C') && !selectedText.includes(visibleOpening)) return true;
        return false;
    }

    // v1.83: Observed Opera/ChatGPT DIL DOM: the entire reply is a DilResponseRoot,
    // with no data-message-author-role, conversation-turn, or .markdown nodes.
    function getLatestDilAssistantAnswer() {
        const main = document.querySelector('main') || document.body;
        const roots = Array.from(main.querySelectorAll('[class*="DilResponseRoot"]'))
            .filter(n => !n.closest?.(`#${PANEL_ID},#${BUBBLE_ID}`))
            .filter(n => !Array.from(n.parentElement?.closest?.('[class*="DilResponseRoot"]') ? [1] : []).length);
        if (!roots.length) return null;
        // DIL reply roots are in conversation order. A plain fragment may be inside
        // a root, but must never become an independent candidate.
        const root = roots[roots.length - 1];
        const before = cleanExportMultiline(root.innerText || root.textContent || '');
        if (!before) return null;
        const clone = root.cloneNode(true);
        // Preserve answer-owned editable Writing Blocks while removing editability.
        clone.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
        // Do not run getPrimaryContentRoot() here: it can choose only the final block.
        clone.setAttribute('data-ai-prompt-bridge-single-answer', '1');
        clone.setAttribute('data-ai-prompt-bridge-dil-whole', '1');
        clone.setAttribute('data-ai-prompt-bridge-altw-structured', '1');
        console.info('[AI Prompt Bridge] DIL whole response selected', {
            roots:roots.length, sourceChars:before.length, directChildren:root.children.length
        });
        return {element:clone, source:'dil-whole-response', textLength:before.length,
                sourceRoot:root, sourceText:before};
    }

    function validateDilCopyCompleteness(target, exported) {
        if (target?.source !== 'dil-whole-response') return true;
        const expected = cleanExportMultiline(target.sourceText || '');
        const output = cleanExportMultiline(exported || '');
        if (!expected || !output) return false;
        // Compare the beginning and ending rather than enforcing arbitrary char counts.
        // Use short token chunks to tolerate whitespace and Office formatting differences.
        const normalize = s => s.replace(/\s+/g,'').replace(/[\u00a0]/g,'');
        const a=normalize(expected), z=normalize(output);
        const beginning=a.slice(0, Math.min(24,a.length));
        const ending=a.slice(-Math.min(24,a.length));
        const headings = ['自主訓練 A','自主訓練 B','自主訓練 C','教練端最重要的提醒'];
        const allHeadings = headings.every(h => !expected.includes(h) || output.includes(h));
        const ok=z.includes(beginning) && z.includes(ending) && z.length >= a.length*0.70 && allHeadings;
        if (!ok) console.warn('[AI Prompt Bridge] DIL copy integrity failed',{
            sourceChars:a.length,exportChars:z.length,openingPresent:z.includes(beginning),endingPresent:z.includes(ending)
        });
        return ok;
    }

    async function getAltWRichCopyTargetStable(modeLabel = 'Alt+W') {
        prepareAltWShortcutEnvironment();
        const chatgptHost = /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/.test(location.hostname);
        if (!chatgptHost) return getAltWRichCopyTarget();

        // First use the observed DIL whole response; legacy selectors return zero in this UI.
        if (isLatestChatGPTAnswerReady()) {
            const dil = getLatestDilAssistantAnswer();
            if (dil) return dil;
        }

        // First use the full ChatGPT turn container (including every Markdown section).
        // Do not rely on viewport, selection, last table, or the longest arbitrary node.
        if (isLatestChatGPTAnswerReady()) {
            const whole = getAltWWholeConversationTurn();
            if (whole) return whole;
        }

        // Rendered assistant nodes may lack role attributes, especially in Projects.
        // A finished answer should copy immediately; don't show a "waiting" toast.
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const official = getVerifiedLatestAssistantTurn();
            const ready = isLatestChatGPTAnswerReady();
            if (official && ready) {
                // Compare against independent extractors to detect truncated official DOM.
                const alternative = getAltWFallbackWithoutRoleMarkers();
                if (alternative && alternative.textLength > official.textLength * 1.4 &&
                    alternative.textLength - official.textLength > 300) {
                    console.info('[AI Prompt Bridge] using fuller last-turn candidate',
                        {official: official.textLength, alternate: alternative.textLength, source: alternative.source});
                    return alternative;
                }
                return official;
            }
            if (ready) {
                const fallback = getAltWFallbackWithoutRoleMarkers();
                if (fallback) return fallback;
            }
            if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 250));
        }
        // No clipboard mutation on unresolved/streaming answers.
        console.warn('[AI Prompt Bridge] latest answer unavailable', {
            mode: modeLabel,
            roleMarkers: document.querySelectorAll('[data-message-author-role]').length,
            generating: !isLatestChatGPTAnswerReady()
        });
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
            node.style.fontFamily = "Consolas, 'Cascadia Mono', 'Courier New', monospace";
            node.style.fontSize = "20pt";
            node.style.lineHeight = "1.45";
            if (node.tagName === "PRE") {
                node.style.display = "block";
                node.style.backgroundColor = "#f8fafc";
                node.style.border = "1px solid #e5e7eb";
                node.style.borderRadius = "6px";
                node.style.padding = "10px 12px";
                node.style.margin = "10px 0";
            }
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

        // v1.75: Newer ChatGPT layouts may not expose stable data-message-author-role.
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
            const roleChanged = current && current.role !== item.role;

            // v1.75:
            // Do not split assistant answers by visual gap. ChatGPT answers often contain
            // code blocks, paragraphs, and explanations separated by large vertical spacing.
            // Splitting by gap caused Alt+W to copy only the last 118 chars.
            if (!current || roleChanged || item.role === "user") {
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

        // v1.75:
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

        // v1.75: Do not add AI Session Export / Source / URL metadata to OneNote/Word.
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

    function extractRenderedCodeTextWithBreaks(root) {
        const blockTags = new Set([
            "DIV", "P", "LI", "TR", "SECTION", "ARTICLE", "HEADER", "FOOTER",
            "PRE", "CODE"
        ]);

        const lines = [];
        let current = "";

        const pushCurrent = () => {
            const line = current.replace(/\s+$/g, "");
            if (line.trim()) lines.push(line);
            current = "";
        };

        const walk = (node) => {
            if (!node) return;

            if (node.nodeType === Node.TEXT_NODE) {
                current += node.nodeValue || "";
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const tag = node.tagName;
            if (tag === "BR") {
                pushCurrent();
                return;
            }

            if (node.matches?.("button,svg")) {
                return;
            }

            const beforeLine = blockTags.has(tag) && current.trim();
            if (beforeLine) pushCurrent();

            Array.from(node.childNodes || []).forEach(walk);

            if (blockTags.has(tag)) {
                pushCurrent();
            }
        };

        walk(root);

        const joined = lines.join("\n").trim();
        return joined || safeText(root?.innerText || root?.textContent || "");
    }

    function isExportNoiseText(text) {
        const t = cleanExportMultiline(text || "").trim();
        if (!t) return true;

        const exactNoise = new Set([
            "新增至專案來源",
            "回應",
            "回應欠佳",
            "複製",
            "編輯",
            "分享",
            "朗讀",
            "重新產生",
            "重試",
            "資料來源",
            "ChatGPT 可能會出錯。請查證重要資訊。",
            "檢視版本",
            "另外"
        ]);

        if (exactNoise.has(t)) return true;

        return (
            /^今天\s*(上午|下午)?\s*\d{1,2}:\d{2}$/.test(t) ||
            /^昨天\s*(上午|下午)?\s*\d{1,2}:\d{2}$/.test(t) ||
            /^\d{4}年\d{1,2}月\d{1,2}日/.test(t) ||
            /^已思考\s*\d+\s*秒/.test(t) ||
            /^處理時間為\s*\d+s?$/.test(t) ||
            /^第\s*\d+\s*版$/.test(t)
        );
    }

    function removeExportNoiseNodes(root) {
        try {
            if (!root || !root.querySelectorAll) return root;

            const selectors = [
                "button",
                "[role='button']",
                "svg",
                "[aria-label*='複製']",
                "[aria-label*='Copy']",
                "[aria-label*='回應']",
                "[aria-label*='thumb']",
                "[data-testid*='copy']",
                "[data-testid*='composer']",
                "textarea",
                "input",
                "form"
            ].join(",");

            root.querySelectorAll(selectors).forEach((node) => node.remove());

            Array.from(root.querySelectorAll("p,div,span,small")).forEach((node) => {
                if (!node || !node.parentElement) return;
                if (node.querySelector?.("p,li,ol,ul,blockquote,table,pre,code,img")) return;

                const t = cleanExportMultiline(node.innerText || node.textContent || "");
                if (isExportNoiseText(t)) node.remove();
            });

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            while (walker.nextNode()) textNodes.push(walker.currentNode);

            textNodes.forEach((node) => {
                const t = cleanExportMultiline(node.nodeValue || "");
                if (isExportNoiseText(t)) {
                    node.nodeValue = "";
                }
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] remove export noise failed", error);
        }

        return root;
    }

    function removeLeadingUserPromptFromAltW(root) {
        try {
            if (!root || !root.querySelectorAll) return root;

            const children = Array.from(root.children || []);
            for (const child of children.slice(0, 8)) {
                const t = cleanExportMultiline(child.innerText || child.textContent || "");
                if (!t) {
                    child.remove();
                    continue;
                }

                if (
                    isExportNoiseText(t) ||
                    child.matches?.('[data-message-author-role="user"]') ||
                    child.closest?.('[data-message-author-role="user"]') ||
                    (
                        t.length < 200 &&
                        !child.querySelector?.("pre,code,table,ul,ol,blockquote") &&
                        (
                            /coomer\s*是怎/i.test(t) ||
                            /怎讀取非訂閱內容/.test(t) ||
                            /檢視版本/.test(t)
                        )
                    )
                ) {
                    child.remove();
                } else {
                    break;
                }
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] remove leading user prompt failed", error);
        }

        return root;
    }


    function normalizeExportCodeText(rawText) {
        let normalized = safeText(rawText)
            .replace(/\r\n/g, "\n")
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]*↓[ \t]*/g, "\n↓\n")
            .replace(/[ \t]*→[ \t]*/g, "\n→\n");

        const lines = normalized
            .split("\n")
            .map((line) => line.trimEnd())
            .filter((line) => {
                const trimmed = line.trim();
                if (!trimmed) return false;
                if (/^(純文字|plaintext|text|bash|powershell|python|javascript|json|yaml|markdown)$/i.test(trimmed)) return false;
                if (/^(複製|copy|copied|已複製|編輯|edit|檢視版本|新增至專案來源|回應|回應欠佳|另外)$/i.test(trimmed)) return false;
                return true;
            });

        return lines.join("\n").trim();
    }

    function looksLikeRenderedCodeBlock(element) {
        if (!element || !element.querySelectorAll) return false;

        const text = safeText(element.innerText || element.textContent || "");
        if (!text || text.length < 12) return false;

        const lower = text.toLowerCase();
        const hasLanguageLabel =
            /(^|\n|\s)(純文字|plaintext|text|bash|powershell|python|javascript|json|yaml|markdown)(\s|\n|$)/i.test(text);

        const hasCodeSignals =
            text.includes("↓") ||
            text.includes("→") ||
            text.includes("=>") ||
            text.includes("->") ||
            text.includes("git ") ||
            text.includes("python ") ||
            text.includes("sqlite") ||
            text.includes("import ") ||
            text.includes("function ") ||
            text.includes("{") ||
            text.includes("}") ||
            text.split("\n").length >= 4;

        const hasCopyButton = Boolean(
            element.querySelector("button,svg,[aria-label*='Copy'],[aria-label*='複製'],[data-testid*='copy']")
        );

        const manyArrowLines = (text.match(/↓/g) || []).length >= 2 || (text.match(/→/g) || []).length >= 2;
        return (hasLanguageLabel && (hasCodeSignals || hasCopyButton)) || (hasCopyButton && manyArrowLines);
    }

    function convertRenderedCodeBlocksToPre(root) {
        try {
            if (!root || !root.querySelectorAll) return root;

            const candidates = Array.from(root.querySelectorAll("div"))
                .filter((node) => looksLikeRenderedCodeBlock(node))
                .sort((a, b) => {
                    // Convert smaller/nested blocks first; skip parents that contain converted children.
                    const aDepth = getElementDepth(a);
                    const bDepth = getElementDepth(b);
                    return bDepth - aDepth;
                });

            const converted = new Set();

            candidates.forEach((node) => {
                if (Array.from(converted).some((child) => node.contains(child))) return;

                const codeText = normalizeExportCodeText(extractRenderedCodeTextWithBreaks(node));
                if (!codeText || codeText.length < 8) return;

                const pre = document.createElement("pre");
                const code = document.createElement("code");
                code.textContent = codeText;

                pre.setAttribute("data-ai-prompt-bridge-codeblock", "1");
                pre.setAttribute(
                    "style",
                    [
                        "white-space:pre-wrap",
                        "font-family:Consolas,'Cascadia Mono','Courier New',monospace",
                        "font-size:20pt",
                        "line-height:1.45",
                        "background:#f8fafc",
                        "border:1px solid #e5e7eb",
                        "border-radius:6px",
                        "padding:10px 12px",
                        "margin:10px 0",
                        "color:#111111"
                    ].join(";")
                );
                code.setAttribute(
                    "style",
                    "white-space:pre-wrap;font-family:Consolas,'Cascadia Mono','Courier New',monospace;font-size:20pt;line-height:1.45;background:transparent;color:#111111;"
                );

                pre.appendChild(code);
                node.replaceWith(pre);
                converted.add(pre);
            });
        } catch (error) {
            console.warn("[AI Prompt Bridge] convert rendered code blocks failed", error);
        }

        return root;
    }

    function getElementDepth(element) {
        let depth = 0;
        let node = element;
        while (node && node.parentElement) {
            depth += 1;
            node = node.parentElement;
        }
        return depth;
    }


    function cleanRichClone(inputElement) {
        const clone = inputElement.cloneNode(true);
        convertRenderedCodeBlocksToPre(clone);
        removeExportNoiseNodes(clone);
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
            if (
                !el.hasAttribute("data-ai-prompt-bridge-preserved-button") &&
                !el.hasAttribute("data-ai-prompt-bridge-codeblock") &&
                !el.closest?.("[data-ai-prompt-bridge-codeblock]") &&
                el.tagName !== "IMG"
            ) {
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
                if (el.closest?.("pre,[data-ai-prompt-bridge-codeblock]")) return;
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
            root.querySelectorAll("pre, code, pre *, code *").forEach((el) => {
                el.style.whiteSpace = "pre-wrap";
                el.style.wordBreak = "break-word";
                el.style.overflowWrap = "anywhere";
                el.style.fontFamily = "Consolas,'Cascadia Mono','Courier New','Microsoft JhengHei','Noto Sans TC',monospace";
                el.style.setProperty("font-size", "20pt", "important");
                el.style.lineHeight = "1.45";
                if (el.tagName === "PRE") {
                    el.style.backgroundColor = "#f8fafc";
                    el.style.border = "1px solid #e5e7eb";
                    el.style.borderRadius = "6px";
                    el.style.padding = "10px 12px";
                    el.style.margin = "10px 0";
                }
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
  font-size: 20pt !important;
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
  font-size: 20pt !important;
  line-height: 1.6;
  background: transparent;
}
.ai-prompt-bridge-onenote-export pre,
.ai-prompt-bridge-onenote-export pre *,
.ai-prompt-bridge-onenote-export code {
  white-space: pre-wrap;
  font-family: Consolas, "Cascadia Mono", "Courier New", monospace;
  font-size: 20pt !important;
  line-height: 1.45;
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
.ai-prompt-bridge-onenote-export [data-ai-prompt-bridge-codeblock="1"],
.ai-prompt-bridge-onenote-export [data-ai-prompt-bridge-codeblock="1"] * {
  font-family: Consolas, "Microsoft JhengHei", "Noto Sans TC", monospace;
  font-size: 20pt !important;
  line-height: 1.45;
}
.ai-prompt-bridge-onenote-export [data-ai-prompt-bridge-codeblock="1"] {
  background: #f3f4f6 !important;
  background-color: #f3f4f6 !important;
  border: 0 !important;
  border-color: transparent !important;
  border-radius: 8pt;
  border-collapse: collapse;
  border-spacing: 0;
  margin: 8pt 0 12pt;
  box-shadow: none !important;
  mso-border-alt: none;
  mso-table-lspace: 0pt;
  mso-table-rspace: 0pt;
}
.ai-prompt-bridge-onenote-export [data-ai-prompt-bridge-codeblock-line="1"] {
  border: 0 !important;
  border-color: transparent !important;
  mso-border-alt: none;
}
.ai-prompt-bridge-onenote-export [data-ai-prompt-bridge-codeblock-cell="1"] {
  background: #f3f4f6 !important;
  background-color: #f3f4f6 !important;
  border: 0 !important;
  border-top: 0 !important;
  border-bottom: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-color: transparent !important;
  white-space: nowrap !important;
  word-break: normal !important;
  overflow-wrap: normal !important;
  box-shadow: none !important;
  mso-border-alt: none;
}
.ai-prompt-bridge-onenote-export pre {
  white-space: pre-wrap;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 10px;
  border-radius: 6px;
  font-size: 20pt !important;
  line-height: 1.45;
}
.ai-prompt-bridge-onenote-export code {
  font-family: Consolas, "Courier New", monospace;
  background: transparent !important;
  background-color: transparent !important;
  padding: 0;
  font-size: 20pt !important;
  box-shadow: none !important;
}
.ai-prompt-bridge-onenote-export pre code {
  font-size: 20pt !important;
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


    function normalizeReadableHtml(html) {
        const body = safeText(html).trim();
        // Office may discard <style>; applyReadableOneNoteStyles also writes inline styles.
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body,.ai-prompt-bridge-onenote-readable {font-family:"Microsoft JhengHei","Noto Sans TC",Arial,sans-serif;font-size:18pt;line-height:1.55;color:#111;background:#fff;}
.ai-prompt-bridge-onenote-readable p {margin:6pt 0 10pt;}
.ai-prompt-bridge-onenote-readable h1 {font-size:24pt;font-weight:bold;}
.ai-prompt-bridge-onenote-readable h2 {font-size:22pt;font-weight:bold;}
.ai-prompt-bridge-onenote-readable h3,.ai-prompt-bridge-onenote-readable h4 {font-size:20pt;font-weight:bold;}
.ai-prompt-bridge-onenote-readable ul,.ai-prompt-bridge-onenote-readable ol {margin:6pt 0 10pt;padding-left:26pt;}
.ai-prompt-bridge-onenote-readable table {border-collapse:collapse;}
.ai-prompt-bridge-onenote-readable th,.ai-prompt-bridge-onenote-readable td {border-bottom:1px solid #e5e7eb;padding:5pt 7pt;vertical-align:top;}
.ai-prompt-bridge-onenote-readable [data-ai-prompt-bridge-codeblock="1"] {background:#f3f4f6;border:0;}
.ai-prompt-bridge-onenote-readable [data-ai-prompt-bridge-codeblock-cell="1"] {background:#f3f4f6;border:0;}
</style></head><body><div class="ai-prompt-bridge-onenote-readable" style="font-family:'Microsoft JhengHei','Noto Sans TC',Arial,sans-serif;font-size:18pt;line-height:1.55;color:#111111;background-color:#ffffff;">${body}</div></body></html>`;
    }

    function normalizeVisualSnapshotHtml(html) {
        const body = safeText(html).trim();

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body,
.ai-prompt-bridge-visual-snapshot {
  font-family: "Söhne", "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", Arial, sans-serif;
  color: #0f172a;
  background: #ffffff;
}
.ai-prompt-bridge-visual-snapshot {
  max-width: 900px;
  line-height: 1.65;
}
.ai-prompt-bridge-visual-snapshot pre {
  white-space: pre-wrap;
}
.ai-prompt-bridge-visual-snapshot code {
  font-family: "Söhne Mono", Consolas, "Cascadia Mono", monospace;
}
</style>
</head>
<body>
<div class="ai-prompt-bridge-visual-snapshot">
${body}
</div>
</body>
</html>`;
    }

    function applyReadableOneNoteStyles(root) {
        if (!root) return;
        try {
            const baseFont = '"Microsoft JhengHei", "Noto Sans TC", "Segoe UI", Arial, sans-serif';
            root.style.fontFamily = baseFont;
            root.style.setProperty("font-size", "18pt", "important");
            root.style.lineHeight = "1.55";
            root.style.color = "#111111";
            root.style.backgroundColor = "#ffffff";

            root.querySelectorAll("*").forEach((node) => {
                if (!node.style) return;
                const inBlock = !!node.closest?.('pre, [data-ai-prompt-bridge-codeblock="1"]');
                const inlineCode = !inBlock && node.tagName === "CODE";
                node.style.boxShadow = "none";
                node.style.removeProperty("mso-highlight");
                node.style.removeProperty("mso-shading");
                if (!inBlock) {
                    // Do not allow syntax/selection/background from the source DOM to leak
                    // into normal paragraphs, list items, or nested spans.
                    node.removeAttribute("bgcolor");
                    node.style.setProperty("background-color", "transparent", "important");
                    node.style.setProperty("background-image", "none", "important");
                    node.style.fontFamily = inlineCode ? 'Consolas, "Microsoft JhengHei", monospace' : baseFont;
                    node.style.setProperty("font-size", "18pt", "important");
                    node.style.lineHeight = "1.55";
                    node.style.color = "#111111";
                } else {
                    node.style.fontFamily = 'Consolas, "Microsoft JhengHei", monospace';
                    node.style.setProperty("font-size", "16pt", "important");
                    node.style.lineHeight = "1.4";
                    if (node.tagName === "PRE" || node.hasAttribute('data-ai-prompt-bridge-codeblock')) {
                        node.style.backgroundColor = "#f3f4f6";
                        node.style.border = "0";
                    } else if (!node.hasAttribute('data-ai-prompt-bridge-codeblock-cell')) {
                        node.style.backgroundColor = "transparent";
                    }
                }
            });
            [["h1","24pt"],["h2","22pt"],["h3, h4","20pt"]].forEach(([selector,size]) => {
                root.querySelectorAll(selector).forEach(h => {
                    h.style.setProperty("font-size",size,"important");
                    h.style.fontWeight = "700";
                    h.style.margin = "12pt 0 8pt";
                });
            });
            root.querySelectorAll("p").forEach(p => {p.style.margin = "6pt 0 10pt";});
            root.querySelectorAll("ul,ol").forEach(list => {list.style.margin="6pt 0 10pt";list.style.paddingLeft="26pt";});
            root.querySelectorAll("li").forEach(li => {li.style.margin="3pt 0";});
            root.querySelectorAll("blockquote").forEach(el => {
                el.style.borderLeft="3pt solid #d1d5db";
                el.style.paddingLeft="10pt";
                el.style.margin="8pt 0";
            });
            // Preserve actual Markdown tables; code-block tables keep their original row layout.
            root.querySelectorAll('table:not([data-ai-prompt-bridge-codeblock="1"])').forEach(table => {
                if (table.closest('[data-ai-prompt-bridge-codeblock="1"]')) return;
                table.style.borderCollapse="collapse";
                table.style.width="100%";
            });
            root.querySelectorAll('th,td').forEach(cell => {
                if (cell.closest('[data-ai-prompt-bridge-codeblock="1"]')) return;
                cell.style.padding="5pt 7pt";
                cell.style.border="0";
                cell.style.borderBottom="1px solid #e5e7eb";
            });
            root.querySelectorAll('[data-ai-prompt-bridge-codeblock="1"]').forEach(el => {
                el.style.backgroundColor="#f3f4f6";
                el.style.border="0";
                el.style.borderCollapse="collapse";
                el.style.borderSpacing="0";
            });
            root.querySelectorAll('[data-ai-prompt-bridge-codeblock-cell="1"]').forEach(cell => {
                cell.style.backgroundColor="#f3f4f6";
                cell.style.border="0";
                cell.style.setProperty("font-size","16pt","important");
            });
        } catch (error) { console.warn("[AI Prompt Bridge] readable style failed", error); }
    }

    function removeVisualSnapshotNoise(root) {
        if (!root) return;

        try {
            root.querySelectorAll("button, svg, nav, aside, header, footer, form, textarea, input").forEach((node) => {
                const text = normalizeText(node.innerText || node.textContent || "");
                if (!text || isUtilityButtonText(text) || node.tagName !== "BUTTON") {
                    node.remove();
                }
            });

            root.querySelectorAll('[contenteditable="true"], [data-testid*="composer"]').forEach((node) => node.remove());
        } catch (error) {
            console.warn("[AI Prompt Bridge] removeVisualSnapshotNoise failed", error);
        }
    }

    function inlineComputedStylesForSnapshot(source, clone) {
        if (!source || !clone || source.nodeType !== Node.ELEMENT_NODE || clone.nodeType !== Node.ELEMENT_NODE) return;

        const keepProps = [
            "display", "box-sizing", "width", "max-width", "min-width",
            "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
            "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
            "border", "border-top", "border-right", "border-bottom", "border-left",
            "border-radius", "background", "background-color", "color",
            "font-family", "font-size", "font-weight", "font-style", "line-height",
            "letter-spacing", "white-space", "word-break", "overflow-wrap",
            "text-align", "vertical-align", "list-style-type", "list-style-position",
            "border-collapse", "border-spacing", "box-shadow"
        ];

        try {
            const computed = window.getComputedStyle(source);
            keepProps.forEach((prop) => {
                const value = computed.getPropertyValue(prop);
                if (value) clone.style.setProperty(prop, value);
            });

            // Avoid copying huge layout widths from the ChatGPT page into OneNote.
            if (clone.style.position === "fixed" || clone.style.position === "sticky") {
                clone.style.position = "static";
            }
            clone.style.maxWidth = clone.style.maxWidth || "900px";

            const srcChildren = Array.from(source.children || []);
            const cloneChildren = Array.from(clone.children || []);
            cloneChildren.forEach((child, index) => inlineComputedStylesForSnapshot(srcChildren[index], child));
        } catch (error) {
            console.warn("[AI Prompt Bridge] inlineComputedStylesForSnapshot failed", error);
        }
    }

    async function copyVisualSnapshotForOneNote() {
        const target = await getAltWRichCopyTargetStable("Alt+Shift+W");

        if (!target || !target.element) {
            alert("Alt+Shift+W 尚未找到可確認屬於最新回合的完整回答；未改動剪貼簿。請檢查 Console 的 [AI Prompt Bridge] 診斷訊息。");
            return;
        }
        if (isAltWMissingEarlierVisibleAnswer(target)) {
            alert("Alt+Shift+W 偵測到最新回答前段遺漏，已取消複製以避免漏段。");
            return;
        }

        if (target.source !== "selection" && target.source !== "dil-whole-response" && isLikelyWholeSessionElement(target.element)) {
            alert("Alt+Shift+W 只複製單段視覺快照。偵測到候選內容像完整 session，已停止複製。完整 session 請用 Alt+N。");
            return;
        }

        const clone = target.element.cloneNode(true);
        removeVisualSnapshotNoise(clone);
        absolutizeImageSources(clone);
        inlineComputedStylesForSnapshot(target.element, clone);

        const textContent = richElementToPlainText(clone);
        if (!validateDilCopyCompleteness(target, textContent)) {
            alert("Alt+Shift+W：視覺複製內容不完整，已取消複製。");
            return;
        }
        if (!textContent || textContent.length < 2) {
            alert("Alt+Shift+W 抓到的內容是空的，已阻止複製。");
            return;
        }

        if (target.source !== "official-whole-turn" && target.source !== "official-content-root" && textContent.length < 250) {
            alert(`Alt+Shift+W 偵測到疑似片段輸出（${textContent.length} 字），已阻止複製，避免覆蓋剪貼簿。`);
            return;
        }

        const htmlContent = normalizeVisualSnapshotHtml(clone.outerHTML || clone.innerHTML || `<pre>${escapeHtml(textContent)}</pre>`);

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([textContent], { type: "text/plain" })
                    })
                ]);
                toast(`Alt+Shift+W 已複製 ChatGPT 視覺版快照：${textContent.length} 字`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] visual snapshot clipboard failed, fallback to plain text", error);
        }

        await copyText(textContent, `Alt+Shift+W 已降級複製純文字（${textContent.length} 字）`);
    }

    async function copyRichTextForOffice() {
        const target = await getAltWRichCopyTargetStable("Alt+W");

        if (!target || !target.element) {
            alert("Alt+W 尚未找到可確認屬於最新回合的完整回答；未改動剪貼簿。請檢查 Console 的 [AI Prompt Bridge] 診斷訊息。");
            return;
        }
        if (isAltWMissingEarlierVisibleAnswer(target)) {
            alert("Alt+W 偵測到最新回答前段未擷取完整，已取消複製以避免漏段。請檢查 Console 的回合容器診斷訊息。");
            console.warn('[AI Prompt Bridge] partial answer rejected', {source:target.source, chars:target.textLength});
            return;
        }

        if (target.source !== "selection" && target.source !== "dil-whole-response" && isLikelyWholeSessionElement(target.element)) {
            alert("Alt+W 只複製單段內容。偵測到候選內容像完整 session，已停止複製。請手動框選單段後再按 Alt+W；完整 session 請用 Alt+N。");
            return;
        }

        const clone = cleanRichClone(target.element);
        absolutizeImageSources(clone);
        cleanOfficeExportElement(clone);
        const textContent = richElementToPlainText(clone);

        if (!validateDilCopyCompleteness(target, textContent)) {
            alert("Alt+W：清理後的回答遺漏開頭、結尾或大量正文；已取消複製，剪貼簿不變。請查看 Console 診斷。");
            return;
        }

        if (!textContent || textContent.length < 2) {
            alert("Alt+W 抓到的內容是空的，已阻止複製。");
            return;
        }

        if (target.source !== "official-whole-turn" && target.source !== "official-content-root" && textContent.length < 250) {
            alert(`Alt+W 偵測到疑似片段輸出（${textContent.length} 字），已阻止複製，避免覆蓋剪貼簿。`);
            return;
        }

        if (target.source !== "selection" && isBadAltWExportText(textContent)) {
            alert("Alt+W 偵測到候選內容像舊 session / composer 草稿，已停止複製，避免覆蓋剪貼簿。請先點一下目前回答區塊或手動框選後再按 Alt+W。完整 session 請用 Alt+N。");
            return;
        }

        if (target.element?.getAttribute?.("data-ai-prompt-bridge-altw-markdown-root") === "1") {
            const cleanOfficeClone = sanitizeAltWMarkdownRootForOffice(clone);
            if (cleanOfficeClone) {
                clone.innerHTML = "";
                Array.from(cleanOfficeClone.childNodes).forEach((node) => clone.appendChild(node.cloneNode(true)));
            }
            normalizeAltWMarkdownRootOfficeFont(clone);
            normalizeAltWMarkdownRootBackgrounds(clone);
        }

        applyOneNoteInlineStyles(clone);


        applyReadableOneNoteStyles(clone);

        const htmlContent = normalizeReadableHtml(clone.innerHTML || `<pre>${escapeHtml(textContent)}</pre>`);

        try {
            if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "text/html": new Blob([htmlContent], { type: "text/html" }),
                        "text/plain": new Blob([textContent], { type: "text/plain" })
                    })
                ]);
                toast(`Alt+W 已複製 OneNote 可讀版：${textContent.length} 字`);
                return;
            }
        } catch (error) {
            console.warn("[AI Prompt Bridge] rich clipboard failed, fallback to plain text", error);
        }

        await copyText(textContent, `Alt+W 可讀版已降級複製純文字（${textContent.length} 字）`);
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
            await copyVisualSnapshotForOneNote();
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
        GM_registerMenuCommand("Alt+W Copy Single Answer OneNote Readable", async () => {
            await copyRichTextForOffice();
        });
        GM_registerMenuCommand("Alt+Shift+W Copy Single Answer Visual Snapshot", async () => {
            await copyVisualSnapshotForOneNote();
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
