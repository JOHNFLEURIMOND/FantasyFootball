# Analytics cleanup and HYPD follow-up

Baseline: main at 141d01235b14be06a852f54496a5e9c4824c442b.

## Implemented

- Validate analytics event names and field values.
- Require current explicit consent before emission; default off, no replay.
- Correct exclusive duration bucket boundaries.
- Prevent synchronous telemetry failures from breaking application actions.
- Give the public dashboard search-results live region a valid named region role.

## HYPD mobile Lighthouse observation

URL: https://fantasyfootball24.netlify.app/
Captured: 2026-09-22T21:23:40.217Z, Lighthouse 13.4.0.
These are lab observations of the deployed baseline, not the revised branch,
and not real-user measurements or evidence of analytics delivery.

| Measure | Result |
| --- | --- |
| Performance | 81/100 |
| Accessibility | 96/100 |
| Best practices | 100/100 |
| First contentful paint | 2.6 seconds |
| Largest contentful paint | 4.4 seconds |
| Unused JavaScript estimate | 57,817 bytes |
| Render-blocking savings estimate | 1,700 ms |

The failed ARIA audit identified the search-results div's unsupported aria-label.
The role correction is included in this branch. A deployed re-audit is pending.

## Follow-up opportunities

1. Consolidate font declarations in public/index.html:13 and components/index.css:5.
   Inspect actual family/weight usage before removing fonts or changing loading.
2. Check usage of the blocking animate.css include in public/index.html:10.
   Remove it only if unused, or scope the necessary animation CSS.
3. Inspect the shared 207 JavaScript chunk with a bundle analysis before selecting
   route-splitting or dependency changes. The audit estimates 56 KiB unused on
   the initial page; this does not establish that the code is unused site-wide.
4. Review the 271 KiB favicon reported by the production build for smaller icon
   variants. Preserve the current branding.
5. Implement consent UI, page-view ownership, bounded deduplication, and separate
   nonproduction destinations before enabling external collection. Validate
   network delivery and reporting independently. Personas remain hypotheses.

No ad accounts, campaign settings, spend, or production tags were changed.
