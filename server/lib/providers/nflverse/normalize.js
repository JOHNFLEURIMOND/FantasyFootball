const CURRENT_TEAM_ABBREVIATIONS = new Set([
  'ARI',
  'ATL',
  'BAL',
  'BUF',
  'CAR',
  'CHI',
  'CIN',
  'CLE',
  'DAL',
  'DEN',
  'DET',
  'GB',
  'HOU',
  'IND',
  'JAX',
  'KC',
  'LA',
  'LAC',
  'LV',
  'MIA',
  'MIN',
  'NE',
  'NO',
  'NYG',
  'NYJ',
  'PHI',
  'PIT',
  'SEA',
  'SF',
  'TB',
  'TEN',
  'WAS',
]);

const STAT_DIMENSION_FIELDS = new Set([
  'player_id',
  'player_name',
  'player_display_name',
  'position',
  'position_group',
  'headshot_url',
  'recent_team',
  'team',
  'opponent_team',
  'game_id',
  'season',
  'week',
  'season_type',
]);

function nullableString(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function nullableNumber(value, field) {
  const normalized = String(value ?? '').trim();
  if (!normalized || ['NA', 'NaN', 'null'].includes(normalized)) {
    return null;
  }

  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    const error = new Error(`Expected a numeric value for ${field}.`);
    error.field = field;
    throw error;
  }
  return number;
}

function splitDisplayName(displayName) {
  const parts = displayName.trim().split(/\s+/);
  return {
    firstName: parts.shift() || '',
    lastName: parts.join(' '),
  };
}

function normalizePlayer(row, currentSeason) {
  const fallbackName = splitDisplayName(row.display_name);
  const status = nullableString(row.status) || 'unknown';
  const lastSeason = nullableNumber(row.last_season, 'last_season');

  return {
    playerId: row.gsis_id,
    firstName:
      row.common_first_name || row.first_name || fallbackName.firstName,
    lastName: row.last_name || fallbackName.lastName,
    displayName: row.display_name,
    position: nullableString(row.position),
    teamId: nullableString(row.latest_team),
    status,
    active:
      status.toUpperCase() === 'ACT' ||
      (lastSeason !== null && lastSeason >= currentSeason),
  };
}

function normalizeRosterPlayer(row) {
  const fallbackName = splitDisplayName(row.full_name);
  const status = nullableString(row.status) || 'unknown';
  return {
    playerId: row.gsis_id,
    firstName: row.first_name || fallbackName.firstName,
    lastName: row.last_name || fallbackName.lastName,
    displayName: row.full_name,
    position: nullableString(row.position),
    teamId: row.team,
    status,
    active: !['CUT', 'RET', 'DEV'].includes(status.toUpperCase()),
  };
}

function normalizeTeam(row) {
  const nickname = row.team_nick || row.team_name;
  const city = row.team_name.endsWith(nickname)
    ? row.team_name.slice(0, -nickname.length).trim()
    : '';
  return {
    teamId: row.team_abbr,
    abbreviation: row.team_abbr,
    name: nickname,
    city: nullableString(city),
    conference: nullableString(row.team_conf),
    division: nullableString(row.team_division),
    active: CURRENT_TEAM_ABBREVIATIONS.has(row.team_abbr),
    logoUrl: nullableString(
      row.team_logo_espn || row.team_logo_wikipedia || row.team_wordmark
    ),
  };
}

function normalizeSeasonType(value) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'REG') return 'regular';
  if (normalized === 'PRE') return 'preseason';
  return 'postseason';
}

function normalizeKickoff(row) {
  const time = /^\d{2}:\d{2}$/.test(row.gametime) ? row.gametime : '00:00';
  const kickoff = new Date(`${row.gameday}T${time}:00Z`);
  return kickoff.toISOString();
}

function normalizeGame(row) {
  const homeScore = nullableNumber(row.home_score, 'home_score');
  const awayScore = nullableNumber(row.away_score, 'away_score');
  return {
    gameId: row.game_id,
    season: row.season,
    seasonType: normalizeSeasonType(row.game_type),
    week: Number(row.week),
    startTime: normalizeKickoff(row),
    status: homeScore !== null && awayScore !== null ? 'complete' : 'scheduled',
    homeTeamId: row.home_team,
    awayTeamId: row.away_team,
    homeScore,
    awayScore,
  };
}

function normalizeStat(row, scope) {
  const metrics = {};
  for (const [field, value] of Object.entries(row)) {
    if (!STAT_DIMENSION_FIELDS.has(field) && !field.endsWith('_list')) {
      metrics[field] = nullableNumber(value, field);
    }
  }

  const week = scope === 'season' ? 0 : Number(row.week);
  const teamId = nullableString(row.recent_team || row.team);
  const gameId = nullableString(row.game_id);
  return {
    statId: `${row.season}:${scope}:${week}:${row.player_id}:${teamId || 'FA'}`,
    playerId: row.player_id,
    teamId,
    gameId,
    season: row.season,
    week,
    scope,
    metrics,
  };
}

module.exports = {
  CURRENT_TEAM_ABBREVIATIONS,
  normalizeGame,
  normalizePlayer,
  normalizeRosterPlayer,
  normalizeStat,
  normalizeTeam,
  nullableNumber,
};
