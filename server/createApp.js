const path = require('path');
const express = require('express');
const cors = require('cors');
const { createResourceCache } = require('./lib/cache');
const {
  createCommandCenterService,
  createCriticalErrorResponse,
} = require('./lib/commandCenterService');
const { parseContract } = require('./lib/contractValidation');
const { commandCenterApiResponseSchema } = require('./lib/domainSchemas');
const { createSleeperClient } = require('./lib/sleeperClient');
const { sleeperRequestSchema } = require('./lib/schemas');
const { createSafeError, toSafeError } = require('./lib/errors');
const { createAnalyticsTracker } = require('../lib/analytics.cjs');

function readRequestParams(req) {
  return {
    ...req.query,
    ...(req.body || {}),
  };
}

function parseRequestParams(req) {
  return parseContract(sleeperRequestSchema, readRequestParams(req), {
    code: 'INVALID_REQUEST',
    message: 'The request parameters are invalid.',
    resource: 'command-center-request',
    status: 400,
  });
}

function createCommandCenterSuccessResponse(payload) {
  return parseContract(
    commandCenterApiResponseSchema,
    { ok: true, data: payload },
    {
      code: 'API_RESPONSE_INVALID',
      message: 'The API produced an invalid response.',
      resource: 'command-center-response',
    }
  );
}

function normalizeRequestBodyError(error) {
  const isBodyParserClientError =
    typeof error?.type === 'string' &&
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500;

  if (!isBodyParserClientError) {
    return error;
  }

  return createSafeError({
    code: 'INVALID_REQUEST',
    message:
      error.type === 'entity.too.large'
        ? 'The request body exceeds the allowed size.'
        : 'The request body contains invalid JSON.',
    status: error.status,
    retryable: false,
    resource: 'request-body',
  });
}

function createDefaultCommandCenterService() {
  const cache = createResourceCache();
  const provider = createSleeperClient({ cache });
  return createCommandCenterService({
    provider,
    tracker: createAnalyticsTracker(),
  });
}

function createApp({
  commandCenterService = createDefaultCommandCenterService(),
} = {}) {
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
      const params = parseRequestParams(req);
      const payload = await commandCenterService.loadCommandCenterView(params);
      res.json(createCommandCenterSuccessResponse(payload));
    } catch (error) {
      const safeError = toSafeError(error);
      res
        .status(safeError.status || 500)
        .json(createCriticalErrorResponse(error));
    }
  });

  app.post('/api/command-center', async (req, res) => {
    try {
      const params = parseRequestParams(req);
      const payload = await commandCenterService.loadCommandCenterView(params);
      res.json(createCommandCenterSuccessResponse(payload));
    } catch (error) {
      const safeError = toSafeError(error);
      res
        .status(safeError.status || 500)
        .json(createCriticalErrorResponse(error));
    }
  });

  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });

  app.use((error, _req, res, _next) => {
    const normalizedError = normalizeRequestBodyError(error);
    const safeError = toSafeError(normalizedError);

    res
      .status(safeError.status || 500)
      .json(createCriticalErrorResponse(normalizedError));
  });

  return app;
}

module.exports = {
  createApp,
  createCommandCenterSuccessResponse,
  createDefaultCommandCenterService,
  normalizeRequestBodyError,
  parseRequestParams,
};
