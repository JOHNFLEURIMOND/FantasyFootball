const { parseContract } = require('../../contractValidation');
const { createSafeError } = require('../../errors');
const { currentNflSeason } = require('./config');
const { createNflverseClient } = require('./client');
const {
  CURRENT_TEAM_ABBREVIATIONS,
  normalizeGame,
  normalizePlayer,
  normalizeRosterPlayer,
  normalizeStat,
  normalizeTeam,
} = require('./normalize');
const {
  gameDatasetResultSchema,
  playerDatasetResultSchema,
  playerRowSchema,
  rosterRowSchema,
  scheduleRowSchema,
  statDatasetResultSchema,
  statRowSchema,
  teamDatasetResultSchema,
  teamRowSchema,
} = require('./schemas');

function validateRows(rows, schema, dataset) {
  const result = schema.array().min(1).safeParse(rows);
  if (!result.success) {
    const error = createSafeError({
      code: 'NFLVERSE_RESPONSE_INVALID',
      message: 'The nflverse provider returned an unexpected dataset shape.',
      status: 502,
      retryable: false,
      resource: dataset,
    });
    error.cause = result.error;
    throw error;
  }
  return result.data;
}

function buildMetadata(download, counts) {
  return {
    provider: 'nflverse',
    dataset: download.descriptor.dataset,
    season: download.descriptor.season,
    releaseTag: download.descriptor.releaseTag,
    sourceUrl: download.descriptor.url,
    datasetVersion: download.source.datasetVersion,
    fetchedAt: download.source.fetchedAt,
    sourceUpdatedAt: download.source.sourceUpdatedAt,
    cache: download.cache,
    ...counts,
  };
}

function parseResult(schema, value, dataset) {
  return parseContract(schema, value, {
    code: 'NFLVERSE_NORMALIZATION_INVALID',
    message: 'The nflverse dataset could not be normalized.',
    resource: dataset,
    status: 502,
  });
}

function createNflverseProvider({
  client = createNflverseClient(),
  now = () => new Date(),
} = {}) {
  async function load({
    dataset,
    season,
    rowSchema,
    resultSchema,
    normalize,
    include = () => true,
  }) {
    const download = await client.getDataset(dataset, season);
    const rows = validateRows(download.rows, rowSchema, dataset);
    const includedRows = rows.filter(include);
    let data;
    try {
      data = includedRows.map(normalize);
    } catch (cause) {
      const error = createSafeError({
        code: 'NFLVERSE_NORMALIZATION_INVALID',
        message: 'The nflverse dataset contained an invalid value.',
        status: 502,
        retryable: false,
        resource: dataset,
      });
      error.cause = cause;
      throw error;
    }

    return parseResult(
      resultSchema,
      {
        data,
        meta: buildMetadata(download, {
          recordsReceived: rows.length,
          recordsReturned: data.length,
          recordsSkipped: rows.length - data.length,
        }),
      },
      dataset
    );
  }

  return {
    getPlayers() {
      const season = currentNflSeason(now());
      return load({
        dataset: 'players',
        rowSchema: playerRowSchema,
        resultSchema: playerDatasetResultSchema,
        normalize: row => normalizePlayer(row, season),
      });
    },
    getTeams({ currentOnly = true } = {}) {
      return load({
        dataset: 'teams',
        rowSchema: teamRowSchema,
        resultSchema: teamDatasetResultSchema,
        normalize: normalizeTeam,
        include: row =>
          !currentOnly || CURRENT_TEAM_ABBREVIATIONS.has(row.team_abbr),
      });
    },
    getRosters(season) {
      return load({
        dataset: 'rosters',
        season,
        rowSchema: rosterRowSchema,
        resultSchema: playerDatasetResultSchema,
        normalize: normalizeRosterPlayer,
        include: row => Boolean(row.gsis_id),
      });
    },
    getSchedules(season) {
      return load({
        dataset: 'schedules',
        season,
        rowSchema: scheduleRowSchema,
        resultSchema: gameDatasetResultSchema,
        normalize: normalizeGame,
        include: row => row.season === String(season),
      });
    },
    getWeeklyStats(season) {
      return load({
        dataset: 'weeklyStats',
        season,
        rowSchema: statRowSchema,
        resultSchema: statDatasetResultSchema,
        normalize: row => normalizeStat(row, 'week'),
        include: row => Boolean(row.player_id && row.player_display_name),
      });
    },
    getSeasonalStats(season) {
      return load({
        dataset: 'seasonalStats',
        season,
        rowSchema: statRowSchema,
        resultSchema: statDatasetResultSchema,
        normalize: row => normalizeStat(row, 'season'),
        include: row => Boolean(row.player_id && row.player_display_name),
      });
    },
  };
}

module.exports = { createNflverseProvider };
