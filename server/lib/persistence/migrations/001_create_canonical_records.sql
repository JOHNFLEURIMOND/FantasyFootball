CREATE TABLE canonical_records (
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('player', 'team', 'game', 'fantasy_matchup', 'stat')
  ),
  entity_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version > 0),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (entity_type, entity_id)
) WITHOUT ROWID;

CREATE INDEX canonical_records_by_type_and_updated_at
  ON canonical_records (entity_type, updated_at, entity_id);