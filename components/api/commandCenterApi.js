export async function fetchCommandCenterView({
  username,
  leagueId,
  season,
  week,
  signal,
} = {}) {
  const searchParams = new URLSearchParams();

  if (username) {
    searchParams.set('username', username);
  }

  if (leagueId) {
    searchParams.set('leagueId', leagueId);
  }

  if (season !== undefined && season !== null && season !== '') {
    searchParams.set('season', String(season));
  }

  if (week !== undefined && week !== null && week !== '') {
    searchParams.set('week', String(week));
  }

  const queryString = searchParams.toString();
  const response = await fetch(`/api/command-center${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.ok === false) {
    const safeError = payload?.error || {
      code: 'COMMAND_CENTER_ERROR',
      message: 'Unable to load the command center.',
      retryable: false,
      status: response.status,
    };

    const error = new Error(safeError.message);
    error.safe = safeError;
    throw error;
  }

  return payload.data;
}

export function getOverallCacheStatus(cache = {}) {
  const statuses = Object.values(cache)
    .map(entry => entry?.cacheStatus)
    .filter(Boolean);

  if (statuses.includes('stale')) {
    return 'stale';
  }

  if (statuses.includes('fresh')) {
    return 'fresh';
  }

  return 'miss';
}