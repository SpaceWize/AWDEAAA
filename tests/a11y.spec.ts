import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/', '/gallery', '/bios', '/donate', '/donors', '/account']
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 375, height: 812 },
]
const MOTION = ['normal', 'reduce'] as const
const url = (r: string) => `/AWDEAAA${r === '/' ? '/' : r}`

// Scroll through the page so scroll-reveal animations fire, return to top, then
// let entrance animations settle before scanning.
async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight / 2)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 80))
    }
    scrollTo(0, 0)
  })
  await page.waitForTimeout(1500)
}

for (const motion of MOTION) {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} / ${motion} motion`, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference',
      })

      for (const route of ROUTES) {
        test(`axe WCAG 2.2 AA: ${route}`, async ({ page }) => {
          await page.goto(url(route))
          await settle(page)
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze()
          // axe cannot compute contrast over blurred gradients and reports those as
          // "incomplete" (needs manual review), not violations. Log, don't fail.
          for (const inc of results.incomplete) {
            console.log(`[incomplete] ${route} ${vp.name}/${motion} ${inc.id}: ${inc.nodes.length} node(s)`)
          }
          const summary = results.violations.map(
            (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
          )
          expect(summary, `axe violations on ${route}`).toEqual([])
        })
      }
    })
  }
}

test.describe('structure checks', () => {
  for (const route of ROUTES) {
    test(`headings, images, skip link: ${route}`, async ({ page }) => {
      await page.goto(url(route))
      await settle(page)

      const h1s = await page.locator('h1').count()
      expect(h1s, 'exactly one h1').toBe(1)

      const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (hs) => hs.map((h) => +h.tagName[1]))
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1], `heading order ${levels.join(',')}`).toBeLessThanOrEqual(1)
      }

      const noAlt = await page.$$eval('img:not([alt])', (imgs) => imgs.map((i) => i.outerHTML.slice(0, 120)))
      expect(noAlt, 'imgs without alt attribute').toEqual([])

      await page.keyboard.press('Tab')
      const first = await page.evaluate(() => {
        const a = document.activeElement as HTMLAnchorElement | null
        return { tag: a?.tagName, href: a?.getAttribute('href'), text: a?.textContent?.trim().toLowerCase() }
      })
      expect(first.tag).toBe('A')
      expect(first.text).toContain('skip')
      expect(first.href?.startsWith('#')).toBe(true)
    })

    test(`no horizontal scroll at 320px: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 })
      await page.goto(url(route))
      await settle(page)
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }))
      expect(m.sw).toBeLessThanOrEqual(m.cw)
    })
  }

  test('reduced motion: hero bubbles do not move', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto(url('/'))
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    const read = () => page.$$eval('.bubble-layer > div', (els) => els.map((e) => getComputedStyle(e).transform))
    const before = await read()
    expect(before.length, 'bubbles exist').toBeGreaterThan(0)
    await page.waitForTimeout(1500)
    expect(await read()).toEqual(before)
    await ctx.close()
  })
})
