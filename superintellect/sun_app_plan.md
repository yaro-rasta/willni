# 🏗️ Implementation Plan: sun.app (One Logic, many UI)

## 🏁 Goal
Transform `apps/sun.app` into a multi-interface application (CLI + Web) following TDD and the Verse architecture.

## 🏛️ Architecture
- **Core Logic**: `apps/sun.app/src/SunCore.js` (Status, Allowance, 8-byte range).
- **UI-Chat**: `apps/sun.app/src/ui-chat/` (Dialogue-first interface using LLM).
- **UI-CLI**: `apps/sun.app/src/ui-cli/` (Premium Terminal for Architects).
- **UI-Lit**: `apps/sun.app/src/ui-lit/` (Web Components).
- **UI-React**: `apps/sun.app/src/ui-react/` (Consumer PWA).

## 🧪 Testing (TDD)
1.  **Step 1**: Pure Core Logic and status math (`SunCore.test.js`).
2.  **Step 2**: Intent analysis for Chat (Dialogue tests).
3.  **Step 3**: CLI Adapter validation.

## 🛠️ Tasks
- [ ] Create `apps/sun.app/src/SunCore.test.js`.
- [ ] Implement `SunCore.js` with 8-byte range and organic growth (starting from 1 unit).
- [ ] Create `apps/sun.app/bin/sun.js` for CLI entry.
- [ ] Add `sun portal`, `sun claim`, `sun status` commands.
- [ ] Update `index.js` to dispatch logic.

---
*Will-n-i Production, Feb 2026*
