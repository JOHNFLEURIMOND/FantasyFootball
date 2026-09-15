CREATE TABLE ingestion_runs (
  run_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  season INTEGER,
  error_code TEXT,
  error_message TEXT
);

CREATE TABLE ingestion_snapshots (
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

CREATE UNIQUE INDEX ingestion_snapshots_version_unique
  ON ingestion_snapshots(dataset, COALESCE(season, -1), dataset_version);

CREATE UNIQUE INDEX ingestion_snapshots_current_unique
  ON ingestion_snapshots(dataset, COALESCE(season, -1))
  WHERE is_current = 1;

CREATE INDEX ingestion_snapshots_run_idx ON ingestion_snapshots(run_id);
CREATE INDEX ingestion_snapshots_dataset_idx
  ON ingestion_snapshots(dataset, season, created_at DESC);
