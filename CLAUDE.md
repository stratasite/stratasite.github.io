## Company context
@STRATA.md

# Strata

Business-intelligence platform. (Add your stack, build/test commands, and repo
layout here — keep this root file short and stable; ~50–200 lines max.)

## Brand & design system
The brand is a behavioral contract, enforced through design tokens.
- Full rules: @.claude/rules/brand.md
- Color/type/radius tokens (source of truth): `brand/tokens.css`, `brand/tailwind.brand.js`, `brand/tokens.json`
- Logo & favicon assets: `brand/assets/`

Core rule: **never hardcode hex values in components** — reference tokens
(`var(--primary)`, `bg-primary`, `text-foreground`, `--chart-1`…). If a color is
missing, add it to `brand/tokens.css` first.

## Conventions
- Headings/wordmark use Poppins (`font-display`); UI/body uses Inter (`font-sans`).
- Product name is lowercase in UI and prose: "strata".
- Charts are first-class: use the `--chart-*` series and `--ramp-*` sequential ramp.
