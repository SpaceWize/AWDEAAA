/** Shared button/link styling so every page matches. */

export const primaryButton =
  'inline-grid min-h-12 place-items-center rounded-full bg-[var(--color-brand)] px-8 text-base font-semibold text-white shadow-lg shadow-violet-900/20 transition-[background-color,transform] duration-300 hover:bg-[var(--color-brand-dark)] hover:-translate-y-0.5';

export const outlineButton =
  'inline-grid min-h-12 place-items-center rounded-full border-2 border-[var(--color-body-strong)] px-8 text-base font-semibold text-[var(--color-body-strong)] transition-[background-color,color,transform] duration-300 hover:bg-[var(--color-body-strong)] hover:text-white hover:-translate-y-0.5';

/** For use inside the dark slab, where the outline button would vanish. */
export const invertedButton =
  'inline-grid min-h-12 place-items-center rounded-full border-2 border-white/70 px-8 text-base font-semibold text-white transition-[background-color,color,transform] duration-300 hover:bg-white hover:text-[var(--color-slab)] hover:-translate-y-0.5';

export const sectionTitle =
  'text-4xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-5xl';

/** Small uppercase label. Uses the deep purple because these often sit over a
 *  drifting bubble, where the ordinary brand purple drops below 4.5:1. */
export const eyebrow =
  'text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-deep)]';
