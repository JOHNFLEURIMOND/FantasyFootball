const { createHash } = require('node:crypto');
const { mkdirSync, readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');

const Database = require('better-sqlite3');

const DEFAULT_DATABASE_PATH = path.join(
  process.cwd(),
  'data',
  'nfl-data.sqlite'
);
const DEFAULT_BUSY_TIMEOUT_MS = 5000;
const DEFAULT_MIGRATIONS_DIRECTORY = path.join(__dirname, 'migrations');
const MIGRATION_FILENAME_PATTERN = /^(\d+)_([a-z0-9_]+)\.sql$/;

function readMigrations(migrationsDirectory) {
  const versions = new Set();

  return readdirSync(migrationsDirectory)
    .filter(fileName => fileName.endsWith('.sql'))
    .map(fileName => {
      const match = MIGRATION_FILENAME_PATTERN.exec(fileName);
      if (!match) {
        throw new Error(`Invalid migration filename: ${fileName}`);
      }

      const version = Number(match[1]);
      if (versions.has(version)) {
        throw new Error(`Duplicate migration version: ${version}`);
      }
      versions.add(version);

      const sql = readFileSync(
        path.join(migrationsDirectory, fileName),
        'utf8'
      );
      const checksum = createHash('sha256').update(sql).digest('hex');

      return {
        version,
        name: match[2],
        checksum,
        sql,
      };
    })
    .sort((left, right) => left.version - right.version);
}

function applyMigrations(
  database,
  {
    migrationsDirectory = DEFAULT_MIGRATIONS_DIRECTORY,
    now = () => Date.now(),
  } = {}
) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);

  const sourceMigrations = readMigrations(migrationsDirectory);
  const sourceMigrationsByVersion = new Map(
    sourceMigrations.map(migration => [migration.version, migration])
  );
  const insertMigration = database.prepare(`
    INSERT INTO schema_migrations (version, name, checksum, applied_at)
    VALUES (?, ?, ?, ?)
  `);

  database
    .transaction(() => {
      const appliedMigrations = database
        .prepare('SELECT version, name, checksum FROM schema_migrations')
        .all();
      const appliedVersions = new Set(
        appliedMigrations.map(migration => migration.version)
      );

      for (const appliedMigration of appliedMigrations) {
        const sourceMigration = sourceMigrationsByVersion.get(
          appliedMigration.version
        );
        if (
          !sourceMigration ||
          appliedMigration.name !== sourceMigration.name ||
          appliedMigration.checksum !== sourceMigration.checksum
        ) {
          throw new Error(
            `Applied migration ${appliedMigration.version} does not match its source file.`
          );
        }
      }

      const highestAppliedVersion = Math.max(0, ...appliedVersions);
      const pendingMigrations = sourceMigrations.filter(
        migration => !appliedVersions.has(migration.version)
      );

      if (
        pendingMigrations.some(
          migration => migration.version < highestAppliedVersion
        )
      ) {
        throw new Error(
          'Pending migrations cannot be inserted before an applied migration.'
        );
      }

      for (const migration of pendingMigrations) {
        database.exec(migration.sql);
        insertMigration.run(
          migration.version,
          migration.name,
          migration.checksum,
          new Date(now()).toISOString()
        );
      }
    })
    .immediate();
}

function openNflDatabase({
  filename = process.env.NFL_DATA_DB_PATH || DEFAULT_DATABASE_PATH,
  migrationsDirectory = DEFAULT_MIGRATIONS_DIRECTORY,
  now = () => Date.now(),
  busyTimeoutMs = DEFAULT_BUSY_TIMEOUT_MS,
} = {}) {
  if (!Number.isInteger(busyTimeoutMs) || busyTimeoutMs < 0) {
    throw new Error('The SQLite busy timeout must be a non-negative integer.');
  }

  if (filename !== ':memory:') {
    mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
  }

  const database = new Database(filename);

  try {
    database.pragma(`busy_timeout = ${busyTimeoutMs}`);
    database.pragma('foreign_keys = ON');
    if (filename !== ':memory:') {
      database.pragma('journal_mode = WAL');
    }
    applyMigrations(database, { migrationsDirectory, now });
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

module.exports = {
  DEFAULT_BUSY_TIMEOUT_MS,
  DEFAULT_DATABASE_PATH,
  DEFAULT_MIGRATIONS_DIRECTORY,
  applyMigrations,
  openNflDatabase,
  readMigrations,
};
