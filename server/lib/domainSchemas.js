const { z } = require('zod');

const CANONICAL_SCHEMA_VERSION = 1;

const identifierSchema = z.string().trim().min(1);
const seasonSchema = z.string().regex(/^\d{4}$/);
const timestampSchema = z.string().datetime({ offset: true });
const nullableNumberSchema = z.number().finite().nullable();

const cacheMetadataSchema = z
  .object({
    status: z.enum(['fresh', 'stale', 'miss']),
    ageMs: z.number().int().nonnegative(),
    staleAgeMs: z.number().int().nonnegative(),
  })
  .strict();

const provenanceSchema = z
  .object({
    provider: identifierSchema,
    resource: identifierSchema,
    sourceRecordId: identifierSchema.nullable(),
    fetchedAt: timestampSchema,
    sourceUpdatedAt: timestampSchema.nullable(),
  })
  .strict();

const responseMetadataSchema = z
  .object({
    schemaVersion: z.literal(CANONICAL_SCHEMA_VERSION),
    generatedAt: timestampSchema,
    provenance: z.array(provenanceSchema).min(1),
    cache: cacheMetadataSchema.optional(),
  })
  .strict();

const resourceCacheMetadataSchema = z
  .object({
    cacheStatus: z.enum(['fresh', 'stale', 'miss']).optional(),
    fromCache: z.boolean().optional(),
    fetchedAt: timestampSchema.nullable().optional(),
    ageMs: z.number().int().nonnegative().optional(),
    ttlMs: z.number().int().nonnegative().optional(),
    staleAgeMs: z.number().int().nonnegative().optional(),
  })
  .strict();

const playerSchema = z
  .object({
    playerId: identifierSchema,
    firstName: z.string(),
    lastName: z.string(),
    displayName: identifierSchema,
    position: identifierSchema.nullable(),
    teamId: identifierSchema.nullable(),
    status: identifierSchema,
    active: z.boolean(),
  })
  .strict();

const teamSchema = z
  .object({
    teamId: identifierSchema,
    abbreviation: identifierSchema,
    name: identifierSchema,
    city: z.string().nullable(),
    conference: z.string().nullable(),
    division: z.string().nullable(),
    active: z.boolean(),
  })
  .strict();

const gameSchema = z
  .object({
    gameId: identifierSchema,
    season: seasonSchema,
    seasonType: identifierSchema,
    week: z.number().int().min(0).max(30),
    startTime: timestampSchema,
    status: identifierSchema,
    homeTeamId: identifierSchema,
    awayTeamId: identifierSchema,
    homeScore: nullableNumberSchema,
    awayScore: nullableNumberSchema,
  })
  .strict()
  .refine(game => game.homeTeamId !== game.awayTeamId, {
    message: 'Home and away teams must be different.',
    path: ['awayTeamId'],
  });

const fantasyMatchupParticipantSchema = z
  .object({
    rosterId: identifierSchema,
    points: nullableNumberSchema,
    projectedPoints: nullableNumberSchema,
  })
  .strict();

const fantasyMatchupSchema = z
  .object({
    matchupId: identifierSchema,
    leagueId: identifierSchema,
    season: seasonSchema,
    week: z.number().int().min(1).max(30),
    status: identifierSchema,
    participants: z.array(fantasyMatchupParticipantSchema).min(1).max(2),
  })
  .strict()
  .refine(
    matchup =>
      new Set(matchup.participants.map(participant => participant.rosterId))
        .size === matchup.participants.length,
    {
      message: 'Matchup participants must have unique roster IDs.',
      path: ['participants'],
    }
  );

const statSchema = z
  .object({
    statId: identifierSchema,
    playerId: identifierSchema,
    teamId: identifierSchema.nullable(),
    gameId: identifierSchema.nullable(),
    season: seasonSchema,
    week: z.number().int().min(0).max(30),
    scope: z.enum(['season', 'week', 'game']),
    metrics: z.record(z.string().min(1), nullableNumberSchema),
  })
  .strict()
  .refine(stat => stat.scope !== 'game' || stat.gameId !== null, {
    message: 'Game-scoped stats require a game ID.',
    path: ['gameId'],
  });

const commandCenterNflStateSchema = z
  .object({
    season: seasonSchema,
    seasonType: identifierSchema,
    seasonStartDate: z.string().nullable(),
    previousSeason: seasonSchema.nullable(),
    week: z.number().int().nonnegative(),
    displayWeek: z.number().int().nonnegative(),
    currentWeek: z.number().int().nonnegative(),
    leagueSeason: seasonSchema,
    leagueCreateSeason: seasonSchema.nullable(),
  })
  .strict();

const commandCenterUserSchema = z
  .object({
    userId: identifierSchema,
    username: identifierSchema,
    displayName: identifierSchema,
    avatarUrl: z.string().url().nullable(),
    teamName: z.string().nullable(),
    isOwner: z.boolean(),
  })
  .strict();

const commandCenterLeagueSchema = z
  .object({
    leagueId: identifierSchema,
    name: identifierSchema,
    status: identifierSchema,
    sport: identifierSchema,
    season: seasonSchema,
    seasonType: identifierSchema,
    totalRosters: z.number().int().nonnegative(),
    rosterPositions: z.array(z.string()),
    settings: z.record(z.string(), z.unknown()),
    scoringSettings: z.record(z.string(), z.unknown()),
    previousLeagueId: identifierSchema.nullable(),
    draftId: identifierSchema.nullable(),
    avatarUrl: z.string().url().nullable(),
  })
  .strict();

const commandCenterRosterSchema = z
  .object({
    rosterId: identifierSchema,
    ownerId: identifierSchema.nullable(),
    ownerDisplayName: z.string().nullable(),
    ownerTeamName: z.string().nullable(),
    starters: z.array(identifierSchema),
    reserve: z.array(identifierSchema),
    players: z.array(identifierSchema),
    wins: z.number().nonnegative(),
    losses: z.number().nonnegative(),
    ties: z.number().nonnegative(),
    pointsFor: z.number().finite(),
    pointsAgainst: z.number().finite(),
    waiverPosition: z.number().nullable(),
    totalMoves: z.number().nonnegative(),
    settings: z.record(z.string(), z.unknown()),
  })
  .strict();

const commandCenterDraftSchema = z
  .object({
    draftId: identifierSchema,
    leagueId: identifierSchema.nullable(),
    type: identifierSchema,
    status: identifierSchema,
    sport: identifierSchema,
    startTime: z.number().int().nonnegative().nullable(),
    settings: z.record(z.string(), z.unknown()),
    season: seasonSchema,
    seasonType: identifierSchema,
    metadata: z.record(z.string(), z.unknown()),
  })
  .strict();

const commandCenterMatchupSchema = z
  .object({
    rosterId: identifierSchema,
    matchupId: identifierSchema,
    points: nullableNumberSchema,
    customPoints: nullableNumberSchema,
    starters: z.array(identifierSchema),
    players: z.array(identifierSchema),
    bench: z.array(identifierSchema),
    opponentRosterId: identifierSchema.nullable(),
  })
  .strict();

const commandCenterWarningSchema = z
  .object({
    code: identifierSchema,
    message: identifierSchema,
    retryable: z.boolean(),
    resource: identifierSchema,
  })
  .strict();

const commandCenterMetadataSchema = responseMetadataSchema.extend({
  cache: z.record(z.string(), resourceCacheMetadataSchema),
  request: z
    .object({
      usernameSubmitted: z.boolean(),
      leagueSelected: z.boolean(),
      season: seasonSchema,
      week: z.number().int().nonnegative(),
      durationBucket: identifierSchema,
      warningCount: z.number().int().nonnegative(),
    })
    .strict(),
});

const commandCenterViewSchema = z
  .object({
    provider: z.literal('sleeper'),
    nflState: commandCenterNflStateSchema,
    resolvedSeason: seasonSchema,
    resolvedWeek: z.number().int().nonnegative(),
    availableWeeks: z.array(z.number().int().min(1).max(30)),
    user: commandCenterUserSchema.nullable(),
    leagues: z.array(commandCenterLeagueSchema),
    selectedLeague: commandCenterLeagueSchema.nullable(),
    rosters: z.array(commandCenterRosterSchema),
    leagueUsers: z.array(commandCenterUserSchema),
    drafts: z.array(commandCenterDraftSchema),
    matchups: z.array(commandCenterMatchupSchema),
    warnings: z.array(commandCenterWarningSchema),
    meta: commandCenterMetadataSchema,
  })
  .strict();

const commandCenterApiResponseSchema = z
  .object({
    ok: z.literal(true),
    data: commandCenterViewSchema,
  })
  .strict();

function createCanonicalResponseSchema(dataSchema) {
  return z
    .object({
      data: dataSchema,
      meta: responseMetadataSchema,
    })
    .strict();
}

module.exports = {
  CANONICAL_SCHEMA_VERSION,
  cacheMetadataSchema,
  commandCenterApiResponseSchema,
  commandCenterViewSchema,
  createCanonicalResponseSchema,
  fantasyMatchupParticipantSchema,
  fantasyMatchupSchema,
  gameSchema,
  playerSchema,
  provenanceSchema,
  resourceCacheMetadataSchema,
  responseMetadataSchema,
  statSchema,
  teamSchema,
};
