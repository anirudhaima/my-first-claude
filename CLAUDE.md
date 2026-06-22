# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint (flat config, ESLint 9+)
```

No test framework is configured.

## Architecture

Single-page React 19 app built with Vite. All application logic lives in two files:

- [src/App.jsx](src/App.jsx) — the entire to-do app: state (`todos` array of `{id, text, done}`), and handlers `addTodo`, `toggleTodo`, `deleteTodo`
- [src/main.jsx](src/main.jsx) — React root mount point

Styling uses CSS custom properties defined in [src/index.css](src/index.css) for theming (light/dark via `prefers-color-scheme`). Component-scoped styles are in [src/App.css](src/App.css).

The project uses `@vitejs/plugin-react` with Oxc (not SWC) for JSX compilation. No TypeScript — JSX only. No routing, no state management library, no API layer.
