const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CANONICAL_SCHEMA_VERSION,
  createCanonicalResponseSchema,
  fantasyMatchupSchema,
  gameSchema,
  playerSchema,
  responseMetadataSchema,
  statSchema,
  teamSchema,
} = require('../server/lib/domainSchemas');

const timestamp = '2026-09-10T12:00:00.000Z';

function createMetadata() {
  return {
    schemaVersion: CANONICAL_SCHEMA_VERSION,
    generatedAt: timestamp,
    provenance: [
      {
        provider: 'sleeper',
        resource: 'players',
        sourceRecordId: 'player-1',
        fetchedAt: timestamp,
        sourceUpdatedAt: null,
      },
    ],
    cache: {
      status: 'fresh',
      ageMs: 0,
      staleAgeMs: 0,
    },
  };
}

test('canonical player and team schemas accept normalized entities', () => {
  const player = playerSchema.parse({
    playerId: 'player-1',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    position: 'QB',
    teamId: 'NE',
    status: 'active',
    active: true,
  });
  const team = teamSchema.parse({
    teamId: 'NE',
    abbreviation: 'NE',
    name: 'Patriots',
    city: 'New England',
    conference: 'AFC',
    division: 'East',
    active: true,
  });

  assert.equal(player.playerId, 'player-1');
  assert.equal(team.teamId, player.teamId);
});

test('canonical entity schemas reject provider fields and invalid identifiers', () => {
  assert.equal(
    playerSchema.safeParse({
      playerId: '',
      firstName: 'Jane',
      lastName: 'Doe',
      displayName: 'Jane Doe',
      position: null,
      teamId: null,
      status: 'active',
      active: true,
    }).success,
    false
  );
  assert.equal(
    teamSchema.safeParse({
      teamId: 'NE',
      abbreviation: 'NE',
      name: 'Patriots',
      city: null,
      conference: null,
      division: null,
      active: true,
      provider_team_id: 'provider-field',
    }).success,
    false
  );
});

test('canonical game schema enforces distinct NFL teams', () => {
  const validGame = {
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
  };

  assert.equal(gameSchema.safeParse(validGame).success, true);
  assert.equal(
    gameSchema.safeParse({ ...validGame, awayTeamId: 'NE' }).success,
    false
  );
});

test('canonical fantasy matchup schema requires unique participants', () => {
  const validMatchup = {
    matchupId: 'matchup-1',
    leagueId: 'league-1',
    season: '2026',
    week: 1,
    status: 'complete',
    participants: [
      { rosterId: 'roster-1', points: 101.5, projectedPoints: 99.2 },
      { rosterId: 'roster-2', points: 98.1, projectedPoints: 103.4 },
    ],
  };

  assert.equal(fantasyMatchupSchema.safeParse(validMatchup).success, true);
  assert.equal(
    fantasyMatchupSchema.safeParse({
      ...validMatchup,
      participants: [
        validMatchup.participants[0],
        validMatchup.participants[0],
      ],
    }).success,
    false
  );
});

test('canonical stat schema validates scope and finite metric values', () => {
  const validStat = {
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
      rushingYards: null,
    },
  };

  assert.equal(statSchema.safeParse(validStat).success, true);
  assert.equal(
    statSchema.safeParse({ ...validStat, gameId: null }).success,
    false
  );
  assert.equal(
    statSchema.safeParse({
      ...validStat,
      metrics: { passingYards: Number.POSITIVE_INFINITY },
    }).success,
    false
  );
});

test('shared response metadata requires versioned provenance', () => {
  const responseSchema = createCanonicalResponseSchema(playerSchema.array());
  const response = responseSchema.parse({
    data: [],
    meta: createMetadata(),
  });

  assert.equal(response.meta.schemaVersion, 1);
  assert.equal(response.meta.provenance[0].provider, 'sleeper');
  assert.equal(
    responseMetadataSchema.safeParse({
      ...createMetadata(),
      schemaVersion: 2,
    }).success,
    false
  );
  assert.equal(
    responseMetadataSchema.safeParse({
      ...createMetadata(),
      provenance: [],
    }).success,
    false
  );
});
