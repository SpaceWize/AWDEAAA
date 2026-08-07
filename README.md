# AWDEA — alternate design

A second visual direction for the AWDEA site: same content and structure, built
on the coral from AWDEA's own logo rather than a blue that appears nowhere in
their branding.

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer. Then, from this folder:

```bash
npm install
npm run dev
```

That prints a local address (usually `http://localhost:5176/AWDEAAA/`). Open it in
a browser. Edits to files under `src/` appear immediately without restarting.

To produce the files a web host actually serves:

```bash
npm run build
```

The result lands in `dist/`.

## Read this before putting it on a different repo

`vite.config.ts` has a line near the top:

```js
base: '/AWDEAAA/',
```

That has to match the repository name it is served from. On GitHub Pages a
project site lives at `https://<user>.github.io/<repo>/`, and this setting is
what makes the CSS, images and video load from the right place. Put this in a
repo called `awdea-site` and it must become `base: '/awdea-site/'`. Get it wrong
and the page loads as unstyled text with no images — the most common way this
kind of site "breaks" for no apparent reason.

On a custom domain serving from the root (`https://awdea.org/`), it becomes
`base: '/'`.

## Where the content lives

Text is in the page files, in plain English, safe to edit directly:

| What | File |
|---|---|
| Home page | `src/pages/Home.tsx` |
| Team bios | `src/pages/OurTeam.tsx` |
| Donate page | `src/pages/Donate.tsx` |
| Donor list | `src/pages/Donors.tsx` |
| Header and menu | `src/components/Navigation.tsx` |
| Footer, contact details | `src/components/Footer.tsx` |
| The four "How it works" steps | `src/components/HowItWorks.tsx` |
| Colours | `src/index.css` |

Images and video are in `public/media/`. Replacing a file with one of the same
name is enough — no code change needed.

## Things worth keeping if the design changes

These aren't decoration; they are why the site works for the people AWDEA
serves.

- **Reduced motion is respected everywhere.** The drifting bubbles and the
  scroll-scrubbed video both stop completely when a visitor has "reduce motion"
  turned on in their operating system. Anyone adding new animation should follow
  the same pattern (`useReducedMotion` from framer-motion).
- **Colour contrast has been measured, not eyeballed.** Every piece of text
  clears WCAG AA against the worst case — including a bubble sitting directly
  behind it. `--color-brand-deep` in `src/index.css` exists specifically because
  the ordinary coral fails behind a bubble. If you change a colour, check it.
- **Video carries a text description.** Each clip is announced to screen readers
  as an image with a written description, not as a media player nobody can
  operate.
- **Headings are in order** (one `h1`, then `h2`, then `h3`) because screen
  reader users navigate by jumping between them.
