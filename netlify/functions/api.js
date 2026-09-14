const {
  createCommandCenterSuccessResponse,
  createDefaultCommandCenterService,
  createDefaultNflverseProvider,
  parseRequestParams,
} = require('../../server/createApp');
const {
  createCriticalErrorResponse,
} = require('../../server/lib/commandCenterService');
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
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch (_error) {
    const error = new Error('The request body contains invalid JSON.');
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    throw error;
  }
}

function parseSeason(value) {
  const season = Number.parseInt(value, 10);
  if (!Number.isInteger(season) || season < 1900 || season > 2100) {
    const error = new Error('Invalid season parameter');
    error.status = 400;
    error.code = 'INVALID_REQUEST';
    throw error;
  }
  return season;
}

async function handleNflverse(path, method) {
  if (method !== 'GET') {
    return jsonResponse(405, { error: { message: 'Method not allowed', status: 405 } });
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
    return jsonResponse(405, { error: { message: 'Method not allowed', status: 405 } });
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
      return await handleNflverse(path, method);
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
