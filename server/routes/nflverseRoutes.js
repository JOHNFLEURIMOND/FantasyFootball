const express = require('express');

/**
 * Creates an Express router configured with nflverse provider dependencies.
 * @param {Object} options
 * @param {Object} options.nflverseProvider - Provider instance handling caching & parsing
 * @returns {express.Router}
 */
function createNflverseRouter({ nflverseProvider }) {
  const router = express.Router();

  if (!nflverseProvider) {
    throw new Error('nflverseProvider dependency is required');
  }

  // Wrapper for async route handling & error delegation
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // GET /api/nflverse/players
  router.get('/players', asyncHandler(async (req, res) => {
    const players = await nflverseProvider.getPlayers();
    res.json({ data: players, provenance: { provider: 'nflverse', dataset: 'players' } });
  }));

  // GET /api/nflverse/teams
  router.get('/teams', asyncHandler(async (req, res) => {
    const teams = await nflverseProvider.getTeams();
    res.json({ data: teams, provenance: { provider: 'nflverse', dataset: 'teams' } });
  }));

  // GET /api/nflverse/schedules/:season
  router.get('/schedules/:season', asyncHandler(async (req, res) => {
    const season = parseInt(req.params.season, 10);
    if (isNaN(season)) {
      return res.status(400).json({ error: { message: 'Invalid season parameter', status: 400 } });
    }
    const schedules = await nflverseProvider.getSchedules(season);
    res.json({ data: schedules, provenance: { provider: 'nflverse', dataset: 'schedules', season } });
  }));

  // GET /api/nflverse/stats/weekly/:season
  router.get('/stats/weekly/:season', asyncHandler(async (req, res) => {
    const season = parseInt(req.params.season, 10);
    if (isNaN(season)) {
      return res.status(400).json({ error: { message: 'Invalid season parameter', status: 400 } });
    }
    const stats = await nflverseProvider.getWeeklyStats(season);
    res.json({ data: stats, provenance: { provider: 'nflverse', dataset: 'weekly_stats', season } });
  }));

  // GET /api/nflverse/stats/seasonal/:season
  router.get('/stats/seasonal/:season', asyncHandler(async (req, res) => {
    const season = parseInt(req.params.season, 10);
    if (isNaN(season)) {
      return res.status(400).json({ error: { message: 'Invalid season parameter', status: 400 } });
    }
    const stats = await nflverseProvider.getSeasonalStats(season);
    res.json({ data: stats, provenance: { provider: 'nflverse', dataset: 'seasonal_stats', season } });
  }));

  // GET /api/nflverse/metadata
  router.get('/metadata', asyncHandler(async (req, res) => {
    const metadata = await nflverseProvider.getMetadata();
    res.json({ data: metadata });
  }));

  // POST /api/nflverse/refresh
  router.post('/refresh', asyncHandler(async (req, res) => {
    const result = await nflverseProvider.clearCache();
    res.json({ success: true, clearedAt: new Date().toISOString() });
  }));

  // Safe error handling middleware
  router.use((err, req, res, next) => {
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

module.exports = { createNflverseRouter };