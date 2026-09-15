const { createHash, randomUUID } = require('node:crypto');

function checksumPayload(rows) {
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}

function ensureIngestionSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS ingestion_runs (
      run_id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
      season INTEGER,
      error_code TEXT,
      error_message TEXT
    );

    CREATE TABLE IF NOT EXISTS ingestion_snapshots (
      snapshot_id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      dataset TEXT NOT NULL,
      season INTEGER,
      dataset_version TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_updated_at TEXT,
      fetched_at TEXT NOT NULL,
      row_count INTEGER NOT NULL CHECK (row_count >= 0),
      payload_json TEXT NOT NULL,
      checksum TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0, 1)),
      created_at TEXT NOT NULL,
      FOREIGN KEY (run_id) REFERENCES ingestion_runs(run_id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS ingestion_snapshots_version_unique
      ON ingestion_snapshots(dataset, COALESCE(season, -1), dataset_version);

    CREATE UNIQUE INDEX IF NOT EXISTS ingestion_snapshots_current_unique
      ON ingestion_snapshots(dataset, COALESCE(season, -1))
      WHERE is_current = 1;

    CREATE INDEX IF NOT EXISTS ingestion_snapshots_run_idx
      ON ingestion_snapshots(run_id);

    CREATE INDEX IF NOT EXISTS ingestion_snapshots_dataset_idx
      ON ingestion_snapshots(dataset, season, created_at DESC);
  `);
}

function createIngestionStore({ database, now = () => new Date(), id = randomUUID } = {}) {
  if (!database || typeof database.prepare !== 'function') {
    throw new Error('An open SQLite database is required.');
  }

  ensureIngestionSchema(database);

  const insertRun = database.prepare(`
    INSERT INTO ingestion_runs (run_id, started_at, status, season)
    VALUES (?, ?, 'running', ?)
  `);
  const completeRun = database.prepare(`
    UPDATE ingestion_runs
    SET completed_at = ?, status = 'succeeded', error_code = NULL, error_message = NULL
    WHERE run_id = ?
  `);
  const failRun = database.prepare(`
    UPDATE ingestion_runs
    SET completed_at = ?, status = 'failed', error_code = ?, error_message = ?
    WHERE run_id = ?
  `);
  const clearCurrent = database.prepare(`
    UPDATE ingestion_snapshots
    SET is_current = 0
    WHERE dataset = ? AND COALESCE(season, -1) = COALESCE(?, -1)
  `);
  const findVersion = database.prepare(`
    SELECT snapshot_id
    FROM ingestion_snapshots
    WHERE dataset = ?
      AND COALESCE(season, -1) = COALESCE(?, -1)
      AND dataset_version = ?
  `);
  const promoteVersion = database.prepare(`
    UPDATE ingestion_snapshots SET is_current = 1 WHERE snapshot_id = ?
  `);
  const insertSnapshot = database.prepare(`
    INSERT INTO ingestion_snapshots (
      snapshot_id,
      run_id,
      dataset,
      season,
      dataset_version,
      source_url,
      source_updated_at,
      fetched_at,
      row_count,
      payload_json,
      checksum,
      is_current,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const currentSnapshot = database.prepare(`
    SELECT * FROM ingestion_snapshots
    WHERE dataset = ? AND COALESCE(season, -1) = COALESCE(?, -1) AND is_current = 1
  `);
  const runById = database.prepare('SELECT * FROM ingestion_runs WHERE run_id = ?');

  function isoNow() {
    return new Date(now()).toISOString();
  }

  function startRun({ season = null } = {}) {
    const runId = id();
    insertRun.run(runId, isoNow(), season);
    return runById.get(runId);
  }

  function recordSnapshot({ runId, descriptor, rows, source }) {
    if (!runId || !descriptor || !Array.isArray(rows) || !source) {
      throw new Error('runId, descriptor, rows, and source are required.');
    }

    return database.transaction(() => {
      const season = descriptor.season ?? null;
      const existing = findVersion.get(
        descriptor.dataset,
        season,
        String(source.datasetVersion)
      );

      clearCurrent.run(descriptor.dataset, season);

      if (existing) {
        promoteVersion.run(existing.snapshot_id);
        return currentSnapshot.get(descriptor.dataset, season);
      }

      const snapshotId = id();
      const payloadJson = JSON.stringify(rows);
      const createdAt = isoNow();
      insertSnapshot.run(
        snapshotId,
        runId,
        descriptor.dataset,
        season,
        String(source.datasetVersion),
        descriptor.url,
        source.sourceUpdatedAt || null,
        source.fetchedAt,
        rows.length,
        payloadJson,
        checksumPayload(rows),
        createdAt
      );
      return currentSnapshot.get(descriptor.dataset, season);
    })();
  }

  function markSucceeded(runId) {
    completeRun.run(isoNow(), runId);
    return runById.get(runId);
  }

  function markFailed(runId, error) {
    failRun.run(
      isoNow(),
      error?.code || 'INGESTION_FAILED',
      error?.message || 'Ingestion failed.',
      runId
    );
    return runById.get(runId);
  }

  function getCurrentSnapshot(dataset, season = null) {
    const record = currentSnapshot.get(dataset, season);
    if (!record) return null;
    return {
      ...record,
      rows: JSON.parse(record.payload_json),
    };
  }

  return Object.freeze({
    getCurrentSnapshot,
    markFailed,
    markSucceeded,
    recordSnapshot,
    startRun,
  });
}

module.exports = {
  checksumPayload,
  createIngestionStore,
  ensureIngestionSchema,
};
