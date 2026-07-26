/**
 * STRATA brand theme for Tailwind.
 * Usage: import and spread into theme.extend in tailwind.config.js
 *   const strata = require('./brand/tailwind.brand.js')
 *   module.exports = { theme: { extend: { ...strata } }, darkMode: 'class' }
 *
 * Colors map to CSS variables in brand/tokens.css so light/dark switch
 * automatically. Prefer semantic classes (bg-primary, text-foreground)
 * over raw brand-* classes in product UI.
 */
module.exports = {
  colors: {
    // semantic (theme-aware via CSS vars)
    background: 'var(--background)',
    surface: 'var(--surface)',
    'surface-2': 'var(--surface-2)',
    foreground: 'var(--foreground)',
    'muted-foreground': 'var(--muted-foreground)',
    border: 'var(--border)',
    primary: {
      DEFAULT: 'var(--primary)',
      foreground: 'var(--primary-foreground)',
    },
    accent: {
      DEFAULT: 'var(--accent)',
      foreground: 'var(--accent-foreground)',
    },
    ring: 'var(--ring)',

    // menus & overlays (ink family) — nav dropdowns, popovers
    menu: {
      DEFAULT: 'var(--menu-surface)',
      2: 'var(--menu-surface-2)',
      raised: 'var(--menu-raised)',
      foreground: 'var(--menu-foreground)',
      muted: 'var(--menu-muted-foreground)',
      border: 'var(--menu-border)',
      primary: 'var(--menu-primary)',
      'primary-foreground': 'var(--menu-primary-foreground)',
    },

    // raw brand swatches (use sparingly; e.g. marketing, illustration)
    strata: {
      rust: '#BC3908',
      'rust-deep': '#9C2A04',
      orange: '#E0641F',
      peach: '#FFC26E',
      cream: '#FFF6EA',
      ink: '#1C2B45',
      'ink-soft': '#243450',
      'ink-deep': '#14203A',
    },

    // data-viz
    chart: {
      1: '#BC3908', 2: '#E0641F', 3: '#FFC26E', 4: '#1C2B45',
      5: '#1F8A8C', 6: '#E3A23C', 7: '#5B6E8C', 8: '#9C2A04',
    },
  },
  fontFamily: {
    display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
  },
  borderRadius: {
    sm: '6px',
    DEFAULT: '10px',
    lg: '16px',
  },
};
