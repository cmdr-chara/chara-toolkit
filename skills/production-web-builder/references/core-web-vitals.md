# Core Web Vitals

Use this for field-first LCP, INP, and CLS work. The thresholds below are Google's published targets at web.dev/vitals; confirm them there before quoting them in a release decision.

## Targets

Assess each metric at the 75th percentile of page loads, separately for mobile and desktop:

| Metric | Measures | Good | Poor |
| --- | --- | --- | --- |
| LCP (Largest Contentful Paint) | Loading of the main content | ≤ 2.5 s | > 4.0 s |
| INP (Interaction to Next Paint) | Responsiveness across all interactions | ≤ 200 ms | > 500 ms |
| CLS (Cumulative Layout Shift) | Visual stability | ≤ 0.1 | > 0.25 |

## Field before lab

1. **Start from field data:** the Chrome UX Report (a 28-day rolling window) or the project's real-user monitoring (RUM). The `web-vitals` library's attribution build reports which element, interaction, or shift caused the score.
2. **Pick the worst metric on the highest-traffic templates.** Fixing a metric that already passes while another one fails is wasted effort.
3. **Reproduce in the lab** (DevTools Performance panel, Lighthouse) with CPU and network throttling that matches the field population. Lab scores are a debugging aid, not the goal. Total Blocking Time is only a lab stand-in for INP.

## Diagnose by sub-part

**LCP** = server response time (TTFB) + resource load delay + resource load duration + element render delay. Find the largest of the four:

- TTFB: caching, CDN, server work, redirects.
- Load delay: the LCP resource is discovered late. Put it in the HTML, preload it, or set `fetchpriority="high"`. Never lazy-load the LCP image.
- Load duration: image size and format, responsive `srcset`, compression.
- Render delay: render-blocking CSS/JS, client-side rendering of the main content, web-font blocking.

**INP** = input delay + processing time + presentation delay:

- Input delay: long tasks already running (third-party scripts, hydration). Break them up, defer them, or yield to the main thread.
- Processing: expensive handlers. Do less work, move work off the critical path, and avoid synchronous layout thrashing.
- Presentation: large DOM updates or re-renders. Reduce render scope, virtualize long lists, and use `content-visibility` where safe.

**CLS:** reserve space for images, embeds, ads, and late-loading UI (`width`/`height`, `aspect-ratio`). Avoid inserting content above existing content. Use `font-display` with metric-compatible fallbacks, and animate with `transform` instead of layout properties.

## Verify

Change one cause at a time and confirm it in the lab with the same throttling. Then watch field data over enough time to cover the CrUX window or the RUM sample size. Report the before and after 75th-percentile values and when each was measured. Don't claim a field improvement from lab runs alone.
