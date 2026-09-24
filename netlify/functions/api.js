const {
  createCommandCenterSuccessResponse,
  createDefaultCommandCenterService,
  createDefaultNflverseProvider,
  parseRequestParams,
} = require('../../server/createApp');
const {
  createCriticalErrorResponse,
} = require('../../server/lib/commandCenterService');
const {
  buildPprRankings,
  buildStandings,
  buildWeeklyProjections,
} = require('../../server/lib/fantasyMetrics');
const { toSafeError } = require('../../server/lib/errors');
const {
  invalidRequest,
  normalizeText,
  paginate,
  playerSchema,
  projectionSchema,
  rankingSchema,
  scheduleGameSchema,
  standingsSchema,
  statSchema,
  teamSchema,
  validateCollection,
  validateOne,
} = require('../../server/lib/canonicalApi');
const { gameSchema } = require('../../server/lib/domainSchemas');

const commandCenterService = createDefaultCommandCenterService();
const nflverseProvider = createDefaultNflverseProvider();

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function normalizePath(path = '') {
  return path
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '')
    .replace(/\/$/, '') || '/';
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (_error) {
    throw invalidRequest('The request body contains invalid JSON.');
  }
}

function parseSeason(value, fallback = new Date().getFullYear()) {
  const season = Number(value ?? fallback);
  if (!Number.isInteger(season) || season < 1920 || season > 2100) {
    throw invalidRequest('Invalid season parameter.');
  }
  return season;
}

function parseWeek(value) {
  if (value === undefined || value === null || value === '') return null;
  const week = Number(value);
  if (!Number.isInteger(week) || week < 1 || week > 30) {
    throw invalidRequest('Invalid week parameter.');
  }
  return week;
}

function unwrap(result) {
  if (Array.isArray(result)) return { data: result, meta: null };
  if (result && Array.isArray(result.data)) return result;
  return { data: [], meta: result?.meta || null };
}

function derivedMeta(resource, season, sources = [], extra = {}) {
  const sourceMeta = sources.filter(Boolean);
  const recordsSkipped = sourceMeta.reduce(
    (total, meta) => total + Number(meta?.recordsSkipped || 0),
    0
  );
  return {
    resource,
    season,
    generatedAt: new Date().toISOString(),
    source: 'canonical-nfl-data',
    stale: sourceMeta.some(meta => meta?.cache?.cacheStatus === 'stale'),
    partial: recordsSkipped > 0,
    recordsSkipped,
    sources: sourceMeta,
    ...extra,
  };
}

function listBody(items, query, meta) {
  const page = paginate(items, query);
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

function notFound(resource) {
  return jsonResponse(404, {
    error: {
      code: 'NOT_FOUND',
      message: `${resource} not found.`,
      status: 404,
    },
  });
}

function findById(items, id, field) {
  return items.find(item => String(item?.[field]) === String(id)) || null;
}

async function handleNflverse(path, method, query = {}) {
  if (method !== 'GET') {
    return jsonResponse(405, {
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed', status: 405 },
    });
  }

  if (path === '/nflverse/players') {
    const season = query.season === undefined ? null : parseSeason(query.season);
    const result = unwrap(await (season === null ? nflverseProvider.getPlayers() : nflverseProvider.getRosters(season)));
    let players = validateCollection(playerSchema, result.data, 'players');
    const q = normalizeText(query.q);
    const team = normalizeText(query.team);
    const position = normalizeText(query.position);
    players = players.filter(player => {
      if (q && !normalizeText(player.displayName).includes(q)) return false;
      if (team && normalizeText(player.teamId) !== team) return false;
      if (position && normalizeText(player.position) !== position) return false;
      return true;
    });
    players.sort((a, b) => a.displayName.localeCompare(b.displayName) || a.playerId.localeCompare(b.playerId));
    return jsonResponse(200, listBody(players, query, derivedMeta('players', season, [result.meta])));
  }

  let match = path.match(/^\/nflverse\/players\/([^/]+)$/);
  if (match) {
    const result = unwrap(await nflverseProvider.getPlayers());
    const players = validateCollection(playerSchema, result.data, 'players');
    const player = findById(players, decodeURIComponent(match[1]), 'playerId');
    if (!player) return notFound('Player');
    return jsonResponse(200, {
      data: validateOne(playerSchema, player, 'player'),
      meta: derivedMeta('player', null, [result.meta]),
    });
  }

  if (path === '/nflverse/teams') {
    const result = unwrap(await nflverseProvider.getTeams());
    let teams = validateCollection(teamSchema, result.data, 'teams');
    const q = normalizeText(query.q);
    if (q) {
      teams = teams.filter(team =>
        [team.teamId, team.abbreviation, team.city, team.name].some(value =>
          normalizeText(value).includes(q)
        )
      );
    }
    teams.sort((a, b) => a.teamId.localeCompare(b.teamId));
    return jsonResponse(200, listBody(teams, query, derivedMeta('teams', null, [result.meta])));
  }

  match = path.match(/^\/nflverse\/teams\/([^/]+)$/);
  if (match) {
    const result = unwrap(await nflverseProvider.getTeams());
    const teams = validateCollection(teamSchema, result.data, 'teams');
    const team = findById(teams, decodeURIComponent(match[1]), 'teamId');
    if (!team) return notFound('Team');
    return jsonResponse(200, {
      data: validateOne(teamSchema, team, 'team'),
      meta: derivedMeta('team', null, [result.meta]),
    });
  }

  if (path === '/nflverse/projections') {
    const season = parseSeason(query.season);
    const [playersResult, statsResult] = await Promise.all([
      nflverseProvider.getPlayers(),
      nflverseProvider.getWeeklyStats(season),
    ]);
    const players = unwrap(playersResult);
    const stats = unwrap(statsResult);
    const projections = validateCollection(
      projectionSchema,
      buildWeeklyProjections({
        players: players.data,
        weeklyStats: stats.data,
        season,
      }),
      'projections'
    );
    const throughWeek = projections.reduce(
      (max, item) => Math.max(max, ...item.sourceWeeks, 0),
      0
    );
    return jsonResponse(200, listBody(projections, query, derivedMeta(
      'projections',
      season,
      [players.meta, stats.meta],
      {
        week: throughWeek + 1,
        dataType: 'estimated-projection',
        estimated: true,
        methodology: 'Trailing average of up to four prior observed game weeks',
        scoringFormat: 'ppr',
      }
    )));
  }

  if (path === '/nflverse/rankings') {
    const season = parseSeason(query.season);
    const format = String(query.format || 'ppr').toLowerCase();
    if (format !== 'ppr') throw invalidRequest('Only ppr rankings are currently supported.');
    const [playersResult, statsResult] = await Promise.all([
      nflverseProvider.getPlayers(),
      nflverseProvider.getWeeklyStats(season),
    ]);
    const players = unwrap(playersResult);
    const stats = unwrap(statsResult);
    const rankings = validateCollection(
      rankingSchema,
      buildPprRankings({ players: players.data, weeklyStats: stats.data, season }),
      'rankings'
    );
    const week = rankings.reduce((max, item) => Math.max(max, item.throughWeek), 0);
    return jsonResponse(200, listBody(rankings, query, derivedMeta(
      'rankings',
      season,
      [players.meta, stats.meta],
      { week, dataType: 'observed-ranking', scoringFormat: 'ppr' }
    )));
  }

  if (path === '/nflverse/schedule') {
    const season = parseSeason(query.season);
    const week = parseWeek(query.week);
    const [scheduleResult, teamsResult] = await Promise.all([
      nflverseProvider.getSchedules(season),
      nflverseProvider.getTeams(),
    ]);
    const schedule = unwrap(scheduleResult);
    const teams = unwrap(teamsResult);
    const validatedTeams = validateCollection(teamSchema, teams.data, 'teams');
    const teamsById = new Map(validatedTeams.map(team => [team.teamId, team]));
    const games = validateCollection(
      scheduleGameSchema,
      schedule.data
        .filter(game => week === null || Number(game.week) === week)
        .map(game => ({
          ...game,
          homeTeam: teamsById.get(game.homeTeamId) || null,
          awayTeam: teamsById.get(game.awayTeamId) || null,
        })),
      'schedule'
    );
    return jsonResponse(200, listBody(games, query, derivedMeta(
      'schedule',
      season,
      [schedule.meta, teams.meta],
      { week }
    )));
  }

  if (path === '/nflverse/standings') {
    const season = parseSeason(query.season);
    const [scheduleResult, teamsResult] = await Promise.all([
      nflverseProvider.getSchedules(season),
      nflverseProvider.getTeams(),
    ]);
    const schedule = unwrap(scheduleResult);
    const teams = unwrap(teamsResult);
    const standings = validateCollection(
      standingsSchema,
      buildStandings(schedule.data, teams.data),
      'standings'
    );
    return jsonResponse(200, listBody(standings, query, derivedMeta(
      'standings',
      season,
      [schedule.meta, teams.meta]
    )));
  }

  if (path === '/nflverse/stats/weekly') {
    const season = parseSeason(query.season);
    const week = parseWeek(query.week);
    const result = unwrap(await nflverseProvider.getWeeklyStats(season));
    let stats = validateCollection(statSchema, result.data, 'weekly-stats');
    if (week !== null) stats = stats.filter(stat => stat.week === week);
    if (query.playerId) stats = stats.filter(stat => stat.playerId === String(query.playerId));
    return jsonResponse(200, listBody(stats, query, derivedMeta(
      'weekly-stats',
      season,
      [result.meta],
      { week, scope: 'week' }
    )));
  }

  if (path === '/nflverse/stats/seasonal') {
    const season = parseSeason(query.season);
    const result = unwrap(await nflverseProvider.getSeasonalStats(season));
    let stats = validateCollection(statSchema, result.data, 'seasonal-stats');
    if (query.playerId) stats = stats.filter(stat => stat.playerId === String(query.playerId));
    return jsonResponse(200, listBody(stats, query, derivedMeta(
      'seasonal-stats',
      season,
      [result.meta],
      { scope: 'season' }
    )));
  }

  match = path.match(/^\/nflverse\/schedules\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = unwrap(await nflverseProvider.getSchedules(season));
    return jsonResponse(200, {
      data: validateCollection(gameSchema, result.data, 'schedules'),
      provenance: { provider: 'nflverse', dataset: 'schedules', season },
    });
  }

  match = path.match(/^\/nflverse\/stats\/weekly\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = unwrap(await nflverseProvider.getWeeklyStats(season));
    return jsonResponse(200, {
      data: validateCollection(statSchema, result.data, 'weekly-stats'),
      provenance: { provider: 'nflverse', dataset: 'weekly_stats', season },
    });
  }

  match = path.match(/^\/nflverse\/stats\/seasonal\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = unwrap(await nflverseProvider.getSeasonalStats(season));
    return jsonResponse(200, {
      data: validateCollection(statSchema, result.data, 'seasonal-stats'),
      provenance: { provider: 'nflverse', dataset: 'seasonal_stats', season },
    });
  }

  return jsonResponse(404, {
    error: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
  });
}

async function handleCommandCenter(event, method) {
  if (!['GET', 'POST'].includes(method)) {
    return jsonResponse(405, {
      error: { message: 'Method not allowed', status: 405 },
    });
  }

  const req = {
    query: event.queryStringParameters || {},
    body: method === 'POST' ? parseBody(event) : {},
  };
  const params = parseRequestParams(req);
  const payload = await commandCenterService.loadCommandCenterView(params);
  return jsonResponse(200, createCommandCenterSuccessResponse(payload));
}

exports.handler = async event => {
  const method = String(event.httpMethod || 'GET').toUpperCase();
  const path = normalizePath(event.path);

  try {
    if (path === '/health') {
      return jsonResponse(200, {
        ok: true,
        service: 'fantasy-football-command-center',
      });
    }

    if (path === '/command-center') {
      return await handleCommandCenter(event, method);
    }

    if (path.startsWith('/nflverse/')) {
      return await handleNflverse(
        path,
        method,
        event.queryStringParameters || {}
      );
    }

    return jsonResponse(404, {
      error: { code: 'NOT_FOUND', message: 'Not found', status: 404 },
    });
  } catch (error) {
    const safeError = toSafeError(error);
    return jsonResponse(
      safeError.status || 500,
      createCriticalErrorResponse(error)
    );
  }
};

exports._test = {
  handleNflverse,
  normalizePath,
  parseSeason,
  parseWeek,
  unwrap,
};
