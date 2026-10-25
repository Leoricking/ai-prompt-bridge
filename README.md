# AI Prompt Bridge v1.85 — ChatGPT Session User-Bubble Recovery

## Base and scope
Built on the provided v1.84 full userscript. This is a **full replacement** (not a patch-only userscript). Main changes are limited to identifying ChatGPT user-message DOM and sharing validation for Alt+N and Alt+S. The Gemini selectors and answer/visual modes remain as in v1.84.

## Changes
- Detect several observed/likely generations of ChatGPT user-message wrappers (`data-message-author-role`, `data-testid`, user-oriented CSS class names, and corroborated whitespace-preserved text bubbles).
- Reject bubbles nested inside a `DilResponseRoot`, sidebar, composer, form, etc.
- Keep DOM order and repeated turns; avoid deduplication by matching text alone.
- Alt+N and Alt+S share a Session verification report (number of confirmed User and AI elements).
- If a user question cannot be identified, **abort without overwriting clipboard** and report counters. Does NOT guarantee all historic/virtualized messages are loaded.
- Alt+W / Alt+Shift+W, Alt+C / Alt+V and other shortcuts remain in the existing implementation.

## Installation
Backup the v1.84 Tampermonkey script. Replace it with `apb_v185.user.js` (or rename into your repository's `ai-prompt-bridge.user.js`), save and reload tabs.

## Acceptance
1. On ChatGPT Marcus conversation, inspect Console message `[AI Prompt Bridge] v1.85 session verification`; Alt+N should include original User questions and every loaded AI answer in the same order.
2. Alt+S should represent the same ordered blocks, as plain text.
3. Alt+W must copy the full latest answer (Marcus introduction, A/B/C and closing), and Writing Block text when present.
4. Gemini: manually verify latest answer and full-session rich and plain exports; selectors remain unconfirmed on your exact Gemini UI.
5. Check OneNote formatting and other hotkeys. Disable the separate diagnostic Tampermonkey userscript if you don't need its Alt+W capture overlay.

**Known limitation:** The user supplied DOM log only describes a ChatGPT assistant DIL response, not the user-question HTML structure. This build improves detection using plausible stable markers, but cannot guarantee success until the actual User bubble DOM is inspected. It deliberately refuses a falsely 'complete' Session when User=0. Do not push before verifying in Opera.

## Git commands (only after end-to-end validation)
```powershell
node --check .\ai-prompt-bridge.user.js
git diff --check
git add README.md ai-prompt-bridge.user.js ai-prompt-bridge.user.txt
git commit -m "fix: recover ChatGPT user bubbles in full session export"
git push origin main
```
---

## v1.85 - ChatGPT Session User Bubble Detection

### Fixes
- Improve ChatGPT User Bubble detection for full-session exports.
- Make Alt+N and Alt+S share the session collection logic.
- Preserve conversation order and avoid duplicate message containers.
- Reject incomplete sessions instead of reporting false success.

### Preserved
- Alt+W: latest complete AI answer.
- Alt+Shift+W: visual answer export.
- Gemini extraction workflows from v1.84.
- Alt+C, Alt+V, Review, Panel and Project Context.

### Validation
- JavaScript syntax validation required.
- Opera, ChatGPT, Gemini and OneNote end-to-end tests pending.
