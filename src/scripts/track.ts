/**
 * Site analytics (GA4 via gtag). One delegated listener covers every tracked
 * element on the site: put `data-track="<event>"` on an element and any
 * `data-track-<param>` attributes become event params (`data-track-cta-location`
 * becomes `cta_location`). Loaded once from Base.astro.
 *
 * Event vocabulary (keep this list current when adding events):
 *
 *   generate_lead        Demo CTA click.                {cta_location}
 *   trial_cta_click      "Try it free" CTA click.       {cta_location}
 *   trial_step_view      A /try/ step scrolled into view (once per step per
 *                        page load).                    {step, step_id}
 *   trial_path_select    A /try/ tab chosen (install path, OS, modeling path).
 *                                                       {group, choice}
 *   trial_command_copy   Copy button on a /try/ command. {command, step}
 *   trial_open_app       Click on the localhost link after install. The best
 *                        proxy for "started the trial"; mark it a key event
 *                        in GA4.                        {port}
 *   trial_faq_open       A troubleshooting entry expanded.  {question}
 *   trial_docs_click     Outbound click from /try/ into the docs. {target}
 *   trial_sample_project Click on the sample project shortcut.   {cta_location}
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
