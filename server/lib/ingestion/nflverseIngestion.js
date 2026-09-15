const { createSafeError } = require('../errors');

const DATASETS = Object.freeze([
  { dataset: 'players', seasonal: false },
  { dataset: 'teams', seasonal: false },
  { dataset: 'rosters', seasonal: true },
  { dataset: 'schedules', seasonal: true },
  { dataset: 'weeklyStats', seasonal: true },
  { dataset: 'seasonalStats', seasonal: true },
]);

function normalizeSeason(value) {
  const season = Number(value);
  if (!Number.isInteger(season) || season < 1999 || season > 2100) {
    throw createSafeError({
      code: 'INGESTION_SEASON_INVALID',
      message: 'The ingestion season must be an integer from 1999 through 2100.',
      status: 400,
      retryable: false,
      resource: 'ingestion',
    });
  }
  return season;
}

function createNflverseIngestionPipeline({ client, store } = {}) {
  if (!client || typeof client.getDataset !== 'function') {
    throw new Error('An nflverse client is required.');
  }
  if (!store || typeof store.startRun !== 'function') {
    throw new Error('An ingestion store is required.');
  }

  async function ingest({ season, datasets = DATASETS.map(item => item.dataset) } = {}) {
    const normalizedSeason = normalizeSeason(season);
    const allowed = new Set(DATASETS.map(item => item.dataset));
    const requested = [...new Set(datasets)];
    const unsupported = requested.filter(dataset => !allowed.has(dataset));

    if (unsupported.length > 0) {
      throw createSafeError({
        code: 'INGESTION_DATASET_INVALID',
        message: `Unsupported ingestion dataset: ${unsupported.join(', ')}`,
        status: 400,
        retryable: false,
        resource: 'ingestion',
      });
    }

    const run = store.startRun({ season: normalizedSeason });
    const snapshots = [];

    try {
      for (const definition of DATASETS) {
        if (!requested.includes(definition.dataset)) continue;

        const download = await client.getDataset(
          definition.dataset,
          definition.seasonal ? normalizedSeason : undefined
        );
        snapshots.push(
          store.recordSnapshot({
            runId: run.run_id,
            descriptor: download.descriptor,
            rows: download.rows,
            source: download.source,
          })
        );
      }

      const completedRun = store.markSucceeded(run.run_id);
      if (typeof client.clearCache === 'function') {
        client.clearCache();
      }

      return {
        run: completedRun,
        snapshots,
      };
    } catch (error) {
      store.markFailed(run.run_id, error);
      throw error;
    }
  }

  return Object.freeze({ ingest });
}

module.exports = {
  DATASETS,
  createNflverseIngestionPipeline,
  normalizeSeason,
};
