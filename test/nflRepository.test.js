const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const {
  DEFAULT_MIGRATIONS_DIRECTORY,
  openNflDatabase,
} = require('../server/lib/persistence/database');
const {
  createNflRepositories,
} = require('../server/lib/persistence/nflRepository');

const timestamp = '2026-09-10T12:00:00.000Z';

const fixtures = {
  players: {
    playerId: 'player-1',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    position: 'QB',
    teamId: 'NE',
    status: 'active',
    active: true,
  },
  teams: {
    teamId: 'NE',
    abbreviation: 'NE',
    name: 'Patriots',
    city: 'New England',
    conference: 'AFC',
    division: 'East',
    active: true,
  },
  games: {
    gameId: 'game-1',
    season: '2026',
    seasonType: 'regular',
    week: 1,
    startTime: timestamp,
    status: 'scheduled',
    homeTeamId: 'NE',
    awayTeamId: 'NYJ',
    homeScore: null,
    awayScore: null,
  },
  fantasyMatchups: {
    matchupId: 'matchup-1',
    leagueId: 'league-1',
    season: '2026',
    week: 1,
    status: 'scheduled',
    participants: [
      { rosterId: 'roster-1', points: null, projectedPoints: 101.2 },
      { rosterId: 'roster-2', points: null, projectedPoints: 99.8 },
    ],
  },
  stats: {
    statId: 'stat-1',
    playerId: 'player-1',
    teamId: 'NE',
    gameId: 'game-1',
    season: '2026',
    week: 1,
    scope: 'game',
    metrics: {
      passingYards: 312,
      interceptions: 1,
    },
  },
};

function createTemporaryDatabasePath() {
  const directory = mkdtempSync(path.join(tmpdir(), 'fantasy-football-'));
  return {
    directory,
    filename: path.join(directory, 'nfl-data.sqlite'),
  };
}

function openDatabaseInChildProcess(filename) {
  const databaseModulePath =
    require.resolve('../server/lib/persistence/database');
  const script = `
    const { openNflDatabase } = require(process.env.TEST_DATABASE_MODULE);
    const database = openNflDatabase({ filename: process.env.TEST_DB_FILENAME });
    database.close();
  `;

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', script], {
      env: {
        ...process.env,
        TEST_DATABASE_MODULE: databaseModulePath,
        TEST_DB_FILENAME: filename,
      },
    });
    let standardError = '';

    child.stderr.on('data', chunk => {
      standardError += chunk;
    });
    child.on('error', reject);
    child.on('close', exitCode => {
      if (exitCode === 0) {
        resolve();
        return;
      }
      reject(new Error(standardError || `Child exited with ${exitCode}.`));
    });
  });
}

test('database migrations are durable and idempotent', () => {
  const { directory, filename } = createTemporaryDatabasePath();

  try {
    let database = openNflDatabase({
      filename,
      now: () => Date.parse(timestamp),
    });
    assert.deepEqual(
      database
        .prepare(
          'SELECT version, name, applied_at FROM schema_migrations ORDER BY version'
        )
        .all(),
      [
        {
          version: 1,
          name: 'create_canonical_records',
          applied_at: timestamp,
        },
      ]
    );
    database.close();

    database = openNflDatabase({ filename });
    assert.equal(
      database.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()
        .count,
      1
    );
    database.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('concurrent first opens serialize database initialization', async () => {
  const { directory, filename } = createTemporaryDatabasePath();

  try {
    await Promise.all(
      Array.from({ length: 8 }, () => openDatabaseInChildProcess(filename))
    );

    const database = openNflDatabase({ filename });
    assert.equal(
      database.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()
        .count,
      1
    );
    database.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('repositories create and retrieve every canonical entity after reopen', () => {
  const { directory, filename } = createTemporaryDatabasePath();

  try {
    let database = openNflDatabase({ filename });
    let repositories = createNflRepositories({
      database,
      now: () => Date.parse(timestamp),
    });

    for (const [repositoryName, entity] of Object.entries(fixtures)) {
      assert.deepEqual(repositories[repositoryName].create(entity), entity);
    }
    database.close();

    database = openNflDatabase({ filename });
    repositories = createNflRepositories({ database });

    for (const [repositoryName, entity] of Object.entries(fixtures)) {
      const idField = Object.keys(entity).find(key => key.endsWith('Id'));
      assert.deepEqual(
        repositories[repositoryName].findById(entity[idField]),
        entity
      );
      assert.deepEqual(repositories[repositoryName].list(), [entity]);
    }
    database.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('repositories reject invalid and duplicate canonical entities safely', () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const repositories = createNflRepositories({ database });

  try {
    assert.throws(
      () =>
        repositories.players.create({
          ...fixtures.players,
          provider_player_id: 'provider-field',
        }),
      error => error.code === 'PERSISTENCE_ENTITY_INVALID'
    );

    repositories.players.create(fixtures.players);
    assert.throws(
      () => repositories.players.create(fixtures.players),
      error => error.code === 'PERSISTENCE_CONFLICT' && error.status === 409
    );
    assert.equal(repositories.players.findById('missing-player'), null);
  } finally {
    database.close();
  }
});

test('repository lists are bounded and support ID cursors', () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const repositories = createNflRepositories({ database });

  try {
    for (const playerId of ['player-1', 'player-2', 'player-3']) {
      repositories.players.create({ ...fixtures.players, playerId });
    }

    assert.deepEqual(
      repositories.players.list({ limit: 2 }).map(player => player.playerId),
      ['player-1', 'player-2']
    );
    assert.deepEqual(
      repositories.players
        .list({ limit: 2, afterId: 'player-2' })
        .map(player => player.playerId),
      ['player-3']
    );
    assert.throws(
      () => repositories.players.list({ limit: 501 }),
      error =>
        error.code === 'PERSISTENCE_QUERY_INVALID' && error.status === 400
    );
  } finally {
    database.close();
  }
});

test('repository reads reject unsupported schema versions', () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const repositories = createNflRepositories({ database });

  try {
    database
      .prepare(
        `
        INSERT INTO canonical_records (
          entity_type,
          entity_id,
          schema_version,
          payload_json,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        'player',
        fixtures.players.playerId,
        2,
        JSON.stringify(fixtures.players),
        timestamp,
        timestamp
      );

    assert.throws(
      () => repositories.players.findById(fixtures.players.playerId),
      error => error.code === 'PERSISTENCE_SCHEMA_UNSUPPORTED'
    );
  } finally {
    database.close();
  }
});

test('repository reads reject records with inconsistent identities', () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const repositories = createNflRepositories({ database });

  try {
    database
      .prepare(
        `
        INSERT INTO canonical_records (
          entity_type,
          entity_id,
          schema_version,
          payload_json,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        'player',
        'row-player',
        1,
        JSON.stringify({ ...fixtures.players, playerId: 'payload-player' }),
        timestamp,
        timestamp
      );

    assert.throws(
      () => repositories.players.findById('row-player'),
      error => error.code === 'PERSISTENCE_RECORD_INVALID'
    );
    assert.throws(
      () => repositories.players.list(),
      error => error.code === 'PERSISTENCE_RECORD_INVALID'
    );
  } finally {
    database.close();
  }
});

test('repository operations normalize closed database errors', () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const repositories = createNflRepositories({ database });
  database.close();

  assert.throws(
    () => repositories.players.findById(fixtures.players.playerId),
    error =>
      error.code === 'PERSISTENCE_UNAVAILABLE' &&
      error.status === 503 &&
      error.retryable === false
  );
});

test('migration runner rejects changed migrations that were already applied', () => {
  const { directory, filename } = createTemporaryDatabasePath();
  const migrationsDirectory = path.join(directory, 'migrations');
  const migrationPath = path.join(
    DEFAULT_MIGRATIONS_DIRECTORY,
    '001_create_canonical_records.sql'
  );

  try {
    const database = openNflDatabase({ filename });
    database.close();

    require('node:fs').mkdirSync(migrationsDirectory);
    writeFileSync(
      path.join(migrationsDirectory, '001_create_canonical_records.sql'),
      `${readFileSync(migrationPath, 'utf8')}\n-- changed\n`
    );

    assert.throws(
      () => openNflDatabase({ filename, migrationsDirectory }),
      /does not match its source file/
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('migration runner rejects databases newer than the application', () => {
  const { directory, filename } = createTemporaryDatabasePath();

  try {
    const database = openNflDatabase({ filename });
    database
      .prepare(
        `
        INSERT INTO schema_migrations (version, name, checksum, applied_at)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(2, 'future_migration', 'future-checksum', timestamp);
    database.close();

    assert.throws(
      () => openNflDatabase({ filename }),
      /Applied migration 2 does not match its source file/
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
