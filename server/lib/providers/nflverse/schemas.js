const { z } = require('zod');
const {
  gameSchema,
  playerSchema,
  statSchema,
  teamSchema,
} = require('../../domainSchemas');

const requiredCsvValue = z.string().trim().min(1);
const optionalCsvValue = z.string().trim().optional().default('');

const playerRowSchema = z
  .object({
    gsis_id: requiredCsvValue,
    display_name: requiredCsvValue,
    common_first_name: optionalCsvValue,
    first_name: optionalCsvValue,
    last_name: optionalCsvValue,
    position: optionalCsvValue,
    latest_team: optionalCsvValue,
    status: optionalCsvValue,
    last_season: optionalCsvValue,
  })
  .passthrough();

const teamRowSchema = z
  .object({
    team_abbr: requiredCsvValue,
    team_name: requiredCsvValue,
    team_id: optionalCsvValue,
    team_nick: optionalCsvValue,
    team_conf: optionalCsvValue,
    team_division: optionalCsvValue,
  })
  .passthrough();

const rosterRowSchema = z
  .object({
    season: requiredCsvValue,
    team: requiredCsvValue,
    position: optionalCsvValue,
    status: optionalCsvValue,
    full_name: requiredCsvValue,
    first_name: optionalCsvValue,
    last_name: optionalCsvValue,
    gsis_id: optionalCsvValue,
  })
  .passthrough();

const scheduleRowSchema = z
  .object({
    game_id: requiredCsvValue,
    season: requiredCsvValue,
    game_type: requiredCsvValue,
    week: requiredCsvValue,
    gameday: requiredCsvValue,
    gametime: optionalCsvValue,
    away_team: requiredCsvValue,
    away_score: optionalCsvValue,
    home_team: requiredCsvValue,
    home_score: optionalCsvValue,
  })
  .passthrough();

const statRowSchema = z
  .object({
    player_id: optionalCsvValue,
    player_name: optionalCsvValue,
    player_display_name: optionalCsvValue,
    position: optionalCsvValue,
    position_group: optionalCsvValue,
    headshot_url: optionalCsvValue,
    recent_team: optionalCsvValue,
    team: optionalCsvValue,
    opponent_team: optionalCsvValue,
    game_id: optionalCsvValue,
    season: requiredCsvValue,
    week: optionalCsvValue,
    season_type: optionalCsvValue,
  })
  .passthrough();

const cacheMetaSchema = z
  .object({
    cacheStatus: z.enum(['fresh', 'stale', 'miss']),
    fromCache: z.boolean(),
    fetchedAt: z.string().datetime({ offset: true }).nullable(),
    ageMs: z.number().int().nonnegative(),
    ttlMs: z.number().int().nonnegative(),
    staleAgeMs: z.number().int().nonnegative(),
  })
  .strict();

const datasetMetadataSchema = z
  .object({
    provider: z.literal('nflverse'),
    dataset: requiredCsvValue,
    season: z.number().int().nullable(),
    releaseTag: requiredCsvValue,
    sourceUrl: z.string().url(),
    datasetVersion: requiredCsvValue,
    fetchedAt: z.string().datetime({ offset: true }),
    sourceUpdatedAt: z.string().datetime({ offset: true }).nullable(),
    cache: cacheMetaSchema,
    recordsReceived: z.number().int().nonnegative(),
    recordsReturned: z.number().int().nonnegative(),
    recordsSkipped: z.number().int().nonnegative(),
  })
  .strict();

function createDatasetResultSchema(entitySchema) {
  return z
    .object({
      data: z.array(entitySchema),
      meta: datasetMetadataSchema,
    })
    .strict();
}

module.exports = {
  datasetMetadataSchema,
  gameDatasetResultSchema: createDatasetResultSchema(gameSchema),
  playerDatasetResultSchema: createDatasetResultSchema(playerSchema),
  playerRowSchema,
  rosterRowSchema,
  scheduleRowSchema,
  statDatasetResultSchema: createDatasetResultSchema(statSchema),
  statRowSchema,
  teamDatasetResultSchema: createDatasetResultSchema(teamSchema),
  teamRowSchema,
};
