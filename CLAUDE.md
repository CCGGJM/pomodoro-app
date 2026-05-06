# CLAUDE.md

与 Claude Code 的所有沟通请使用中文。代码中的注释、说明也始终使用中文描述。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Start Vite dev server + Electron concurrently
npm run build  # Build for production (Vite build + electron-builder)
npm run preview # Preview the Vite production build
```

## Architecture

**Electron + React + Vite** desktop Pomodoro timer app. Chinese UI, Apple dark theme.

### Process model (Electron)

- **Main process** (`electron/main.js`): Creates BrowserWindow (400×600, hiddenInset title bar), handles IPC for system notifications (`send-notification` channel). Loads Vite dev server at `http://localhost:5173` in dev mode, or `dist/index.html` in production.
- **Preload** (`electron/preload.js`): Uses `contextBridge` to expose `window.electronAPI.sendNotification()` via `ipcRenderer.invoke`.
- **Renderer** (React app): Full context isolation, no nodeIntegration.

### React component tree

```
main.jsx          → ReactDOM entry
App.jsx           → State hub: timer logic, mode switching, session tracking
├── Timer.jsx     → SVG ring + time display (controlled component)
├── Controls.jsx  → Start/Pause + Reset buttons
└── Settings.jsx  → Bottom-sheet overlay with sliders for 3 durations
```

### State management (no external library)

All state lives in `App.jsx` via `useState` hooks:
- `settings` — work/shortBreak/longBreak durations (default: 25/5/15 min)
- `mode` — one of `work`, `shortBreak`, `longBreak`
- `timeLeft` — seconds remaining (drives `setInterval` every 1s)
- `isRunning` — timer running state
- `sessionCount` / `completedSessions` — for 4-cycle pomodoro tracking

Timer completion auto-switches modes: work → short break (×3) → work → long break, repeating.

### Styling

Single CSS file (`src/styles/App.css`) with CSS custom properties for theming. Apple dark color palette with per-mode colors (blue for work, green for short break, purple for long break). CSS variables are set via inline `style` on the root `.app` element (`--primary`, `--secondary`, `--bg-accent`, `--glow`).

### Key patterns

- `isDev` check in main.js loads dev server URL vs built files
- Notification uses Electron IPC when available, falls back to Web Notification API
- Timer interval cleans up via `useEffect` return to prevent leaks
- Settings reset timer, sessions, and mode to work on save
- `getDuration()` is memoized with `useCallback` depending on settings
