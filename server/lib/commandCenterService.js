const { createAnalyticsTracker, buildAnalyticsEvent } = require('../../lib/analytics');
const {
  createSafeError,
  toSafeError,
} = require('./errors');
const {
  attachMatchupOpponents,
  normalizeDraft,
  normalizeLeague,
  normalizeMatchup,
  normalizeNflState,
  normalizeRoster,
  normalizeUser,
} = require('./normalize');

function resolveRequestedWeek(nflState, requestedWeek) {
  if (Number.isInteger(requestedWeek)) {
    return requestedWeek;
  }

  if (nflState.displayWeek && nflState.displayWeek > 0) {
    return nflState.displayWeek;
  }

  if (nflState.currentWeek && nflState.currentWeek > 0) {
    return nflState.currentWeek;
  }

  return 0;
}

function resolveRequestedSeason(nflState, requestedSeason) {
  if (Number.isInteger(requestedSeason)) {
    return String(requestedSeason);
  }

  return nflState.leagueSeason || nflState.season;
}

function buildAvailableWeeks(currentWeek) {
  if (!Number.isInteger(currentWeek) || currentWeek < 1) {
    return [];
  }

  return Array.from({ length: currentWeek }, (_, index) => index + 1);
}

function unwrapProviderResult(result) {
  if (result && typeof result === 'object' && ('value' in result || 'data' in result || 'meta' in result)) {
    return {
      value: result.value ?? result.data ?? result,
      meta: result.meta || {},
    };
  }

  return {
    value: result,
    meta: {},
  };
}

function createCommandCenterService({ provider, tracker = createAnalyticsTracker() } = {}) {
  if (!provider) {
    throw new Error('A provider implementation is required.');
  }

  async function loadCommandCenterView({ username, leagueId, season, week } = {}) {
    const requestStartedAt = Date.now();
    const warnings = [];

    const nflStateResult = unwrapProviderResult(await provider.getNflState());
    const nflState = normalizeNflState(nflStateResult.value);
    const resolvedSeason = resolveRequestedSeason(nflState, season);
    const resolvedWeek = resolveRequestedWeek(nflState, week);
    const availableWeeks = buildAvailableWeeks(nflState.currentWeek);

    const response = {
      provider: 'sleeper',
      nflState,
      resolvedSeason,
      resolvedWeek,
      availableWeeks,
      user: null,
      leagues: [],
      selectedLeague: null,
      rosters: [],
      leagueUsers: [],
      drafts: [],
      matchups: [],
      warnings,
      meta: {
        cache: {
          nflState: nflStateResult.meta,
        },
      },
    };

    if (username) {
      const userResult = unwrapProviderResult(await provider.getUser(username));
      response.user = normalizeUser(userResult.value);
      response.meta.cache.user = userResult.meta;

      const leaguesResult = unwrapProviderResult(await provider.getUserLeagues(response.user.userId, resolvedSeason));
      response.leagues = leaguesResult.value.map(normalizeLeague);
      response.meta.cache.leagues = leaguesResult.meta;
    }

    if (leagueId) {
      const leagueResult = unwrapProviderResult(await provider.getLeague(leagueId));
      response.selectedLeague = normalizeLeague(leagueResult.value);
      response.meta.cache.league = leagueResult.meta;

      const [rostersResult, usersResult, draftsResult] = await Promise.all([
        provider.getLeagueRosters(leagueId).then(unwrapProviderResult).catch(error => ({ error })),
        provider.getLeagueUsers(leagueId).then(unwrapProviderResult).catch(error => ({ error })),
        provider.getLeagueDrafts(leagueId).then(unwrapProviderResult).catch(error => ({ error })),
      ]);

      let leagueUsers = [];
      if (usersResult.error) {
        const safeError = toSafeError(usersResult.error);
        warnings.push({
          code: safeError.code,
          message: safeError.message,
          retryable: safeError.retryable,
          resource: 'leagueUsers',
        });
      } else {
        leagueUsers = usersResult.value.map(normalizeUser);
        response.leagueUsers = leagueUsers;
        response.meta.cache.leagueUsers = usersResult.meta;
      }

      const leagueUsersById = new Map(leagueUsers.map(user => [user.userId, user]));

      if (rostersResult.error) {
        const safeError = toSafeError(rostersResult.error);
        warnings.push({
          code: safeError.code,
          message: safeError.message,
          retryable: safeError.retryable,
          resource: 'rosters',
        });
      } else {
        response.rosters = (rostersResult.value || rostersResult.data).map(rawRoster =>
          normalizeRoster(rawRoster, leagueUsersById)
        );
        response.meta.cache.rosters = rostersResult.meta;
      }

      if (draftsResult.error) {
        const safeError = toSafeError(draftsResult.error);
        warnings.push({
          code: safeError.code,
          message: safeError.message,
          retryable: safeError.retryable,
          resource: 'drafts',
        });
      } else {
        response.drafts = draftsResult.value.map(normalizeDraft);
        response.meta.cache.drafts = draftsResult.meta;
      }

      if (resolvedWeek > 0) {
        const matchupsResult = await provider.getLeagueMatchups(leagueId, resolvedWeek).then(unwrapProviderResult).catch(error => ({ error }));

        if (matchupsResult.error) {
          const safeError = toSafeError(matchupsResult.error);
          warnings.push({
            code: safeError.code,
            message: safeError.message,
            retryable: safeError.retryable,
            resource: 'matchups',
          });
        } else {
          const normalizedMatchups = matchupsResult.value.map(normalizeMatchup);
          response.matchups = attachMatchupOpponents(normalizedMatchups);
          response.meta.cache.matchups = matchupsResult.meta;
        }
      }
    }

    response.meta.request = {
      usernameSubmitted: Boolean(username),
      leagueSelected: Boolean(leagueId),
      season: resolvedSeason,
      week: resolvedWeek,
      durationBucket: buildAnalyticsEvent('command_center_load', {
        durationMs: Date.now() - requestStartedAt,
      }).durationBucket,
      warningCount: warnings.length,
    };

    tracker.track('command_center_load', {
      outcome: 'success',
      selectedWeek: resolvedWeek,
      cacheStatus: response.meta.cache.matchups?.cacheStatus || response.meta.cache.league?.cacheStatus || response.meta.cache.leagues?.cacheStatus || response.meta.cache.nflState?.cacheStatus || 'miss',
      warningCount: warnings.length,
      durationMs: Date.now() - requestStartedAt,
    });

    return response;
  }

  return {
    loadCommandCenterView,
    resolveRequestedSeason,
    resolveRequestedWeek,
    buildAvailableWeeks,
  };
}

function createCriticalErrorResponse(error) {
  const safeError = toSafeError(error);

  return {
    ok: false,
    error: {
      code: safeError.code,
      message: safeError.message,
      retryable: safeError.retryable,
      status: safeError.status,
    },
  };
}

module.exports = {
  createCommandCenterService,
  createCriticalErrorResponse,
  createSafeError,
  unwrapProviderResult,
  resolveRequestedSeason,
  resolveRequestedWeek,
};