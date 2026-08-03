# Fantasy Football Command Center

Fantasy Football Command Center is an incremental modernization of the original FantasyFootball app. The first pull request establishes a Sleeper-only architecture with server-side validation, caching, normalized application models, and a browser UI that consumes only application-facing API data.

## Current Stack

- React 18
- Express 4
- Webpack 5
- Styled Components
- Sleeper API for the current integration slice
- Zod for runtime response validation
- Node.js `node:test` for deterministic unit coverage

## Local Setup

```bash
npm install
npm run dev
```

If your global npm cache has permission issues on macOS, use a workspace-local cache:

```bash
npm_config_cache="$PWD/.npm-cache" npm install
```

## Development And Production Commands

```bash
npm run dev
npm run server
npm run build
npm test
npm run prettier
npm audit --omit=dev
```

`npm run dev` starts webpack-dev-server. `npm run server` starts the Express API and static file server on port `8080` by default.

## Current Sleeper Functionality

The current vertical slice lets you:

1. Enter a Sleeper username.
2. Load that user’s leagues for the current Sleeper season.
3. Select a league.
4. Inspect normalized league data, rosters, drafts, and matchups.
5. Select a valid matchup week when one exists.
6. See loading, empty, partial-data, stale-data, and error states.

The active API surface is:

- `GET /api/health`
- `GET /api/command-center`
- `POST /api/command-center`

The browser never calls Sleeper directly. It only talks to the Express API, which then talks to a provider boundary and returns normalized command-center data.

## Architecture And Data Flow

```text
React UI
  -> application-facing API client
  -> Express API
  -> fantasy provider interface
  -> Sleeper adapter
  -> Sleeper API
```

The server boundary validates external payloads, transforms provider-specific data, normalizes domain models, and composes the browser response separately from UI rendering.

Normalized response concepts currently include:

- NFL state
- User
- League
- Roster
- Draft
- Matchup
- Command-center response
- Provider/cache metadata
- Normalized errors and warnings

## Cache And Failure Behavior

The server includes a small cache abstraction with:

- TTL-based fresh values
- Request deduplication for concurrent loads
- Bounded stale fallback when a transient provider error occurs
- Cache metadata for debugging and UI state
- No caching of validation or configuration errors

Critical failures return a safe error shape with:

- `code`
- `message`
- `retryable`
- `status`

Partial data is returned when non-critical resources fail, with normalized warnings instead of raw stack traces or provider payloads.

## Privacy-Conscious Analytics

The analytics boundary is vendor-neutral and only emits categorical or aggregate event data. It does not include usernames, league IDs, roster IDs, or raw provider payloads.

Current event categories include:

- Username lookup submitted
- Lookup succeeded or failed
- League selected
- Matchup week changed
- Cache served fresh or stale data

Allowed event context is limited to values such as outcome, error category, result count, cache status, selected week, response source, state phase, warning count, and duration bucket.

## Provider Roadmap

1. Sleeper for leagues, users, rosters, drafts, matchups, players, and NFL state.
2. TheSportsDB for optional team/player presentation enrichment.
3. SportsDataIO for optional projections and other premium data.

SportsDataIO remains planned as an optional server-side projections provider. It will be implemented behind a provider adapter, use server-only credentials, normalize projection data, and fail without preventing the Sleeper command center from operating.

## Known Limitations

- The current PR is intentionally Sleeper-only.
- The legacy SportsDataIO screens are retained only as compatibility shims where needed, but they no longer drive the main app flow.
- There is no live player-enrichment provider yet.
- The command center currently focuses on league browsing and matchup review rather than the full long-term projections suite.

## Suggested Next PR

Add a normalized player directory and league roster detail view backed by the same provider boundary, then expand week-aware matchup presentation and cached player lookup without changing the UI contract.

## Notes

- `npm test` uses deterministic fixtures and does not depend on live Sleeper availability.
- `npm audit --omit=dev` currently reports existing transitive vulnerabilities that are outside this PR’s scope.
- The app is designed to handle preseason, regular-season, postseason, and offseason states without assuming one fixed NFL phase.
