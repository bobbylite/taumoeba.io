<div align="center">

<img src="assets/taumoeba-logo.png" alt="Taumoeba.io" width="110">

# Taumoeba.io WebKit

**A blazing-fast, zero-dependency developer toolkit that lives entirely in your browser.**

JWT decoding · JSON editing · JSON serialize/deserialize · Base64 · URL encoding — all in one beautiful static page.

<br/>

[![taumoeba.io](https://img.shields.io/badge/taumoeba.io-launch-89b4fa?style=for-the-badge&labelColor=1e1e2e&logoColor=89b4fa)](https://taumoeba.io)

<br/>

[![Static](https://img.shields.io/badge/static-no%20server%20needed-a6e3a1?style=flat-square&labelColor=1e1e2e)](.)
[![Zero deps](https://img.shields.io/badge/dependencies-zero-cba6f7?style=flat-square&labelColor=1e1e2e)](.)
[![No build](https://img.shields.io/badge/build%20step-none-89b4fa?style=flat-square&labelColor=1e1e2e)](.)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-f38ba8?style=flat-square&labelColor=1e1e2e)](.)
[![Theme](https://img.shields.io/badge/theme-dark%20%2B%20light-f9e2af?style=flat-square&labelColor=1e1e2e)](.)

</div>

---

## What is this?

Taumoeba.io WebKit is a collection of everyday developer utilities packaged as a single, self-contained HTML file. No npm install. No bundler. No runtime. Open it in a browser and it works — locally, offline, or served from any static host.

The design is inspired by [Catppuccin](https://github.com/catppuccin/catppuccin) — a pastel palette that's easy on the eyes at 2 AM and just as clean in full daylight.

---

## Tools

### 🔐 JWT Decoder
Paste any JWT and watch it come alive. The encoded token lights up in three distinct colors — **header · payload · signature** — right inside the input box. Click it to edit, click away to decode.

- Structured claim table with type-colored values (strings, numbers, booleans, arrays)
- Human-readable timestamps with live relative time (`expires in 3h`, `issued 2m ago`)
- **PingOne-aware** — automatically annotates `env`, `org`, `p1.app`, `p1.region`, `acr`, `amr`, `sid`, and more
- Expiry badge: `Valid` · `Expired` · `Expires in Xm` · `Not Yet Valid`
- Algorithm and token-type badges
- One-click copy for header and payload

### 🌲 JSON Editor
A split-pane editor with two sub-tools: **Editor** and **Serialize / Deserialize**.

#### Editor
- **Left pane** — raw text editor with auto-parse on type
- **Right pane** — collapsible tree view with ▾/▸ toggles and item counts on collapsed nodes
- Type-colored values throughout (`teal keys`, `green strings`, `peach numbers`, `mauve booleans`, `sky nulls`)
- Format · Minify · Sort Keys — all non-destructive
- Live validation status chip with node count
- Explicit sync arrows to push text → tree or tree → text

#### Serialize / Deserialize
Convert between a JSON object and a JSON-encoded string literal — the operation you need when embedding JSON inside another JSON field, a config file, a REST body, or source code.

- **Serialize** — takes a JSON object and produces an escaped string literal: `{"a":1}` → `"{\"a\":1}"`
- **Deserialize** — takes a JSON string literal and expands it back to a formatted object: `"{\"a\":1}"` → `{ "a": 1 }`
- Swap input ↔ output in one click to chain operations
- Clear error messages when input doesn't match the expected form

### 🔡 Base64
Clean encode/decode with two variants and character count on output.

- **Standard** (`btoa` / `atob`) and **URL-safe** (`-_` instead of `+/`, no padding)
- UTF-8 and Latin-1 charset support
- Swap input ↔ output in one click

### 🔗 URL Encoder
Full percent-encoding in the two modes you actually need.

- **Component** — `encodeURIComponent`: encodes everything except `A–Z a–z 0–9 - _ . ! ~ * ' ( )`. Use for query values and path segments.
- **Full URI** — `encodeURI`: preserves URI structure characters (`: / ? # [ ] @ ! $ & ' ( ) * + , ; =`). Use when encoding a complete URL.
- Mode description updates inline so you always know what will be encoded.

---

## Design

| | Dark | Light |
|---|---|---|
| **Palette** | Catppuccin Mocha | Catppuccin Latte |
| **Base** | `#1e1e2e` | `#eff1f5` |
| **UI font** | Inter | Inter |
| **Code font** | JetBrains Mono | JetBrains Mono |

The color system lives entirely in CSS custom properties — swap a palette by editing one block of variables.

The header uses `backdrop-filter: blur` for a frosted-glass effect. Interactive states use `color-mix()` for alpha variants of semantic accent colors — no hardcoded `rgba` values anywhere.

The layout is fully responsive down to iPhone-sized screens: tab labels collapse to icon-only at narrow widths (accessible names preserved via `aria-label`), the JSON editor stacks vertically, inputs use 16 px to prevent iOS auto-zoom, and safe-area insets are respected for notch and home-indicator clearance.

---

## Getting Started

**Option 1 — just open it:**
```bash
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

**Option 2 — VS Code with F5:**

The repo ships a `.vscode/launch.json` with Chrome and Edge configurations. Hit **F5** and it opens directly.

**Option 3 — any static host:**

Drop the three files (`index.html`, `style.css`, `app.js`) anywhere — GitHub Pages, Netlify, Vercel, S3, a USB drive. No build step required.

---

## Deployment

Push to `main` and GitHub Actions handles the rest:

```
push → main
  └─ validate job
       ├─ JS parse check
       └─ asset presence check
  └─ deploy job (main only)
       └─ GitHub Pages via actions/deploy-pages
```

To enable: go to **Settings → Pages → Source → GitHub Actions**.

---

## Project Structure

```
taumoeba/
├── index.html          # all markup
├── style.css           # design system + components
├── app.js              # all logic
│
├── assets/
│   └── taumoeba-logo.png
│
├── .vscode/
│   └── launch.json     # F5 → Chrome or Edge
├── .github/
│   └── workflows/
│       └── deploy.yml
└── .gitignore
```

No `node_modules`. No `package.json`. No lock files. The entire app ships in hand-written HTML, CSS, and JavaScript — no build step, no bundler, no framework.

---

## Philosophy

> Tools should get out of the way.

Every decision here optimizes for **instant availability** — open a file, start working. No install, no loading spinners, no sign-in, no telemetry. Your tokens and JSON never leave your machine; all processing is done in-browser with standard Web APIs.

---

<div align="center">

<img src="assets/taumoeba-logo.png" alt="Taumoeba.io" width="48">

Made with the [Catppuccin](https://github.com/catppuccin/catppuccin) palette · Built for developers who live in terminals and dark mode

</div>
