# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This repository contains two independent, unrelated single-page apps, each built with plain HTML/CSS/vanilla JavaScript — no framework, no build tools, no package manager, and no test runner. All UI text in both apps is in Korean.

- Root (`index.html`, `main.js`, `style.css`) — a To-Do list app
- `FXCONVETER/` (`index.html`, `main.js`, `style.css`) — a currency (FX) converter app

The two apps do not share code, state, or styling. When asked to work on "the app," check which one the request actually concerns — file names are identical across the two folders.

## Running the apps

There is no build or dev-server step for either app. Open the relevant `index.html` directly in a browser (or use a static file server / Live Server extension). From PowerShell:

```powershell
Start-Process index.html               # To-Do app
Start-Process FXCONVETER\index.html    # FX converter app
```

## Architecture

### To-Do app (root)

Three files, each with a single responsibility:

- `index.html` — static markup and the DOM elements `main.js` binds to (`#todo-input`, `#add-btn`, `#filter-area`, `#todo-stats`, `#todo-list`, `#empty-message`, `#clear-completed-btn`)
- `main.js` — all application logic, loaded as a single script with `defer`
- `style.css` — all styling, plain CSS with no preprocessor

#### State and rendering model

`main.js` holds all app state in three module-level variables: `todos` (array of `{ id, text, completed }`), `nextId`, and `currentFilter` (`'all' | 'active' | 'completed'`). There is no framework or virtual DOM — every mutation (`addTodo`, `toggleTodo`, `deleteTodo`, `setFilter`, `clearCompleted`) calls `renderTodos()`, which clears `#todo-list` and rebuilds it from scratch via `getFilteredTodos()`. `renderTodos()` also updates the stats line and persists to `localStorage` on every call, so state, DOM, and storage never drift apart.

Persistence is a plain `localStorage` key (`STORAGE_KEY = 'todos'`) holding the JSON-serialized `todos` array. `nextId` is not stored — it's recomputed on load as `max(existing ids) + 1` so it never collides with restored items.

DOM event listeners are attached once in `initApp()`. List item clicks/changes (delete, checkbox toggle) are handled via event delegation on `#todo-list` rather than per-item listeners, since `<li>` elements are created and destroyed on every render.

Todo text is inserted with `textContent`, never `innerHTML`, to avoid XSS from user input — preserve this when touching the render path.

### FX converter app (`FXCONVETER/`)

Three files, mirroring the same one-responsibility split:

- `index.html` — markup and the DOM elements `main.js` binds to (`#amount-input`, `#from-currency`, `#to-currency`, `#swap-btn`, `#convert-btn`, `#result`)
- `main.js` — all application logic, loaded with `defer`
- `style.css` — all styling

#### Conversion flow

`main.js` has no persisted state — it's purely event-driven and stateless between conversions. `initApp()` (run on `DOMContentLoaded`) caches the DOM element references into module-level `let` variables and wires two listeners: `convertBtn` → `convertCurrency()`, `swapBtn` → `swapCurrencies()`.

`convertCurrency()`:
1. Validates `amount-input` (must parse to a positive number) before doing anything else.
2. If `from-currency` and `to-currency` are the same, short-circuits to displaying the input amount unchanged — no network call.
3. Otherwise calls the free `exchangerate-api.com` endpoint at `${API_BASE_URL}${from}` (`API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/'`), reads `data.rates[to]`, and multiplies by the amount.
4. All outcomes (validation error, in-flight "변환 중...", success, fetch/API failure) are written to `#result` via `showResult()`, which uses `textContent`.

`swapCurrencies()` swaps the `value` of the two `<select>` elements and, if `amount-input` is non-empty, immediately re-runs `convertCurrency()` so the displayed result stays in sync with the swapped currencies.

Supported currencies are hardcoded as `<option>`s in `index.html`: USD, EUR, KRW, JPY.
