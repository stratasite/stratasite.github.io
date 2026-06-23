# Strata — Brand Rules

Strata is a business-intelligence platform. The identity is a stacked "data
horizon": warm rust/peach strata with a cool ink trend line. Apply it
consistently in all UI, marketing, and generated assets.

## Source of truth — never hardcode colors
- All colors live in `brand/tokens.css` (CSS variables) and `brand/tailwind.brand.js`.
- ALWAYS reference tokens: `var(--primary)`, `bg-primary`, `text-foreground`, `--chart-1`…
- NEVER paste raw hex (e.g. `#BC3908`) into a component. If a needed color is
  missing, add it to `brand/tokens.css` first, then reference it.
- Light/dark are handled by the `.dark` class on `<html>`; don't fork colors per theme in components.

## Palette
- Primary: rust `--strata-rust` (#BC3908). Deepest: `--strata-rust-deep` (#9C2A04).
- Warm layers: orange `--strata-orange` (#E0641F), peach `--strata-peach` (#FFC26E).
- Light field: cream `--strata-cream` (#FFF6EA).
- Cool accent (text, lines, emphasis): ink `--strata-ink` (#1C2B45).

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
- Keep ink (`--strata-ink`) for axes, gridlines, and labels — not as a data color
  unless a 4th+ series is needed.

## Voice (microcopy)
- Clear, precise, confident. Plain language over jargon. Lowercase product name in prose: "strata".
