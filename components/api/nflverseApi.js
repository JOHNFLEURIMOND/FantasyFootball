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
    if (!response.ok) throw normalizeError(null, response);
    throw new Error('NFL data service returned an invalid JSON response.');
  }

  if (!response.ok) throw normalizeError(payload, response);
  return payload;
}

function unwrapResource(payload) {
  const wrapped = payload?.data;

  if (Array.isArray(wrapped)) {
    return { data: wrapped, meta: payload?.provenance || null };
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

function queryString(values) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function isStaleMeta(meta) {
  return (
    meta?.stale === true ||
    meta?.cacheState === 'stale' ||
    meta?.cacheStatus === 'stale' ||
    meta?.cache?.status === 'stale' ||
    meta?.cache?.cacheStatus === 'stale'
  );
}

export function isPartialMeta(meta) {
  return meta?.partial === true || meta?.status === 'partial';
}

export async function fetchPlayerPage({ page = 1, pageSize = 50, q, team, position, season, signal } = {}) {
  return unwrapResource(await requestJson(`/players${queryString({ page, pageSize, q, team, position, season })}`, { signal }));
}

export async function fetchPlayer(id, options) {
  const payload = await requestJson(`/players/${encodeURIComponent(id)}`, options);
  return { data: [payload.data], meta: payload.meta || payload.provenance || null };
}

// Existing research views need complete collections, not the API's first page.
async function fetchCollection(path, options) {
  const separator = path.includes('?') ? '&' : '?';
  const first = unwrapResource(await requestJson(`${path}${separator}pageSize=100&page=1`, options));
  const pages = first.meta?.totalPages || 1;
  if (!Number.isInteger(pages) || pages > 1000) throw new Error('Invalid pagination metadata.');
  const data = [...first.data];
  let stale = isStaleMeta(first.meta);
  let partial = isPartialMeta(first.meta);
  for (let page = 2; page <= pages; page += 4) {
    const batch = await Promise.all(Array.from({ length: Math.min(4, pages - page + 1) }, (_, offset) =>
      requestJson(`${path}${separator}pageSize=100&page=${page + offset}`, options).then(unwrapResource)
    ));
    for (const result of batch) {
      data.push(...result.data);
      stale ||= isStaleMeta(result.meta);
      partial ||= isPartialMeta(result.meta);
    }
  }
  return { data, meta: { ...first.meta, stale, partial } };
}

export async function fetchPlayers(options = {}) {
  return fetchCollection(`/players${queryString({ season: options.season })}`, options);
}

export async function fetchTeams(options) {
  return fetchCollection('/teams', options);
}

export async function fetchProjections(season, options) {
  return fetchCollection(`/projections${queryString({ season })}`, options);
}

export async function fetchRankings(season, format = 'ppr', options) {
  return fetchCollection(`/rankings${queryString({ season, format })}`, options);
}

export async function fetchSchedule(season, week, options) {
  return fetchCollection(`/schedule${queryString({ season, week })}`, options);
}

export async function fetchStandings(season, options) {
  return fetchCollection(`/standings${queryString({ season })}`, options);
}

export async function fetchWeeklyStats(season, options) {
  return unwrapResource(
    await requestJson(`/stats/weekly/${encodeURIComponent(season)}`, options)
  );
}

export async function fetchSeasonalStats(season, options) {
  return unwrapResource(
    await requestJson(`/stats/seasonal/${encodeURIComponent(season)}`, options)
  );
}

export { requestJson, unwrapResource };
