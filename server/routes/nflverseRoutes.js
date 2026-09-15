const express = require('express');
const {
  buildPprRankings,
  buildStandings,
  buildWeeklyProjections,
} = require('../lib/fantasyMetrics');
const { toSafeError } = require('../lib/errors');
const {
  invalidRequest,
  normalizeText,
  paginate,
  playerSchema,
  projectionSchema,
  rankingSchema,
  scheduleGameSchema,
  sortItems,
  standingsSchema,
  statSchema,
  teamSchema,
  validateCollection,
  validateOne,
} = require('../lib/canonicalApi');
const { gameSchema } = require('../lib/domainSchemas');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function unwrap(result) {
  if (Array.isArray(result)) return { data: result, meta: null };
  if (result && Array.isArray(result.data)) return result;
  return { data: [], meta: result?.meta || null };
}

function parseSeason(value, fallback = new Date().getFullYear()) {
  const season = Number(value ?? fallback);
  return Number.isInteger(season) && season >= 1920 && season <= 2100
    ? season
    : null;
}

function parseWeek(value) {
  if (value === undefined || value === null || value === '') return null;
  const week = Number(value);
  return Number.isInteger(week) && week >= 1 && week <= 30 ? week : NaN;
}

function providerMeta(resource, season, sources = [], extra = {}) {
  const sourceMeta = sources.filter(Boolean);
  const stale = sourceMeta.some(meta => meta?.cache?.cacheStatus === 'stale');
  const recordsSkipped = sourceMeta.reduce(
    (total, meta) => total + Number(meta?.recordsSkipped || 0),
    0
  );

  return {
    resource,
    season,
    generatedAt: new Date().toISOString(),
    source: 'canonical-nfl-data',
    stale,
    partial: recordsSkipped > 0,
    recordsSkipped,
    sources: sourceMeta,
    ...extra,
  };
}

function listResponse(items, req, meta) {
  const page = paginate(items, req.query);
  return {
    data: {
      data: page.data,
      meta: {
        ...meta,
        page: page.page,
        pageSize: page.pageSize,
        total: page.total,
        totalPages: page.totalPages,
      },
    },
  };
}

function findById(items, id, field) {
  return items.find(item => String(item?.[field]) === String(id)) || null;
}

function createNflverseRouter({ nflverseProvider }) {
  const router = express.Router();

  if (!nflverseProvider) throw new Error('nflverseProvider dependency is required');

  router.get('/players', asyncHandler(async (req, res) => {
    const result = unwrap(await nflverseProvider.getPlayers());
    let players = validateCollection(playerSchema, result.data, 'players');
    const query = normalizeText(req.query.q);
    const team = normalizeText(req.query.team);
    const position = normalizeText(req.query.position);

    players = players.filter(player => {
      if (query && !normalizeText(player.displayName).includes(query)) return false;
      if (team && normalizeText(player.teamId) !== team) return false;
      if (position && normalizeText(player.position) !== position) return false;
      return true;
    });
    players = sortItems(players, req.query, {
      name: player => player.displayName,
      position: player => player.position,
      team: player => player.teamId,
    }, 'name');

    return res.json(listResponse(players, req, providerMeta('players', null, [result.meta])));
  }));

  router.get('/players/:id', asyncHandler(async (req, res) => {
    const result = unwrap(await nflverseProvider.getPlayers());
    const players = validateCollection(playerSchema, result.data, 'players');
    const player = findById(players, req.params.id, 'playerId');
    if (!player) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Player not found.', status: 404 } });
    return res.json({ data: validateOne(playerSchema, player, 'player'), meta: providerMeta('player', null, [result.meta]) });
  }));

  router.get('/teams', asyncHandler(async (req, res) => {
    const result = unwrap(await nflverseProvider.getTeams());
    let teams = validateCollection(teamSchema, result.data, 'teams');
    const query = normalizeText(req.query.q);
    if (query) {
      teams = teams.filter(team => [team.teamId, team.abbreviation, team.city, team.name].some(value => normalizeText(value).includes(query)));
    }
    teams = sortItems(teams, req.query, {
      id: team => team.teamId,
      name: team => `${team.city || ''} ${team.name}`.trim(),
      conference: team => team.conference,
      division: team => team.division,
    }, 'id');
    return res.json(listResponse(teams, req, providerMeta('teams', null, [result.meta])));
  }));

  router.get('/teams/:id', asyncHandler(async (req, res) => {
    const result = unwrap(await nflverseProvider.getTeams());
    const teams = validateCollection(teamSchema, result.data, 'teams');
    const team = findById(teams, req.params.id, 'teamId');
    if (!team) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Team not found.', status: 404 } });
    return res.json({ data: validateOne(teamSchema, team, 'team'), meta: providerMeta('team', null, [result.meta]) });
  }));

  router.get('/projections', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const [playersResult, statsResult] = await Promise.all([
      nflverseProvider.getPlayers(),
      nflverseProvider.getWeeklyStats(season),
    ]);
    const players = unwrap(playersResult);
    const stats = unwrap(statsResult);
    let projections = validateCollection(projectionSchema, buildWeeklyProjections({ players: players.data, weeklyStats: stats.data, season }), 'projections');
    const throughWeek = projections.reduce((max, item) => Math.max(max, ...item.sourceWeeks, 0), 0);
    projections = sortItems(projections, req.query, {
      fantasyPointsPpr: item => item.fantasyPointsPpr,
      name: item => item.displayName,
      week: item => item.week,
    }, 'fantasyPointsPpr');
    if (!req.query.order) req.query.order = 'desc';
    return res.json(listResponse(projections, req, providerMeta('projections', season, [players.meta, stats.meta], {
      week: throughWeek + 1,
      dataType: 'estimated-projection',
      estimated: true,
      methodology: 'Trailing average of up to four prior observed game weeks',
      scoringFormat: 'ppr',
    })));
  }));

  router.get('/rankings', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    const format = String(req.query.format || 'ppr').toLowerCase();
    if (season === null) throw invalidRequest('Invalid season parameter.');
    if (format !== 'ppr') throw invalidRequest('Only ppr rankings are currently supported.');
    const [playersResult, statsResult] = await Promise.all([
      nflverseProvider.getPlayers(),
      nflverseProvider.getWeeklyStats(season),
    ]);
    const players = unwrap(playersResult);
    const stats = unwrap(statsResult);
    let rankings = validateCollection(rankingSchema, buildPprRankings({ players: players.data, weeklyStats: stats.data, season }), 'rankings');
    const week = rankings.reduce((max, item) => Math.max(max, item.throughWeek), 0);
    rankings = sortItems(rankings, req.query, {
      rank: item => item.rank,
      fantasyPointsPpr: item => item.fantasyPointsPpr,
      name: item => item.displayName,
    }, 'rank');
    return res.json(listResponse(rankings, req, providerMeta('rankings', season, [players.meta, stats.meta], {
      week,
      dataType: 'observed-ranking',
      scoringFormat: 'ppr',
    })));
  }));

  router.get('/schedule', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    const week = parseWeek(req.query.week);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    if (Number.isNaN(week)) throw invalidRequest('Invalid week parameter.');
    const [scheduleResult, teamsResult] = await Promise.all([
      nflverseProvider.getSchedules(season),
      nflverseProvider.getTeams(),
    ]);
    const schedule = unwrap(scheduleResult);
    const teams = unwrap(teamsResult);
    const validatedTeams = validateCollection(teamSchema, teams.data, 'teams');
    const teamsById = new Map(validatedTeams.map(team => [team.teamId, team]));
    let games = validateCollection(scheduleGameSchema, schedule.data
      .filter(game => week === null || Number(game.week) === week)
      .map(game => ({ ...game, homeTeam: teamsById.get(game.homeTeamId) || null, awayTeam: teamsById.get(game.awayTeamId) || null })), 'schedule');
    games = sortItems(games, req.query, {
      week: game => game.week,
      startTime: game => game.startTime,
    }, 'startTime');
    return res.json(listResponse(games, req, providerMeta('schedule', season, [schedule.meta, teams.meta], { week })));
  }));

  router.get('/standings', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const [scheduleResult, teamsResult] = await Promise.all([
      nflverseProvider.getSchedules(season),
      nflverseProvider.getTeams(),
    ]);
    const schedule = unwrap(scheduleResult);
    const teams = unwrap(teamsResult);
    let standings = validateCollection(standingsSchema, buildStandings(schedule.data, teams.data), 'standings');
    standings = sortItems(standings, req.query, {
      winPercentage: item => item.winPercentage,
      wins: item => item.wins,
      team: item => item.teamId,
    }, 'winPercentage');
    if (!req.query.order) req.query.order = 'desc';
    return res.json(listResponse(standings, req, providerMeta('standings', season, [schedule.meta, teams.meta])));
  }));

  router.get('/stats/weekly', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    const week = parseWeek(req.query.week);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    if (Number.isNaN(week)) throw invalidRequest('Invalid week parameter.');
    const result = unwrap(await nflverseProvider.getWeeklyStats(season));
    let stats = validateCollection(statSchema, result.data, 'weekly-stats');
    if (week !== null) stats = stats.filter(stat => stat.week === week);
    if (req.query.playerId) stats = stats.filter(stat => stat.playerId === String(req.query.playerId));
    stats = sortItems(stats, req.query, {
      player: stat => stat.playerId,
      week: stat => stat.week,
      team: stat => stat.teamId,
    }, 'player');
    return res.json(listResponse(stats, req, providerMeta('weekly-stats', season, [result.meta], { week, scope: 'week' })));
  }));

  router.get('/stats/seasonal', asyncHandler(async (req, res) => {
    const season = parseSeason(req.query.season);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const result = unwrap(await nflverseProvider.getSeasonalStats(season));
    let stats = validateCollection(statSchema, result.data, 'seasonal-stats');
    if (req.query.playerId) stats = stats.filter(stat => stat.playerId === String(req.query.playerId));
    stats = sortItems(stats, req.query, {
      player: stat => stat.playerId,
      team: stat => stat.teamId,
    }, 'player');
    return res.json(listResponse(stats, req, providerMeta('seasonal-stats', season, [result.meta], { scope: 'season' })));
  }));

  router.get('/schedules/:season', asyncHandler(async (req, res) => {
    const season = parseSeason(req.params.season, null);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const result = unwrap(await nflverseProvider.getSchedules(season));
    return res.json({ data: validateCollection(gameSchema, result.data, 'schedules'), provenance: { provider: 'nflverse', dataset: 'schedules', season } });
  }));

  router.get('/stats/weekly/:season', asyncHandler(async (req, res) => {
    const season = parseSeason(req.params.season, null);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const result = unwrap(await nflverseProvider.getWeeklyStats(season));
    return res.json({ data: validateCollection(statSchema, result.data, 'weekly-stats'), provenance: { provider: 'nflverse', dataset: 'weekly_stats', season } });
  }));

  router.get('/stats/seasonal/:season', asyncHandler(async (req, res) => {
    const season = parseSeason(req.params.season, null);
    if (season === null) throw invalidRequest('Invalid season parameter.');
    const result = unwrap(await nflverseProvider.getSeasonalStats(season));
    return res.json({ data: validateCollection(statSchema, result.data, 'seasonal-stats'), provenance: { provider: 'nflverse', dataset: 'seasonal_stats', season } });
  }));

  router.get('/metadata', asyncHandler(async (_req, res) => {
    if (typeof nflverseProvider.getMetadata !== 'function') return res.json({ data: null });
    return res.json({ data: await nflverseProvider.getMetadata() });
  }));

  router.post('/refresh', asyncHandler(async (_req, res) => {
    if (typeof nflverseProvider.clearCache === 'function') await nflverseProvider.clearCache();
    return res.json({ success: true, clearedAt: new Date().toISOString() });
  }));

  router.use((err, _req, res, _next) => {
    const safe = toSafeError(err);
    return res.status(safe.status || 500).json({ error: safe });
  });

  return router;
}

module.exports = { createNflverseRouter, parseSeason, parseWeek, unwrap };
