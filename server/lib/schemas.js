const { z } = require('zod');

const sleeperNflStateSchema = z
  .object({
    week: z.number().int().nonnegative(),
    season_type: z.string(),
    season_start_date: z.string().optional().nullable(),
    season: z.union([z.string(), z.number()]).transform(value => String(value)),
    previous_season: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform(value =>
        value === null || value === undefined ? null : String(value)
      ),
    leg: z.number().int().nonnegative().optional(),
    league_season: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform(value =>
        value === null || value === undefined ? null : String(value)
      ),
    league_create_season: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform(value =>
        value === null || value === undefined ? null : String(value)
      ),
    display_week: z.number().int().nonnegative().optional().nullable(),
  })
  .passthrough();

const sleeperUserSchema = z
  .object({
    user_id: z.string(),
    username: z.string(),
    display_name: z.string(),
    avatar: z.string().optional().nullable(),
    metadata: z
      .object({
        team_name: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

const sleeperLeagueSchema = z
  .object({
    total_rosters: z.number().int().nonnegative(),
    status: z.string(),
    sport: z.string(),
    settings: z.record(z.any()).optional(),
    season_type: z.string(),
    season: z.union([z.string(), z.number()]).transform(value => String(value)),
    scoring_settings: z.record(z.any()).optional(),
    roster_positions: z.array(z.string()).optional(),
    previous_league_id: z.string().optional().nullable(),
    name: z.string(),
    league_id: z.string(),
    draft_id: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
  })
  .passthrough();

const sleeperRosterSchema = z
  .object({
    starters: z.array(z.union([z.string(), z.number()])).optional(),
    reserve: z.array(z.union([z.string(), z.number()])).optional(),
    players: z.array(z.union([z.string(), z.number()])).optional(),
    roster_id: z.union([z.string(), z.number()]),
    owner_id: z.union([z.string(), z.number()]).optional().nullable(),
    league_id: z.union([z.string(), z.number()]).optional().nullable(),
    settings: z.record(z.any()).optional(),
  })
  .passthrough();

const sleeperDraftSchema = z
  .object({
    draft_id: z.string(),
    type: z.string(),
    status: z.string(),
    sport: z.string(),
    start_time: z.number().int().nonnegative().optional().nullable(),
    settings: z.record(z.any()).optional(),
    season_type: z.string(),
    season: z.union([z.string(), z.number()]).transform(value => String(value)),
    metadata: z.record(z.any()).optional(),
    league_id: z.string().optional().nullable(),
    last_picked: z.number().int().nonnegative().optional().nullable(),
    draft_order: z
      .record(z.union([z.number(), z.string()]))
      .optional()
      .nullable(),
    slot_to_roster_id: z
      .record(z.union([z.number(), z.string()]))
      .optional()
      .nullable(),
    creators: z.record(z.any()).optional().nullable(),
  })
  .passthrough();

const sleeperMatchupSchema = z
  .object({
    roster_id: z.union([z.string(), z.number()]),
    matchup_id: z.union([z.string(), z.number()]),
    players: z.array(z.union([z.string(), z.number()])).optional(),
    starters: z.array(z.union([z.string(), z.number()])).optional(),
    points: z.number().optional(),
    custom_points: z.number().nullable().optional(),
  })
  .passthrough();

function parseOptionalRequestInteger(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();
  return /^\d+$/.test(normalizedValue) ? Number(normalizedValue) : value;
}

const sleeperRequestSchema = z.object({
  username: z.string().trim().min(1).optional(),
  leagueId: z.string().trim().min(1).optional(),
  season: z.preprocess(
    parseOptionalRequestInteger,
    z.number().int().min(2000).max(2100).optional()
  ),
  week: z.preprocess(
    parseOptionalRequestInteger,
    z.number().int().min(0).max(30).optional()
  ),
});

module.exports = {
  sleeperDraftSchema,
  sleeperLeagueSchema,
  sleeperMatchupSchema,
  sleeperNflStateSchema,
  sleeperRequestSchema,
  sleeperRosterSchema,
  sleeperUserSchema,
};
