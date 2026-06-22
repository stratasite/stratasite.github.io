# Strata brand package

Drop-in brand system for Strata, structured so Claude Code applies it
automatically every session.

## Contents
```
CLAUDE.md                  ← root index (merge into your repo's CLAUDE.md)
.claude/rules/brand.md     ← the brand contract Claude Code loads
brand/
├── tokens.css             ← CSS variables (import once at app root)
├── tailwind.brand.js      ← Tailwind theme extend
├── tokens.json            ← platform-agnostic tokens
├── README.md
└── assets/                ← logo SVGs + favicon PNGs (light & dark)
```

## Wiring it up
1. **Import the tokens** once, globally (e.g. top of `globals.css` / app entry):
   `@import "./brand/tokens.css";`
2. **Tailwind** (if used): set `darkMode: 'class'` and spread the theme:
   ```js
   const strata = require('./brand/tailwind.brand.js');
   module.exports = { darkMode: 'class', theme: { extend: { ...strata } } };
   ```
3. **Fonts**: load Poppins (display) + Inter (UI). Self-host or:
   `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">`
4. **Dark mode**: toggle the `.dark` class on `<html>`; tokens swap automatically.
5. **Favicon**: point to `brand/assets/strata_mark_32.png` (and 16/64 for other sizes).

## The one rule that matters
Reference tokens, never raw hex. That's what keeps every screen Claude Code
builds on-brand without you re-explaining it.
