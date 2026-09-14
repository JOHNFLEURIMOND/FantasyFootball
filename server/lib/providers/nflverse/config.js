const { createSafeError } = require('../../errors');

const NFLVERSE_RELEASE_BASE_URL =
  'https://github.com/nflverse/nflverse-data/releases/download';

const DATASETS = Object.freeze({
  players: {
    releaseTag: 'players',
    filename: 'players.csv',
  },
  teams: {
    releaseTag: 'teams',
    filename: 'teams_colors_logos.csv',
  },
  rosters: {
    releaseTag: 'rosters',
    filename: season => `roster_${season}.csv`,
    minimumSeason: 1920,
  },
  schedules: {
    releaseTag: 'schedules',
    filename: 'games.csv',
    minimumSeason: 1920,
  },
  weeklyStats: {
    releaseTag: 'stats_player',
    filename: season => `stats_player_week_${season}.csv`,
    minimumSeason: 1999,
  },
  seasonalStats: {
    releaseTag: 'stats_player',
    filename: season => `stats_player_regpost_${season}.csv`,
    minimumSeason: 1999,
  },
});

function currentNflSeason(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  const year = date.getUTCFullYear();
  return date.getUTCMonth() < 2 ? year - 1 : year;
}

function normalizeSeason(value, { dataset, now = new Date() }) {
  const definition = DATASETS[dataset];

  if (!definition) {
    throw createSafeError({
      code: 'NFLVERSE_DATASET_UNSUPPORTED',
      message: 'The requested NFL dataset is not supported.',
      status: 400,
      retryable: false,
      resource: String(dataset),
    });
  }

  if (!definition.minimumSeason) {
    if (value !== undefined && value !== null) {
      throw createSafeError({
        code: 'NFLVERSE_SEASON_NOT_ALLOWED',
        message: 'This NFL dataset does not accept a season.',
        status: 400,
        retryable: false,
        resource: dataset,
      });
    }
    return null;
  }

  const season = Number(value);
  const maximumSeason = currentNflSeason(now);

  if (
    !Number.isInteger(season) ||
    season < definition.minimumSeason ||
    season > maximumSeason
  ) {
    throw createSafeError({
      code: 'NFLVERSE_SEASON_UNSUPPORTED',
      message: `Season must be between ${definition.minimumSeason} and ${maximumSeason}.`,
      status: 400,
      retryable: false,
      resource: dataset,
    });
  }

  return season;
}

function buildDatasetDescriptor(dataset, season, { now = new Date() } = {}) {
  const definition = DATASETS[dataset];
  const normalizedSeason = normalizeSeason(season, { dataset, now });
  const filename =
    typeof definition.filename === 'function'
      ? definition.filename(normalizedSeason)
      : definition.filename;

  return {
    dataset,
    season: normalizedSeason,
    releaseTag: definition.releaseTag,
    filename,
    url: `${NFLVERSE_RELEASE_BASE_URL}/${definition.releaseTag}/${filename}`,
  };
}

module.exports = {
  DATASETS,
  NFLVERSE_RELEASE_BASE_URL,
  buildDatasetDescriptor,
  currentNflSeason,
  normalizeSeason,
};
