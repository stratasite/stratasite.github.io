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

## Documentation (`/docs/`)
- Pages are MDX in `src/content/docs/` (developer guide at the root,
  `self-hosting/` for the server guide). The H1 is frontmatter `title`; the
  body starts at the first paragraph. Sidebar order and grouping live in
  `src/config/docs.ts`, not in frontmatter.
- Callouts use `:::tip[Title]` … `:::` (note/tip/info/warning/caution/danger).
  `<Tabs>`/`<TabItem>` need no import. Mermaid fences render client-side.
- Machine exports: `/docs/llms.txt`, `/docs/api/docs.json`, `/docs/api/schema/*.json`
  (`src/pages/docs/`, hand-written parts in `src/data/docs-ai/`). The REST API
  reference at `/docs/api-reference/` is Redoc over `public/docs/openapi/`.
- Search is Pagefind; the index is built by `npm run build`.

## Conventions
- Theme is **ink-primary**: ink `--background`, cream `--foreground`, peach
  `--primary` for text-level accents, rust `--cta` for filled buttons and
  `.band-rust` sections (products band, proof strips, closing CTAs). Rust is a
  fill color, never text on ink. Body copy uses `--muted-foreground` (cool
  off-white). Use semantic tokens, not raw swatches.
- Headings/wordmark use Space Grotesk (`font-display`); UI/body uses Inter (`font-sans`).
- Product name is "Strata" (capitalized) in UI copy and prose. The one exception is the **wordmark/logo**, which is always lowercase "strata" (a styled design element), and the `strata` CLI binary/commands in code.
- Charts are first-class: use the `--chart-*` series and `--ramp-*` sequential ramp.
