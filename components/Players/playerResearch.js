import { calculatePprPoints } from '../api/nflDataTransforms';

export function aggregateStats(stats = []) {
  const metrics = {};
  for (const stat of stats) {
    for (const [key, value] of Object.entries(stat.metrics || {})) {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) metrics[key] = (metrics[key] || 0) + numeric;
    }
  }
  return metrics;
}

export function buildPlayerProfile({ playerId, players = [], teams = [], weeklyStats = [], seasonalStats = [] }) {
  const player = players.find(item => item.playerId === playerId) || null;
  if (!player) return null;
  return {
    player,
    team: teams.find(item => item.teamId === player.teamId) || null,
    weekly: weeklyStats.filter(stat => stat.playerId === playerId).sort((a, b) => Number(a.week) - Number(b.week)),
    seasonal: seasonalStats.filter(stat => stat.playerId === playerId),
  };
}

export function buildComparisonRows({ playerIds = [], players = [], weeklyStats = [], season, week = '' }) {
  return playerIds.map(id => {
    const player = players.find(item => item.playerId === id);
    const matching = weeklyStats.filter(stat =>
      stat.playerId === id &&
      String(stat.season) === String(season) &&
      (!week || Number(stat.week) === Number(week))
    );
    const metrics = aggregateStats(matching);
    return {
      playerId: id,
      displayName: player?.displayName || id,
      position: player?.position || null,
      teamId: player?.teamId || null,
      games: matching.length,
      metrics,
      fantasyPointsPpr: Number(calculatePprPoints(metrics).toFixed(2)),
      missing: matching.length === 0,
    };
  });
}

export function buildLeaderboard({ players = [], weeklyStats = [], season, week = '', position = '', sortBy = 'fantasyPointsPpr', page = 1, pageSize = 25 }) {
  const rows = players
    .filter(player => !position || player.position === position)
    .map(player => {
      const stats = weeklyStats.filter(stat =>
        stat.playerId === player.playerId &&
        String(stat.season) === String(season) &&
        (!week || Number(stat.week) === Number(week))
      );
      const metrics = aggregateStats(stats);
      return {
        playerId: player.playerId,
        displayName: player.displayName,
        position: player.position,
        teamId: player.teamId,
        games: stats.length,
        fantasyPointsPpr: Number(calculatePprPoints(metrics).toFixed(2)),
        passingYards: Number(metrics.passing_yards || 0),
        rushingYards: Number(metrics.rushing_yards || 0),
        receivingYards: Number(metrics.receiving_yards || 0),
        receptions: Number(metrics.receptions || 0),
        metrics,
      };
    })
    .filter(row => row.games > 0)
    .sort((a, b) => {
      const aValue = Number(a[sortBy] || 0);
      const bValue = Number(b[sortBy] || 0);
      return bValue - aValue || a.displayName.localeCompare(b.displayName) || a.playerId.localeCompare(b.playerId);
    });

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const activePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (activePage - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), totalItems: rows.length, totalPages, activePage };
}
