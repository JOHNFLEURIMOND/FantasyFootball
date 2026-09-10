# Canonical NFL Domain Contracts

The canonical NFL schemas define application-owned data shapes independently of any provider payload. They live in `server/lib/domainSchemas.js` and use Zod for runtime validation.

## Boundary Model

Data crosses the application in this order:

```text
Provider payload
  -> provider schema validation
  -> normalization
  -> canonical service contract validation
  -> API response contract validation
  -> client
```

Provider schemas in `server/lib/schemas.js` describe Sleeper payloads and allow unknown upstream fields. Canonical schemas are strict and reject unknown fields so provider-specific names cannot leak into application contracts.

Contract failures use safe errors from `server/lib/contractValidation.js`. Invalid requests return `400 INVALID_REQUEST`. Invalid internal service or API output returns a non-retryable 500 response without exposing Zod issues or provider payloads.

## Shared Rules

- Identifiers are non-empty strings.
- Seasons use four-digit strings such as `2026`.
- Weeks are integers from 0 through 30. Fantasy matchups start at week 1.
- Timestamps use ISO 8601 with a timezone offset.
- Numeric values must be finite. A missing known measurement is `null`, not `NaN` or infinity.
- Unknown object properties are rejected.
- The initial canonical schema version is `1`.

## Entities

### Player

`playerSchema` identifies a player and records display name, position, current NFL team, status, and active state. `position` and `teamId` are nullable because free agents and incomplete provider records are valid states.

### Team

`teamSchema` represents an NFL team. It includes an application ID, abbreviation, name, location and alignment fields, and active state. It does not represent a fantasy roster.

### Game

`gameSchema` represents an NFL game with season, week, kickoff time, status, teams, and nullable scores. Home and away team IDs must differ.

### Fantasy Matchup

`fantasyMatchupSchema` represents a league matchup, not an NFL game. It includes league, season, week, status, and one or two unique roster participants. A single participant supports bye-week data.

### Stat

`statSchema` represents player statistics at season, week, or game scope. Named metrics are stored in a provider-independent `metrics` record. Game-scoped stats require a `gameId`.

## Response Metadata

Canonical responses use `createCanonicalResponseSchema(dataSchema)` and include:

- `schemaVersion`: contract version, currently `1`.
- `generatedAt`: time the application produced the response.
- `provenance`: one or more provider/resource records with fetch and optional source-update timestamps.
- `cache`: optional aggregate cache status and age information.

The existing command-center response keeps its per-resource cache map and adds the shared version, generation, and provenance fields. Each provenance entry identifies a resource used in the response and preserves the original cache fetch time, including when stale data is served. This is additive for current clients.

## Versioning

Additive optional fields may remain within version `1`. Removing fields, renaming fields, changing meanings, or tightening previously valid values requires a new schema version and a migration plan for consumers and persisted snapshots.

## Validation

Run the contract-focused tests with:

```bash
node --test test/domainSchemas.test.js test/createApp.test.js
```

Run all repository checks before publishing contract changes:

```bash
npm test
npm run build
npm audit --omit=dev
git diff --check
```
