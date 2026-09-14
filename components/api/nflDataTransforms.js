const DEFAULT_SCORING = Object.freeze({
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

function numberMetric(metrics, key) {
  const value = metrics?.[key];
  return Number.isFinite(value) ? value : Number(value) || 0;
}

export function calculatePprPoints(metrics, scoring = DEFAULT_SCORING) {
  return (
    numberMetric(metrics, 'passing_yards') * scoring.passingYards +
    numberMetric(metrics, 'passing_tds') * scoring.passingTouchdowns +
    numberMetric(metrics, 'interceptions') * scoring.interceptions +
    numberMetric(metrics, 'rushing_yards') * scoring.rushingYards +
    numberMetric(metrics, 'rushing_tds') * scoring.rushingTouchdowns +
    numberMetric(metrics, 'receptions') * scoring.receptions +
    numberMetric(metrics, 'receiving_yards') * scoring.receivingYards +
    numberMetric(metrics, 'receiving_tds') * scoring.receivingTouchdowns +
    numberMetric(metrics, 'fumbles_lost') * scoring.fumblesLost +
    (numberMetric(metrics, 'passing_2pt_conversions') +
      numberMetric(metrics, 'rushing_2pt_conversions') +
      numberMetric(metrics, 'receiving_2pt_conversions')) *
      scoring.twoPointConversions
  );
}

function playerIndex(players) {
  return new Map(players.map(player => [player.playerId, player]));
}

function toLegacyPlayerShape(player, stat, fantasyPoints, label) {
  const metrics = stat.metrics || {};
  return {
    PlayerID: stat.playerId,
    Name: player?.displayName || stat.displayName || stat.playerId,
    Position: player?.position || stat.position || 'N/A',
    Team: stat.teamId || player?.teamId || 'FA',
    Opponent: 'N/A',
    GameDate: null,
    HomeOrAway: 'N/A',
    Activated: player?.active === false ? 0 : 1,
    PassingAttempts: numberMetric(metrics, 'attempts'),
    PassingCompletions: numberMetric(metrics, 'completions'),
    PassingYards: numberMetric(metrics, 'passing_yards'),
    PassingTouchdowns: numberMetric(metrics, 'passing_tds'),
    RushingAttempts: numberMetric(metrics, 'carries'),
    RushingYards: numberMetric(metrics, 'rushing_yards'),
    RushingTouchdowns: numberMetric(metrics, 'rushing_tds'),
    Receptions: numberMetric(metrics, 'receptions'),
    ReceivingYards: numberMetric(metrics, 'receiving_yards'),
    ReceivingTouchdowns: numberMetric(metrics, 'receiving_tds'),
    FantasyPoints: Number(Number(fantasyPoints || 0).toFixed(2)),
    FantasyPointsPPR: Number(Number(fantasyPoints || 0).toFixed(2)),
    FantasyPointsFanDuel: null,
    FantasyPointsDraftKings: null,
    FantasyPointsYahoo: null,
    DataLabel: label,
    Season: stat.season,
    Week: stat.week || stat.throughWeek || 0,
    Rank: stat.rank || null,
  };
}

export function mapCanonicalFantasyRows(rows = [], kind = 'ranking') {
  return rows.map(row =>
    toLegacyPlayerShape(
      null,
      row,
      row.fantasyPointsPpr,
      kind === 'projection'
        ? `Estimated projection · ${row.sourceSampleSize || 0}-game trailing average · full PPR`
        : 'Observed statistics · application-calculated full PPR'
    )
  );
}

export function buildPprRankings({ players = [], weeklyStats = [] }) {
  const playersById = playerIndex(players);
  const totalsByPlayer = new Map();

  for (const stat of weeklyStats) {
    if (!stat?.playerId || stat.scope !== 'week') continue;
    const current = totalsByPlayer.get(stat.playerId) || {
      playerId: stat.playerId,
      teamId: stat.teamId,
      season: stat.season,
      week: 0,
      scope: 'week',
      metrics: {},
      fantasyPoints: 0,
    };

    current.week = Math.max(current.week, Number(stat.week) || 0);
    current.teamId = stat.teamId || current.teamId;
    current.fantasyPoints += calculatePprPoints(stat.metrics);

    for (const [key, value] of Object.entries(stat.metrics || {})) {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        current.metrics[key] = (current.metrics[key] || 0) + numericValue;
      }
    }
    totalsByPlayer.set(stat.playerId, current);
  }

  return Array.from(totalsByPlayer.values())
    .map(stat =>
      toLegacyPlayerShape(
        playersById.get(stat.playerId),
        stat,
        stat.fantasyPoints,
        'Observed statistics · application-calculated full PPR'
      )
    )
    .sort((a, b) => b.FantasyPointsPPR - a.FantasyPointsPPR);
}

export function buildWeeklyProjections({ players = [], weeklyStats = [] }) {
  const playersById = playerIndex(players);
  const byPlayer = new Map();

  for (const stat of weeklyStats) {
    if (!stat?.playerId || stat.scope !== 'week' || Number(stat.week) <= 0) continue;
    const list = byPlayer.get(stat.playerId) || [];
    list.push(stat);
    byPlayer.set(stat.playerId, list);
  }

  return Array.from(byPlayer.entries())
    .map(([playerId, stats]) => {
      const recent = [...stats]
        .sort((a, b) => Number(a.week) - Number(b.week))
        .filter(stat => Number(stat.week) > 0)
        .slice(-4);
      if (recent.length === 0) return null;

      const averageMetrics = {};
      for (const stat of recent) {
        for (const [key, value] of Object.entries(stat.metrics || {})) {
          const numericValue = Number(value);
          if (Number.isFinite(numericValue)) {
            averageMetrics[key] = (averageMetrics[key] || 0) + numericValue;
          }
        }
      }
      for (const key of Object.keys(averageMetrics)) {
        averageMetrics[key] /= recent.length;
      }

      const latest = recent[recent.length - 1];
      const projectionStat = {
        ...latest,
        week: Math.min((Number(latest.week) || 0) + 1, 30),
        metrics: averageMetrics,
      };
      return toLegacyPlayerShape(
        playersById.get(playerId),
        projectionStat,
        calculatePprPoints(averageMetrics),
        `Estimated projection · ${recent.length}-game trailing average · full PPR`
      );
    })
    .filter(Boolean)
    .sort((a, b) => b.FantasyPointsPPR - a.FantasyPointsPPR);
}

export function buildScheduleCards(games = []) {
  return games.map(game => ({
    GameKey: game.gameId,
    AwayTeam: game.awayTeam?.abbreviation || game.awayTeamId,
    HomeTeam: game.homeTeam?.abbreviation || game.homeTeamId,
    AwayTeamName: game.awayTeam
      ? [game.awayTeam.city, game.awayTeam.name].filter(Boolean).join(' ')
      : game.awayTeamId,
    HomeTeamName: game.homeTeam
      ? [game.homeTeam.city, game.homeTeam.name].filter(Boolean).join(' ')
      : game.homeTeamId,
    AwayTeamLogo: game.awayTeam?.logoUrl || null,
    HomeTeamLogo: game.homeTeam?.logoUrl || null,
    Date: game.startTime,
    DateTime: game.startTime,
    Channel: 'NFL schedule',
    PointSpread: 'N/A',
    OverUnder: 'N/A',
    StadiumDetails: {
      Name: 'Venue not provided',
      City: 'N/A',
      State: null,
      Country: 'USA',
      PlayingSurface: 'N/A',
    },
    AwayTeamMoneyLine: 'N/A',
    HomeTeamMoneyLine: 'N/A',
    Status: game.status,
    Week: game.week,
    Season: game.season,
    AwayScore: game.awayScore,
    HomeScore: game.homeScore,
  }));
}

export { DEFAULT_SCORING };
