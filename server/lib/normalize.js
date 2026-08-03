function normalizeAvatarUrl(avatarId) {
  if (!avatarId) {
    return null;
  }

  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

function normalizeNflState(rawState) {
  const displayWeek = Number.isInteger(rawState.display_week) ? rawState.display_week : 0;
  const activeWeek = displayWeek > 0 ? displayWeek : rawState.week || 0;

  return {
    season: String(rawState.season),
    seasonType: rawState.season_type,
    seasonStartDate: rawState.season_start_date || null,
    previousSeason: rawState.previous_season || null,
    week: rawState.week,
    displayWeek,
    currentWeek: activeWeek,
    leagueSeason: rawState.league_season || String(rawState.season),
    leagueCreateSeason: rawState.league_create_season || null,
  };
}

function normalizeUser(rawUser) {
  return {
    userId: rawUser.user_id,
    username: rawUser.username,
    displayName: rawUser.display_name,
    avatarUrl: normalizeAvatarUrl(rawUser.avatar),
    teamName: rawUser.metadata?.team_name || null,
    isOwner: Boolean(rawUser.is_owner),
  };
}

function normalizeLeague(rawLeague) {
  return {
    leagueId: rawLeague.league_id,
    name: rawLeague.name,
    status: rawLeague.status,
    sport: rawLeague.sport,
    season: String(rawLeague.season),
    seasonType: rawLeague.season_type,
    totalRosters: rawLeague.total_rosters,
    rosterPositions: rawLeague.roster_positions || [],
    settings: rawLeague.settings || {},
    scoringSettings: rawLeague.scoring_settings || {},
    previousLeagueId: rawLeague.previous_league_id || null,
    draftId: rawLeague.draft_id || null,
    avatarUrl: normalizeAvatarUrl(rawLeague.avatar),
  };
}

function normalizeRoster(rawRoster, userById = new Map()) {
  const ownerId = rawRoster.owner_id ? String(rawRoster.owner_id) : null;
  const owner = ownerId ? userById.get(ownerId) || null : null;

  return {
    rosterId: String(rawRoster.roster_id),
    ownerId,
    ownerDisplayName: owner?.displayName || owner?.username || null,
    ownerTeamName: owner?.teamName || null,
    starters: (rawRoster.starters || []).map(value => String(value)),
    reserve: (rawRoster.reserve || []).map(value => String(value)),
    players: (rawRoster.players || []).map(value => String(value)),
    wins: rawRoster.settings?.wins || 0,
    losses: rawRoster.settings?.losses || 0,
    ties: rawRoster.settings?.ties || 0,
    pointsFor: rawRoster.settings?.fpts || 0,
    pointsAgainst: rawRoster.settings?.fpts_against || 0,
    waiverPosition: rawRoster.settings?.waiver_position || null,
    totalMoves: rawRoster.settings?.total_moves || 0,
    settings: rawRoster.settings || {},
  };
}

function normalizeDraft(rawDraft) {
  return {
    draftId: rawDraft.draft_id,
    leagueId: rawDraft.league_id || null,
    type: rawDraft.type,
    status: rawDraft.status,
    sport: rawDraft.sport,
    startTime: rawDraft.start_time || null,
    settings: rawDraft.settings || {},
    season: String(rawDraft.season),
    seasonType: rawDraft.season_type,
    metadata: rawDraft.metadata || {},
  };
}

function normalizeMatchup(rawMatchup) {
  const starters = (rawMatchup.starters || []).map(value => String(value));
  const players = (rawMatchup.players || []).map(value => String(value));
  const starterSet = new Set(starters);

  return {
    rosterId: String(rawMatchup.roster_id),
    matchupId: String(rawMatchup.matchup_id),
    points: rawMatchup.points ?? null,
    customPoints: rawMatchup.custom_points ?? null,
    starters,
    players,
    bench: players.filter(playerId => !starterSet.has(playerId)),
    opponentRosterId: null,
  };
}

function attachMatchupOpponents(matchups) {
  const byMatchupId = new Map();

  for (const matchup of matchups) {
    const bucket = byMatchupId.get(matchup.matchupId) || [];
    bucket.push(matchup);
    byMatchupId.set(matchup.matchupId, bucket);
  }

  return matchups.map(matchup => {
    const opponents = byMatchupId.get(matchup.matchupId) || [];
    const opponent = opponents.find(candidate => candidate.rosterId !== matchup.rosterId) || null;

    return {
      ...matchup,
      opponentRosterId: opponent ? opponent.rosterId : null,
    };
  });
}

module.exports = {
  attachMatchupOpponents,
  normalizeDraft,
  normalizeLeague,
  normalizeMatchup,
  normalizeNflState,
  normalizeRoster,
  normalizeUser,
};