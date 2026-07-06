// Single source of truth for brand imagery is `brand/assets/`. Astro only serves
// files under `public/`, so this copies the brand marks/logos into
// `public/brand/assets/` and regenerates the favicons. Runs automatically before
// `dev` and `build` (see package.json), so updating `brand/assets/` is enough —
// the served copies stay in sync. The public copies are gitignored (generated).
import { cpSync, mkdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const src = new URL('brand/assets/', root);
const destDir = new URL('public/brand/assets/', root);

mkdirSync(destDir, { recursive: true });
cpSync(src, destDir, { recursive: true });

// Favicons are derived from the mark PNGs.
for (const size of [16, 32, 64]) {
  cpSync(
    new URL(`strata_mark_${size}.png`, src),
    new URL(`public/favicon-${size}.png`, root)
  );
}

console.log('✓ synced brand/assets → public/ (logos + favicons)');
