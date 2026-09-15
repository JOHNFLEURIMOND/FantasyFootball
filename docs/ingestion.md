# nflverse Ingestion Pipeline

The ingestion pipeline downloads nflverse datasets through the existing server-side client and stores versioned local snapshots in SQLite.

## Run locally

```bash
npm run ingest:nflverse -- 2026
```

To ingest a subset of datasets:

```bash
npm run ingest:nflverse -- 2026 players,teams,schedules
```

Supported datasets are `players`, `teams`, `rosters`, `schedules`, `weeklyStats`, and `seasonalStats`.

## Snapshot behavior

Each ingestion run is recorded in `ingestion_runs` with `running`, `succeeded`, or `failed` status. Failures retain a normalized error code and message for diagnostics.

Snapshots are stored in `ingestion_snapshots` with:

- dataset and optional season
- provider dataset version
- source URL and source update timestamp
- fetch timestamp
- row count and payload checksum
- raw parsed CSV rows serialized as JSON
- a single `is_current` snapshot per dataset/season

Re-ingesting the same dataset version is idempotent: the existing snapshot is promoted to current instead of inserting a duplicate. When a new version arrives, the old snapshot remains queryable as history and the new version becomes current.

The store exposes `getCurrentSnapshot()` and bounded `listSnapshots()` queries for current state and lineage.

## Cache invalidation

The nflverse client cache is cleared only after an ingestion run succeeds. Failed runs leave the existing cache and current snapshots intact so transient upstream failures do not discard usable local data.

## Persistence

Ingestion tables are initialized idempotently by `createIngestionStore()` in the same SQLite database configured by `NFL_DATA_DB_PATH`. The canonical entity migration chain remains unchanged so existing migration checksums and schema-version compatibility are preserved.
