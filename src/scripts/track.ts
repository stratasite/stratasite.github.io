/**
 * Site analytics (GA4 via gtag). One delegated listener covers every tracked
 * element on the site: put `data-track="<event>"` on an element and any
 * `data-track-<param>` attributes become event params (`data-track-cta-location`
 * becomes `cta_location`). Loaded once from Base.astro.
 *
 * Event vocabulary (keep this list current when adding events):
 *
 *   generate_lead        "Book a call" click (pricing page only). {cta_location}
 *   trial_cta_click      "Start 14-day trial" click, out to the app signup.
 *                        Mark it a key event in GA4.    {cta_location, plan?}
 *   pricing_cta_click    "See pricing" secondary CTA.   {cta_location}
 *   pricing_plan_select  An edition card chosen on /pricing/. {plan}
 *   zerosql_click        Outbound click to 0sql.io (site, docs or repository),
 *                        the open source server.      {cta_location, target}
 *   video_open           The full walkthrough lightbox opened from the home
 *                        hero (clip or button).        {cta_location}
 *   video_progress       Watch depth on the walkthrough, once per milestone
 *                        per play.                     {video, percent}
 */

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params: Params = {}): void {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/** `trackCtaLocation` -> `cta_location` */
function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Read every `data-track-*` attribute on an element as event params. */
export function paramsFrom(el: HTMLElement): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(el.dataset)) {
    if (k === 'track' || !k.startsWith('track') || v === undefined || v === '') continue;
    out[toSnake(k.slice('track'.length)).replace(/^_/, '')] = v;
  }
  return out;
}

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
  if (!el || !el.dataset.track) return;
  track(el.dataset.track, paramsFrom(el));
});
