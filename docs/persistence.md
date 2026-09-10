# NFL Data Persistence

The NFL data hub uses SQLite through `better-sqlite3`. Persistence lives behind
the repository interface in `server/lib/persistence/nflRepository.js`; callers
do not read or write database rows directly.

## Storage Contract

One `canonical_records` row represents one canonical entity at this grain:

```text
entity type + canonical entity ID
```

Supported entity types are players, teams, NFL games, fantasy matchups, and
player statistics. Each row stores:

- the entity type and canonical ID;
- the canonical schema version;
- the complete canonical JSON payload;
- creation and update timestamps.

The repository validates payloads with the schemas in
`server/lib/domainSchemas.js` before writes and after reads. This keeps provider
fields and unsupported persisted schema versions from reaching API consumers.

## Repository Interface

Create repositories with `createNflRepositories({ database })`. Each entity
repository exposes:

- `create(entity)`: validate and insert one canonical entity;
- `findById(entityId)`: return one validated canonical entity or `null`;
- `list({ limit, afterId })`: return validated canonical entities ordered by ID.
  The default limit is 100 and the maximum is 500.

`create` is intentionally insert-only. Duplicate IDs return a safe
`PERSISTENCE_CONFLICT` error instead of silently replacing historical input.
Update, deletion, ingestion scheduling, and API routes are outside this
foundation.

The caller owns the database connection and closes it during application
shutdown. Repository operations normalize unavailable connections and SQLite
failures as safe `PERSISTENCE_UNAVAILABLE` errors.

## Database Configuration

`openNflDatabase()` uses `NFL_DATA_DB_PATH` when set. Otherwise it creates
`data/nfl-data.sqlite` relative to the process working directory. Local SQLite,
WAL, and shared-memory files under `data/` are ignored by Git.

File-backed databases use WAL mode. Tests can pass `filename: ':memory:'` for an
isolated in-memory database. Connections wait up to five seconds for SQLite locks
by default so concurrent application starts can serialize first-time setup.

## Migration Strategy

SQL migrations live in `server/lib/persistence/migrations` and use immutable,
ordered names such as:

```text
001_create_canonical_records.sql
```

`openNflDatabase()` applies pending migrations transactionally. The
`schema_migrations` table records each version, name, SHA-256 checksum, and
application timestamp. Startup fails when an applied migration no longer
matches its source file or when the database contains a newer migration that the
running application does not know. Migration discovery and application run in
one immediate transaction so concurrent application starts serialize schema
changes.

Entity provenance and immutable source snapshots are added by the ingestion
pipeline rather than fabricated by the repository foundation.

Never edit an applied migration. Add the next numbered migration instead. A
breaking canonical contract change also requires a new canonical schema version
and a migration that converts or deliberately retires older rows.

## Validation

Run the focused persistence tests with:

```bash
node --test test/nflRepository.test.js
```

Run all repository checks before publishing persistence changes:

```bash
npm test
npm run build
npm audit --omit=dev
git diff --check
```
