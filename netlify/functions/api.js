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
    const error = new Error('The request body contains invalid JSON.');
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    throw error;
  }
}

function parseSeason(value, fallback = new Date().getFullYear()) {
  const season = Number(value ?? fallback);
  if (!Number.isInteger(season) || season < 1920 || season > 2100) {
    const error = new Error('Invalid season parameter');
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    throw error;
  }
  return season;
}

function parseWeek(value) {
  if (value === undefined || value === null || value === '') return null;
  const week = Number(value);
  if (!Number.isInteger(week) || week < 1 || week > 30) {
    const error = new Error('Invalid week parameter');
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    throw error;
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
  return {
    resource,
    season,
    generatedAt: new Date().toISOString(),
    source: 'canonical-nfl-data',
    stale: sourceMeta.some(meta => meta?.cache?.cacheStatus === 'stale'),
    partial: sourceMeta.some(meta => Number(meta?.recordsSkipped || 0) > 0),
    sources: sourceMeta,
    ...extra,
  };
}

async function handleNflverse(path, method, query = {}) {
  if (method !== 'GET') {
    return jsonResponse(405, {
      error: { message: 'Method not allowed', status: 405 },
    });
  }

  if (path === '/nflverse/players') {
    const result = await nflverseProvider.getPlayers();
    return jsonResponse(200, {
      data: result,
      provenance: { provider: 'nflverse', dataset: 'players' },
    });
  }

  if (path === '/nflverse/teams') {
    const result = await nflverseProvider.getTeams();
    return jsonResponse(200, {
      data: result,
      provenance: { provider: 'nflverse', dataset: 'teams' },
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
    return jsonResponse(200, {
      data: {
        data: buildWeeklyProjections({
          players: players.data,
          weeklyStats: stats.data,
          season,
        }),
        meta: derivedMeta('projections', season, [players.meta, stats.meta], {
          dataType: 'estimated-projection',
          estimated: true,
          methodology: 'Trailing average of up to four prior observed game weeks',
          scoringFormat: 'ppr',
        }),
      },
    });
  }

  if (path === '/nflverse/rankings') {
    const season = parseSeason(query.season);
    const format = String(query.format || 'ppr').toLowerCase();
    if (format !== 'ppr') {
      return jsonResponse(400, {
        error: { message: 'Only ppr rankings are currently supported', status: 400 },
      });
    }
    const [playersResult, statsResult] = await Promise.all([
      nflverseProvider.getPlayers(),
      nflverseProvider.getWeeklyStats(season),
    ]);
    const players = unwrap(playersResult);
    const stats = unwrap(statsResult);
    return jsonResponse(200, {
      data: {
        data: buildPprRankings({
          players: players.data,
          weeklyStats: stats.data,
          season,
        }),
        meta: derivedMeta('rankings', season, [players.meta, stats.meta], {
          dataType: 'observed-ranking',
          scoringFormat: 'ppr',
        }),
      },
    });
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
    const teamsById = new Map(teams.data.map(team => [team.teamId, team]));
    return jsonResponse(200, {
      data: {
        data: schedule.data
          .filter(game => week === null || Number(game.week) === week)
          .map(game => ({
            ...game,
            homeTeam: teamsById.get(game.homeTeamId) || null,
            awayTeam: teamsById.get(game.awayTeamId) || null,
          })),
        meta: derivedMeta('schedule', season, [schedule.meta, teams.meta]),
      },
    });
  }

  if (path === '/nflverse/standings') {
    const season = parseSeason(query.season);
    const [scheduleResult, teamsResult] = await Promise.all([
      nflverseProvider.getSchedules(season),
      nflverseProvider.getTeams(),
    ]);
    const schedule = unwrap(scheduleResult);
    const teams = unwrap(teamsResult);
    return jsonResponse(200, {
      data: {
        data: buildStandings(schedule.data, teams.data),
        meta: derivedMeta('standings', season, [schedule.meta, teams.meta]),
      },
    });
  }

  let match = path.match(/^\/nflverse\/schedules\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = await nflverseProvider.getSchedules(season);
    return jsonResponse(200, {
      data: result,
      provenance: { provider: 'nflverse', dataset: 'schedules', season },
    });
  }

  match = path.match(/^\/nflverse\/stats\/weekly\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = await nflverseProvider.getWeeklyStats(season);
    return jsonResponse(200, {
      data: result,
      provenance: { provider: 'nflverse', dataset: 'weekly_stats', season },
    });
  }

  match = path.match(/^\/nflverse\/stats\/seasonal\/(\d{4})$/);
  if (match) {
    const season = parseSeason(match[1]);
    const result = await nflverseProvider.getSeasonalStats(season);
    return jsonResponse(200, {
      data: result,
      provenance: { provider: 'nflverse', dataset: 'seasonal_stats', season },
    });
  }

  return jsonResponse(404, { error: { message: 'Not found', status: 404 } });
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

    return jsonResponse(404, { error: { message: 'Not found', status: 404 } });
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
