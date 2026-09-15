# Analytics and Persona Discovery

## Current state

The application has a vendor-neutral analytics helper in `lib/analytics.cjs`.

Current events include:

- `command_center_load`
- `username_lookup_submitted`
- `league_selected`
- `matchup_week_changed`

The implementation sanitizes event details and buckets request duration. It does not currently include a CMP, GTM container, GA4 destination, measurement ID, browser network adapter, or production reporting integration.

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