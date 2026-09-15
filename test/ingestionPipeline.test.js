const test = require('node:test');
const assert = require('node:assert/strict');

const { openNflDatabase } = require('../server/lib/persistence/database');
const {
  createIngestionStore,
} = require('../server/lib/persistence/ingestionStore');
const {
  createNflverseIngestionPipeline,
} = require('../server/lib/ingestion/nflverseIngestion');

function createClient({ version = 'v1', failDataset = null } = {}) {
  let clearCount = 0;
  return {
    async getDataset(dataset, season) {
      if (dataset === failDataset) {
        const error = new Error('provider failed');
        error.code = 'UPSTREAM_UNAVAILABLE';
        throw error;
      }
      return {
        descriptor: {
          dataset,
          season: season ?? null,
          releaseTag: 'test',
          url: `https://example.test/${dataset}.csv`,
        },
        rows: [{ id: `${dataset}-1`, season: season ?? null }],
        source: {
          datasetVersion: version,
          fetchedAt: '2026-09-14T12:00:00.000Z',
          sourceUpdatedAt: '2026-09-14T11:00:00.000Z',
        },
      };
    },
    clearCache() {
      clearCount += 1;
    },
    get clearCount() {
      return clearCount;
    },
  };
}

function createStore(database) {
  let idCounter = 0;
  return createIngestionStore({
    database,
    now: () => new Date('2026-09-14T12:30:00.000Z'),
    id: () => `id-${++idCounter}`,
  });
}

test('ingestion stores versioned snapshots and invalidates provider cache after success', async () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const store = createStore(database);
  const client = createClient();
  const pipeline = createNflverseIngestionPipeline({ client, store });

  try {
    const result = await pipeline.ingest({
      season: 2026,
      datasets: ['players', 'schedules'],
    });

    assert.equal(result.run.status, 'succeeded');
    assert.equal(result.snapshots.length, 2);
    assert.equal(client.clearCount, 1);
    assert.deepEqual(store.getCurrentSnapshot('players').rows, [
      { id: 'players-1', season: null },
    ]);
    assert.deepEqual(store.getCurrentSnapshot('schedules', 2026).rows, [
      { id: 'schedules-1', season: 2026 },
    ]);
  } finally {
    database.close();
  }
});

test('ingestion is idempotent for the same dataset version', async () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const store = createStore(database);
  const client = createClient({ version: 'same-version' });
  const pipeline = createNflverseIngestionPipeline({ client, store });

  try {
    await pipeline.ingest({ season: 2026, datasets: ['schedules'] });
    await pipeline.ingest({ season: 2026, datasets: ['schedules'] });

    const count = database
      .prepare('SELECT COUNT(*) AS count FROM ingestion_snapshots')
      .get().count;
    assert.equal(count, 1);
    assert.equal(
      database
        .prepare('SELECT COUNT(*) AS count FROM ingestion_runs WHERE status = ?')
        .get('succeeded').count,
      2
    );
  } finally {
    database.close();
  }
});

test('ingestion retains prior snapshot history when a new version arrives', async () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const store = createStore(database);

  try {
    await createNflverseIngestionPipeline({
      client: createClient({ version: 'v1' }),
      store,
    }).ingest({ season: 2026, datasets: ['schedules'] });

    await createNflverseIngestionPipeline({
      client: createClient({ version: 'v2' }),
      store,
    }).ingest({ season: 2026, datasets: ['schedules'] });

    const rows = database
      .prepare(
        'SELECT dataset_version, is_current FROM ingestion_snapshots ORDER BY dataset_version'
      )
      .all();
    assert.deepEqual(rows, [
      { dataset_version: 'v1', is_current: 0 },
      { dataset_version: 'v2', is_current: 1 },
    ]);
  } finally {
    database.close();
  }
});

test('ingestion records actionable failed run status and does not clear cache', async () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const store = createStore(database);
  const client = createClient({ failDataset: 'schedules' });
  const pipeline = createNflverseIngestionPipeline({ client, store });

  try {
    await assert.rejects(
      () => pipeline.ingest({ season: 2026, datasets: ['schedules'] }),
      /provider failed/
    );
    const run = database.prepare('SELECT * FROM ingestion_runs').get();
    assert.equal(run.status, 'failed');
    assert.equal(run.error_code, 'UPSTREAM_UNAVAILABLE');
    assert.equal(client.clearCount, 0);
  } finally {
    database.close();
  }
});

test('ingestion rejects unsupported seasons and datasets before creating a run', async () => {
  const database = openNflDatabase({ filename: ':memory:' });
  const store = createStore(database);
  const pipeline = createNflverseIngestionPipeline({
    client: createClient(),
    store,
  });

  try {
    await assert.rejects(
      () => pipeline.ingest({ season: 1900 }),
      error => error.code === 'INGESTION_SEASON_INVALID'
    );
    await assert.rejects(
      () => pipeline.ingest({ season: 2026, datasets: ['unknown'] }),
      error => error.code === 'INGESTION_DATASET_INVALID'
    );
    assert.equal(
      database.prepare('SELECT COUNT(*) AS count FROM ingestion_runs').get().count,
      0
    );
  } finally {
    database.close();
  }
});
