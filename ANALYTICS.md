# Analytics and Persona Discovery

## Current state

The application has a vendor-neutral analytics helper in `lib/analytics.cjs`.

Current events include:

- `command_center_load`
- `username_lookup_submitted`
- `league_selected`
- `matchup_week_changed`

The vendor-neutral helper validates event names and field values, buckets request duration, and defaults emission to disabled until a caller supplies a current consent getter. The browser adapter and dedicated Google configuration are described below; production delivery and reporting require deployment and browser verification.

## Event contract

Analytics events must:

- Use lowercase `snake_case` names.
- Include only bounded, allowlisted parameters.
- Exclude usernames, league IDs, raw queries, URLs with query strings, provider payloads, cookies, and free-form text.
- Use coarse duration buckets instead of raw timing values.
- Emit only after the approved consent state.
- Deduplicate repeated events using a stable event key.

The separate browser adapter sends a sanitized `ff_page_view` data-layer event on the initial consented route and each actual SPA pathname change. The vendor-neutral helper continues to reject `page_view`.

## Validation requirements

Before adding an external destination, verify:

1. Denied consent sends no events.
2. Granted consent sends one approved event.
3. Unknown event names are rejected.
4. Unapproved fields are removed.
5. Repeated events are deduplicated.
6. Route parameters and query strings never enter payloads.
7. Development and test traffic cannot reach production analytics.
8. Browser network requests and destination reporting are verified.

## Persona research protocol

Recruit 5–8 adult fantasy-football users across beginner, casual, and experienced segments.

Test these tasks:

1. Find a player or team fact.
2. Compare two players.
3. Review a weekly projection or schedule.
4. Explain what would make the result trustworthy.

Record:

- Task success
- Time on task
- Wrong turns
- Terminology
- Confidence
- Unresolved questions

Do not collect real Sleeper usernames, league IDs, emails, or other personal identifiers.

Treat personas as hypotheses until repeated behavior and goals are validated through research.

## Known gaps

Production analytics delivery, consent behavior, GTM configuration, GA4 reporting, attribution, and regional privacy behavior remain unvalidated.

## Implemented helper behavior

`createAnalyticsTracker({ sink, getConsent })` reads `getConsent()` on each
call. Only boolean `true` permits emission. Missing, denied, unknown, revoked,
or failing consent checks return `null`. No events are queued or replayed.
Existing callers provide no consent getter and therefore remain disabled.
The getter must read a real consent decision; do not hardcode approval in production.

Only the four current event names above are accepted. `page_view` remains
reserved and is rejected until route instrumentation is implemented.
`buildAnalyticsEvent` is a pure builder, not a delivery API; use the tracker
for consent-gated delivery. Invalid event names return `null`.

Allowed values:
- `outcome`: success, partial, failure.
- `cacheStatus`: fresh, stale, miss.
- `errorCategory`: the fixed application error-code vocabulary in `lib/analytics.cjs`.
- `resultCount`: integer 0–10000; `warningCount`: integer 0–1000.
- `selectedWeek`: integer 0–22.
- `durationBucket`: lt100ms, lt250ms, lt500ms, lt1s, lt2500ms, gte2500ms, unknown.

Unsupported fields, objects, arrays, free text, and out-of-range values are
omitted. Unused `responseSource` and `statePhase` fields are no longer accepted;
add a documented fixed vocabulary and tests before introducing callers.
Duration upper bounds are exclusive. Sink exceptions return `null` so optional
telemetry cannot break application actions. Sinks must be synchronous adapters.

The vendor-neutral helper alone does not enable Google delivery or validate user personas.
The separate browser adapter below adds consent controls and route instrumentation.
Live delivery and reporting still require the release acceptance checks below.

## FantasyFootball GTM delivery (activation required)

The branch provides optional analytics controls and a basic-consent GTM loader.
No Google script is loaded before opt-in. Denied events are discarded. Withdrawal
sets the GA disable flag, updates consent, and reloads to unload tag listeners.
The preference is stored as `ff.analytics.consent.v1` in localStorage with a
sessionStorage denial fallback. Withdrawal reloads only after the denial is saved;
otherwise the current page keeps measurement disabled. If both stores refuse writes,
a later manually initiated reload may restore an older saved grant. Browser storage
restrictions must be included in release QA.

Build-time Netlify production variables, defined in `netlify.toml` (public identifiers, not secrets):
- `GTM_CONTAINER_ID`: `GTM-W899JSKK` (container `265040186`).
- `GA4_MEASUREMENT_ID`: `G-QPJEV5XHES` (property `555573537`, stream `15834443603`).
- `ANALYTICS_HOSTNAME`: `fantasyfootball24.netlify.app`.

The dedicated GTM container is published at version 3 with a Google Tag, one
`page_view` event tag, the `ff_page_view` trigger, and four data-layer variables.
Publishing the container alone does not enable the site's loader. The GA4 stream
has Enhanced Measurement disabled. Browser delivery and GA4 receipt remain unverified.

Missing identifiers disable the integration. Preview hosts cannot send production
analytics, even when they inherit these environment variables.

### Required GTM configuration before activation

1. Create/use a dedicated FantasyFootball GA4 property/web stream and GTM web
   container; do not reuse Earthquake, Pokemon, or Fleurimond destinations.
2. Google Tag: the dedicated measurement ID, Initialization trigger,
   `send_page_view=false`. Disable automatic enhanced measurement for this stream
   so automatic/history-based collection does not duplicate the app contract.
3. Custom Event trigger: exact `ff_page_view`.
4. GA4 Event tag: event name `page_view`, dedicated destination. Map data-layer
   variables `page_type`, `page_location`, `page_title`, and `page_referrer`.
   Each event sets all four values. Use built-in analytics consent checks and
   require `analytics_storage` for the event tag.
5. Do not add Custom HTML, advertising tags, connected destinations, or automatic
   click/form/search collection. Keep ad consent denied.
6. Register `page_type` as an event-scoped custom dimension if reporting needs it.

`ff_page_view` emits on the initial consented route and each pathname transition.
Repeated renders do not re-emit. Player profiles and team rosters use fixed page
categories; URLs, queries, hashes, player IDs, and search text are not forwarded.
Player/team visits are page views; click and search-success events are not yet
implemented and must not be inferred from these events.

### Release acceptance

Run `node --test test/browserAnalytics.test.js`, `npm test`, `npm run lint`, and
`npm run build`. Before activation, validate the configured production build with Tag Assistant
in a controlled deployment to verify deny, grant, navigation, back/forward, reload, and
withdrawal. Verify one GA4 collect request per expected page_view, correct `tid`,
no automatic duplicate, and receipt in DebugView. Production hostname restrictions
must remain intact. Confirm no requests after withdrawal/reload and no production
requests from Netlify previews. These browser/vendor checks are required and are
not proven by unit tests. Publishing GTM and deploying configured production code
are separate release steps.
