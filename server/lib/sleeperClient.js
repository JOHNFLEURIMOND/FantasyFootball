const { createResourceCache } = require('./cache');
const {
  createSafeError,
  isTransientError,
  toSafeError,
} = require('./errors');
const {
  sleeperDraftSchema,
  sleeperLeagueSchema,
  sleeperMatchupSchema,
  sleeperNflStateSchema,
  sleeperRosterSchema,
  sleeperUserSchema,
} = require('./schemas');
const { withRetry } = require('./retry');

function toPathSegment(value) {
  return encodeURIComponent(String(value));
}

function buildHttpError(status, path) {
  return createSafeError({
    code: status === 404 ? 'UPSTREAM_NOT_FOUND' : 'UPSTREAM_ERROR',
    message:
      status === 404
        ? `The requested Sleeper resource was not found at ${path}.`
        : 'The upstream provider returned an error.',
    status,
    retryable: [408, 429, 500, 502, 503, 504].includes(status),
    resource: path,
  });
}

function parseJsonResponse(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw createSafeError({
      code: 'UPSTREAM_INVALID_JSON',
      message: 'The upstream provider returned invalid JSON.',
      status: 502,
      retryable: false,
    });
  }
}

function createSleeperClient({
  baseUrl = 'https://api.sleeper.app/v1',
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
  retries = 2,
  cache = createResourceCache(),
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required.');
  }

  async function requestJson({ path, schema, cacheKey, ttlMs, staleTtlMs }) {
    return cache.getOrLoad(
      cacheKey,
      async () =>
        withRetry(
          async () => {
            const controller = new AbortController();
            const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

            try {
              const response = await fetchImpl(`${baseUrl}${path}`, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                },
                signal: controller.signal,
              });

              const text = await response.text();

              if (!response.ok) {
                throw buildHttpError(response.status, path);
              }

              const payload = parseJsonResponse(text);
              const parsed = schema.safeParse(payload);

              if (!parsed.success) {
                throw createSafeError({
                  code: 'UPSTREAM_RESPONSE_INVALID',
                  message: 'The upstream provider returned an unexpected response shape.',
                  status: 502,
                  retryable: false,
                });
              }

              return parsed.data;
            } finally {
              clearTimeout(timeoutHandle);
            }
          },
          {
            retries,
            shouldRetry: isTransientError,
          }
        ),
      {
        ttlMs,
        staleTtlMs,
      }
    );
  }

  return {
    getNflState() {
      return requestJson({
        path: '/state/nfl',
        schema: sleeperNflStateSchema,
        cacheKey: 'sleeper:nfl-state',
        ttlMs: 60 * 1000,
        staleTtlMs: 5 * 60 * 1000,
      });
    },
    getUser(username) {
      const normalizedUsername = String(username || '').trim().toLowerCase();

      return requestJson({
        path: `/user/${toPathSegment(username)}`,
        schema: sleeperUserSchema,
        cacheKey: `sleeper:user:${normalizedUsername}`,
        ttlMs: 10 * 60 * 1000,
        staleTtlMs: 60 * 60 * 1000,
      });
    },
    getUserLeagues(userId, season) {
      return requestJson({
        path: `/user/${toPathSegment(userId)}/leagues/nfl/${toPathSegment(season)}`,
        schema: sleeperLeagueSchema.array(),
        cacheKey: `sleeper:user-leagues:${userId}:${season}`,
        ttlMs: 10 * 60 * 1000,
        staleTtlMs: 60 * 60 * 1000,
      });
    },
    getLeague(leagueId) {
      return requestJson({
        path: `/league/${toPathSegment(leagueId)}`,
        schema: sleeperLeagueSchema,
        cacheKey: `sleeper:league:${leagueId}`, 
        ttlMs: 30 * 60 * 1000,
        staleTtlMs: 2 * 60 * 60 * 1000,
      });
    },
    getLeagueRosters(leagueId) {
      return requestJson({
        path: `/league/${toPathSegment(leagueId)}/rosters`,
        schema: sleeperRosterSchema.array(),
        cacheKey: `sleeper:league-rosters:${leagueId}`,
        ttlMs: 30 * 60 * 1000,
        staleTtlMs: 2 * 60 * 60 * 1000,
      });
    },
    getLeagueUsers(leagueId) {
      return requestJson({
        path: `/league/${toPathSegment(leagueId)}/users`,
        schema: sleeperUserSchema.array(),
        cacheKey: `sleeper:league-users:${leagueId}`,
        ttlMs: 30 * 60 * 1000,
        staleTtlMs: 2 * 60 * 60 * 1000,
      });
    },
    getLeagueDrafts(leagueId) {
      return requestJson({
        path: `/league/${toPathSegment(leagueId)}/drafts`,
        schema: sleeperDraftSchema.array(),
        cacheKey: `sleeper:league-drafts:${leagueId}`,
        ttlMs: 30 * 60 * 1000,
        staleTtlMs: 2 * 60 * 60 * 1000,
      });
    },
    getLeagueMatchups(leagueId, week) {
      return requestJson({
        path: `/league/${toPathSegment(leagueId)}/matchups/${toPathSegment(week)}`,
        schema: sleeperMatchupSchema.array(),
        cacheKey: `sleeper:league-matchups:${leagueId}:${week}`,
        ttlMs: 60 * 1000,
        staleTtlMs: 10 * 60 * 1000,
      });
    },
    toSafeError,
  };
}

module.exports = {
  createSleeperClient,
};