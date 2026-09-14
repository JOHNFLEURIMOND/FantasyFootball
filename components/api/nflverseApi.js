const API_BASE = '/api/nflverse';

function normalizeError(payload, response) {
  const message =
    payload?.error?.message ||
    `NFL data request failed with status ${response.status}.`;
  const error = new Error(message);
  error.status = response.status;
  error.code = payload?.error?.code || 'NFL_DATA_REQUEST_FAILED';
  return error;
}

async function requestJson(path, { signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    if (!response.ok) {
      throw normalizeError(null, response);
    }
    throw new Error('NFL data service returned an invalid JSON response.');
  }

  if (!response.ok) {
    throw normalizeError(payload, response);
  }

  return payload;
}

function unwrapResource(payload) {
  const wrapped = payload?.data;

  if (Array.isArray(wrapped)) {
    return {
      data: wrapped,
      meta: payload?.provenance || null,
    };
  }

  if (wrapped && Array.isArray(wrapped.data)) {
    return {
      data: wrapped.data,
      meta: wrapped.meta || payload?.provenance || null,
    };
  }

  return {
    data: [],
    meta: wrapped?.meta || payload?.provenance || null,
  };
}

export function isStaleMeta(meta) {
  return (
    meta?.cacheState === 'stale' ||
    meta?.cacheStatus === 'stale' ||
    meta?.cache?.status === 'stale'
  );
}

export async function fetchPlayers(options) {
  return unwrapResource(await requestJson('/players', options));
}

export async function fetchTeams(options) {
  return unwrapResource(await requestJson('/teams', options));
}

export async function fetchWeeklyStats(season, options) {
  return unwrapResource(
    await requestJson(`/stats/weekly/${encodeURIComponent(season)}`, options)
  );
}

export async function fetchSchedule(season, options) {
  return unwrapResource(
    await requestJson(`/schedules/${encodeURIComponent(season)}`, options)
  );
}
