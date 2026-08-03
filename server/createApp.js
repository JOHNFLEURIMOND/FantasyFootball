const path = require('path');
const express = require('express');
const cors = require('cors');
const { createResourceCache } = require('./lib/cache');
const { createCommandCenterService, createCriticalErrorResponse } = require('./lib/commandCenterService');
const { createSleeperClient } = require('./lib/sleeperClient');
const { sleeperRequestSchema } = require('./lib/schemas');
const { toSafeError } = require('./lib/errors');
const { createAnalyticsTracker } = require('../lib/analytics');

function readRequestParams(req) {
  return {
    ...req.query,
    ...(req.body || {}),
  };
}

function createDefaultCommandCenterService() {
  const cache = createResourceCache();
  const provider = createSleeperClient({ cache });
  return createCommandCenterService({
    provider,
    tracker: createAnalyticsTracker(),
  });
}

function createApp({ commandCenterService = createDefaultCommandCenterService() } = {}) {
  const app = express();
  const buildDir = path.join(__dirname, '..', 'build');

  app.use(cors());
  app.use(express.json());
  app.use(express.static(buildDir));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'fantasy-football-command-center' });
  });

  app.get('/api/command-center', async (req, res) => {
    try {
      const params = sleeperRequestSchema.parse(readRequestParams(req));
      const payload = await commandCenterService.loadCommandCenterView(params);
      res.json({ ok: true, data: payload });
    } catch (error) {
      const safeError = toSafeError(error);
      res.status(safeError.status || 500).json(createCriticalErrorResponse(error));
    }
  });

  app.post('/api/command-center', async (req, res) => {
    try {
      const params = sleeperRequestSchema.parse(readRequestParams(req));
      const payload = await commandCenterService.loadCommandCenterView(params);
      res.json({ ok: true, data: payload });
    } catch (error) {
      const safeError = toSafeError(error);
      res.status(safeError.status || 500).json(createCriticalErrorResponse(error));
    }
  });

  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });

  return app;
}

module.exports = {
  createApp,
  createDefaultCommandCenterService,
};