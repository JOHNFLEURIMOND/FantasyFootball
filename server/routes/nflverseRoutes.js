const express = require('express');
const {
  buildPprRankings,
  buildStandings,
  buildWeeklyProjections,
} = require('../lib/fantasyMetrics');

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
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

function providerMeta(resource, season, sources = []) {
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
  };
}

function createNflverseRouter({ nflverseProvider }) {
  const router = express.Router();

  if (!nflverseProvider) {
    throw new Error('nflverseProvider dependency is required');
  }

  router.get(
    '/players',
    asyncHandler(async (_req, res) => {
      const players = await nflverseProvider.getPlayers();
      res.json({
        data: players,
        provenance: { provider: 'nflverse', dataset: 'players' },
      });
    })
  );

  router.get(
    '/teams',
    asyncHandler(async (_req, res) => {
      const teams = await nflverseProvider.getTeams();
      res.json({
        data: teams,
        provenance: { provider: 'nflverse', dataset: 'teams' },
      });
    })
  );

  router.get(
    '/projections',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.query.season);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }

      const [playersResult, statsResult] = await Promise.all([
        nflverseProvider.getPlayers(),
        nflverseProvider.getWeeklyStats(season),
      ]);
      const players = unwrap(playersResult);
      const stats = unwrap(statsResult);
      const projections = buildWeeklyProjections({
        players: players.data,
        weeklyStats: stats.data,
        season,
      });

      return res.json({
        data: {
          data: projections,
          meta: {
            ...providerMeta('projections', season, [players.meta, stats.meta]),
            dataType: 'estimated-projection',
            estimated: true,
            methodology: 'Trailing average of up to four prior observed game weeks',
            scoringFormat: 'ppr',
          },
        },
      });
    })
  );

  router.get(
    '/rankings',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.query.season);
      const format = String(req.query.format || 'ppr').toLowerCase();
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }
      if (format !== 'ppr') {
        return res.status(400).json({
          error: { message: 'Only ppr rankings are currently supported', status: 400 },
        });
      }

      const [playersResult, statsResult] = await Promise.all([
        nflverseProvider.getPlayers(),
        nflverseProvider.getWeeklyStats(season),
      ]);
      const players = unwrap(playersResult);
      const stats = unwrap(statsResult);
      const rankings = buildPprRankings({
        players: players.data,
        weeklyStats: stats.data,
        season,
      });

      return res.json({
        data: {
          data: rankings,
          meta: {
            ...providerMeta('rankings', season, [players.meta, stats.meta]),
            dataType: 'observed-ranking',
            scoringFormat: 'ppr',
          },
        },
      });
    })
  );

  router.get(
    '/schedule',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.query.season);
      const week = parseWeek(req.query.week);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }
      if (Number.isNaN(week)) {
        return res.status(400).json({
          error: { message: 'Invalid week parameter', status: 400 },
        });
      }

      const [scheduleResult, teamsResult] = await Promise.all([
        nflverseProvider.getSchedules(season),
        nflverseProvider.getTeams(),
      ]);
      const schedule = unwrap(scheduleResult);
      const teams = unwrap(teamsResult);
      const teamsById = new Map(teams.data.map(team => [team.teamId, team]));
      const games = schedule.data
        .filter(game => week === null || Number(game.week) === week)
        .map(game => ({
          ...game,
          homeTeam: teamsById.get(game.homeTeamId) || null,
          awayTeam: teamsById.get(game.awayTeamId) || null,
        }));

      return res.json({
        data: {
          data: games,
          meta: providerMeta('schedule', season, [schedule.meta, teams.meta]),
        },
      });
    })
  );

  router.get(
    '/standings',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.query.season);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }

      const [scheduleResult, teamsResult] = await Promise.all([
        nflverseProvider.getSchedules(season),
        nflverseProvider.getTeams(),
      ]);
      const schedule = unwrap(scheduleResult);
      const teams = unwrap(teamsResult);
      const standings = buildStandings(schedule.data, teams.data);

      return res.json({
        data: {
          data: standings,
          meta: providerMeta('standings', season, [schedule.meta, teams.meta]),
        },
      });
    })
  );

  router.get(
    '/schedules/:season',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.params.season, null);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }
      const schedules = await nflverseProvider.getSchedules(season);
      return res.json({
        data: schedules,
        provenance: { provider: 'nflverse', dataset: 'schedules', season },
      });
    })
  );

  router.get(
    '/stats/weekly/:season',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.params.season, null);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }
      const stats = await nflverseProvider.getWeeklyStats(season);
      return res.json({
        data: stats,
        provenance: { provider: 'nflverse', dataset: 'weekly_stats', season },
      });
    })
  );

  router.get(
    '/stats/seasonal/:season',
    asyncHandler(async (req, res) => {
      const season = parseSeason(req.params.season, null);
      if (season === null) {
        return res.status(400).json({
          error: { message: 'Invalid season parameter', status: 400 },
        });
      }
      const stats = await nflverseProvider.getSeasonalStats(season);
      return res.json({
        data: stats,
        provenance: { provider: 'nflverse', dataset: 'seasonal_stats', season },
      });
    })
  );

  router.get(
    '/metadata',
    asyncHandler(async (_req, res) => {
      if (typeof nflverseProvider.getMetadata !== 'function') {
        return res.json({ data: null });
      }
      return res.json({ data: await nflverseProvider.getMetadata() });
    })
  );

  router.post(
    '/refresh',
    asyncHandler(async (_req, res) => {
      if (typeof nflverseProvider.clearCache === 'function') {
        await nflverseProvider.clearCache();
      }
      return res.json({ success: true, clearedAt: new Date().toISOString() });
    })
  );

  router.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal server error',
        status: statusCode,
      },
    });
  });

  return router;
}

module.exports = {
  createNflverseRouter,
  parseSeason,
  parseWeek,
  unwrap,
};
