# Analytics and Persona Discovery

## Current state

The application has a vendor-neutral analytics helper in `lib/analytics.cjs`.

Current events include:

- `command_center_load`
- `username_lookup_submitted`
- `league_selected`
- `matchup_week_changed`

The implementation validates event names and field values, buckets request duration, and defaults emission to disabled until a caller supplies a current consent getter. It does not currently include a CMP, GTM container, GA4 destination, measurement ID, browser network adapter, or production reporting integration.

## Event contract

Analytics events must:

- Use lowercase `snake_case` names.
- Include only bounded, allowlisted parameters.
- Exclude usernames, league IDs, raw queries, URLs with query strings, provider payloads, cookies, and free-form text.
- Use coarse duration buckets instead of raw timing values.
- Emit only after the approved consent state.
- Deduplicate repeated events using a stable event key.

Reserved future event:

- `page_view`: one event per initial load or actual SPA route change.

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

Deduplication, consent UI/persistence, environment-specific destinations,
route instrumentation, browser delivery, and reporting are still unimplemented.
This helper does not enable production analytics or validate user personas.
