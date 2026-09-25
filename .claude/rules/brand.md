# Strata — Brand Rules

Strata is a business-intelligence platform. The identity is a stacked "data
horizon": warm rust/peach strata with a cool ink trend line. Apply it
consistently in all UI, marketing, and generated assets.

## Source of truth — never hardcode colors
- All colors live in `brand/tokens.css` (CSS variables) and `brand/tailwind.brand.js`.
- ALWAYS reference tokens: `var(--primary)`, `bg-primary`, `text-foreground`, `--chart-1`…
- NEVER paste raw hex (e.g. `#BC3908`) into a component. If a needed color is
  missing, add it to `brand/tokens.css` first, then reference it.
- The site ships a single **ink-primary** theme (semantic tokens in `brand/tokens.css`); rust appears through `.band-rust` sections and the `--cta` fill, not per-component overrides.

## Palette
- Ink `--strata-ink-deep` (#14203A) — the page **background**; `--strata-ink` (#1C2B45) cards and the footer; `--strata-ink-night` (#0A1123) code and terminal surfaces.
- Rust `--strata-rust` (#BC3908) — the **fill** color: filled CTAs, rust bands, chart primary. Under 3:1 on ink, so never rust text or hairlines on ink. `--strata-rust-deep` (#9C2A04) for panels inside a rust band.
- Warm layers: orange `--strata-orange` (#E0641F), peach `--strata-peach` (#FFC26E) — the text-level accent on ink.
- Cream `--strata-cream` (#FFF6EA) — the primary **text/foreground**.

## Theme — semantic roles (ink-primary)
Reference these semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-cta`…), never the raw swatches, in components:
- `--background` deep ink; `--surface` / `--surface-2` ink for cards/panels; `--code-surface` for terminals.
- `--foreground` cream for headings/strong text; `--muted-foreground` `#C9D0DE` (cool off-white) for body copy, AA on deep ink.
- `--primary` peach for text-level accents and links; `--cta` rust with `--cta-foreground` cream for filled buttons.
- `.band-rust` (alias `.dark`) flips a section to the rust palette: use it for one large rust surface per page. Inside it `--cta` becomes peach.
- `--media-shadow` lifts screenshots and video (cream hairline, deep shadow, cool halo); no warm glow on ink.
- `--border` an ink hairline.

## Typography
- Display / headings / wordmark: **Space Grotesk** (`font-display`).
- UI / body: **Inter** (`font-sans`).
- Data tables & numerals: enable tabular figures — `font-feature-settings: "tnum" 1;`.
- The wordmark "strata" is always lowercase.

## Logo & mark — assets in `brand/assets/`
- Mark: `strata_mark.svg` (light bg), `strata_mark_dark.svg` (dark bg).
- Lockup: `strata_primary.svg`. Favicons: `strata_mark_16/32/64.png`.
- Use the SVGs in product/web; reference these files — do not redraw the logo in code.
- Clear space around the mark ≥ 25% of its height. Min mark size 16px.
- NEVER: recolor the mark outside the palette, stretch/skew it, add the old
  rounded-square frame back, add drop shadows, or place the light mark on a busy/dark
  background (use the dark variant instead).

## Data visualization (this is a BI product — treat charts as first-class)
- Categorical series: use `--chart-1` … `--chart-8` in order.
- Sequential/intensity (heatmaps, choropleths): use the `--ramp-0` … `--ramp-5` ramp.
- On ink pages use a cream tint for axes, gridlines, and labels; ink (`--chart-4`)
  is a data color only when a 4th+ series is needed.

## Voice (microcopy)
- Clear, precise, confident. Plain language over jargon. Product name is "Strata" (capitalized) in prose; the lowercase **wordmark** (see Typography) is the one exception.
