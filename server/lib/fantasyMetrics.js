const DEFAULT_PPR_SCORING = Object.freeze({
  passingYards: 0.04,
  passingTouchdowns: 4,
  interceptions: -2,
  rushingYards: 0.1,
  rushingTouchdowns: 6,
  receptions: 1,
  receivingYards: 0.1,
  receivingTouchdowns: 6,
  fumblesLost: -2,
  twoPointConversions: 2,
});

function metric(metrics, key) {
  const value = Number(metrics?.[key]);
  return Number.isFinite(value) ? value : 0;
}

function calculatePprPoints(metrics, scoring = DEFAULT_PPR_SCORING) {
  return (
    metric(metrics, 'passing_yards') * scoring.passingYards +
    metric(metrics, 'passing_tds') * scoring.passingTouchdowns +
    metric(metrics, 'interceptions') * scoring.interceptions +
    metric(metrics, 'rushing_yards') * scoring.rushingYards +
    metric(metrics, 'rushing_tds') * scoring.rushingTouchdowns +
    metric(metrics, 'receptions') * scoring.receptions +
    metric(metrics, 'receiving_yards') * scoring.receivingYards +
    metric(metrics, 'receiving_tds') * scoring.receivingTouchdowns +
    metric(metrics, 'fumbles_lost') * scoring.fumblesLost +
    (metric(metrics, 'passing_2pt_conversions') +
      metric(metrics, 'rushing_2pt_conversions') +
      metric(metrics, 'receiving_2pt_conversions')) *
      scoring.twoPointConversions
  );
}

function addMetrics(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      target[key] = (target[key] || 0) + numeric;
    }
  }
}

function playerMap(players = []) {
  return new Map(players.map(player => [player.playerId, player]));
}

function buildPprRankings({ players = [], weeklyStats = [], season }) {
  const playersById = playerMap(players);
  const totals = new Map();

  for (const stat of weeklyStats) {
    if (!stat?.playerId || stat.scope !== 'week') continue;
    const entry = totals.get(stat.playerId) || {
      playerId: stat.playerId,
      teamId: stat.teamId,
      season: String(season || stat.season),
      throughWeek: 0,
      metrics: {},
      fantasyPointsPpr: 0,
    };

    entry.teamId = stat.teamId || entry.teamId;
    entry.throughWeek = Math.max(entry.throughWeek, Number(stat.week) || 0);
    entry.fantasyPointsPpr += calculatePprPoints(stat.metrics);
    addMetrics(entry.metrics, stat.metrics);
    totals.set(stat.playerId, entry);
  }

  return Array.from(totals.values())
    .map(entry => {
      const player = playersById.get(entry.playerId);
      return {
        ...entry,
        displayName: player?.displayName || entry.playerId,
        position: player?.position || null,
        teamId: entry.teamId || player?.teamId || null,
        scoringFormat: 'ppr',
        dataType: 'observed-ranking',
        fantasyPointsPpr: Number(entry.fantasyPointsPpr.toFixed(2)),
      };
    })
    .sort((a, b) =>
      b.fantasyPointsPpr - a.fantasyPointsPpr ||
      a.displayName.localeCompare(b.displayName) ||
      a.playerId.localeCompare(b.playerId)
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function averageRecentStats(stats, count = 4) {
  const recent = [...stats]
    .filter(stat => Number(stat.week) > 0)
    .sort((a, b) => Number(a.week) - Number(b.week))
    .slice(-count);

  if (recent.length === 0) return null;

  const metrics = {};
  for (const stat of recent) addMetrics(metrics, stat.metrics);
  for (const key of Object.keys(metrics)) metrics[key] /= recent.length;

  return { recent, metrics };
}

function buildWeeklyProjections({ players = [], weeklyStats = [], season }) {
  const playersById = playerMap(players);
  const statsByPlayer = new Map();

  for (const stat of weeklyStats) {
    if (!stat?.playerId || stat.scope !== 'week') continue;
    const list = statsByPlayer.get(stat.playerId) || [];
    list.push(stat);
    statsByPlayer.set(stat.playerId, list);
  }

  return Array.from(statsByPlayer.entries())
    .map(([playerId, stats]) => {
      const average = averageRecentStats(stats, 4);
      if (!average) return null;

      const player = playersById.get(playerId);
      const latest = average.recent[average.recent.length - 1];
      const sourceWeeks = average.recent.map(stat => Number(stat.week));

      return {
        playerId,
        displayName: player?.displayName || playerId,
        position: player?.position || null,
        teamId: latest.teamId || player?.teamId || null,
        season: String(season || latest.season),
        week: Math.min((Number(latest.week) || 0) + 1, 30),
        scoringFormat: 'ppr',
        dataType: 'estimated-projection',
        estimated: true,
        methodology: 'trailing-average',
        sourceWeeks,
        sourceSampleSize: average.recent.length,
        metrics: average.metrics,
        fantasyPointsPpr: Number(calculatePprPoints(average.metrics).toFixed(2)),
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      b.fantasyPointsPpr - a.fantasyPointsPpr ||
      a.displayName.localeCompare(b.displayName) ||
      a.playerId.localeCompare(b.playerId)
    );
}

function buildStandings(games = [], teams = []) {
  const teamsById = new Map(teams.map(team => [team.teamId, team]));
  const records = new Map();

  function ensure(teamId) {
    if (!records.has(teamId)) {
      const team = teamsById.get(teamId);
      records.set(teamId, {
        teamId,
        name: team ? [team.city, team.name].filter(Boolean).join(' ') : teamId,
        conference: team?.conference || null,
        division: team?.division || null,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        gamesPlayed: 0,
      });
    }
    return records.get(teamId);
  }

  for (const game of games) {
    if (game.status !== 'complete') continue;
    if (!Number.isFinite(game.homeScore) || !Number.isFinite(game.awayScore)) continue;

    const home = ensure(game.homeTeamId);
    const away = ensure(game.awayTeamId);
    home.gamesPlayed += 1;
    away.gamesPlayed += 1;
    home.pointsFor += game.homeScore;
    home.pointsAgainst += game.awayScore;
    away.pointsFor += game.awayScore;
    away.pointsAgainst += game.homeScore;

    if (game.homeScore === game.awayScore) {
      home.ties += 1;
      away.ties += 1;
    } else if (game.homeScore > game.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  return Array.from(records.values())
    .map(record => ({
      ...record,
      winPercentage:
        record.gamesPlayed === 0
          ? 0
          : Number(((record.wins + record.ties * 0.5) / record.gamesPlayed).toFixed(3)),
    }))
    .sort((a, b) =>
      b.winPercentage - a.winPercentage ||
      b.wins - a.wins ||
      b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst) ||
      a.teamId.localeCompare(b.teamId)
    );
}

module.exports = {
  DEFAULT_PPR_SCORING,
  buildPprRankings,
  buildStandings,
  buildWeeklyProjections,
  calculatePprPoints,
};
