const path = require('node:path');
const { z } = require('zod');

const DEFAULT_DATABASE_PATH = path.join(process.cwd(), 'data', 'nfl-data.sqlite');

const runtimeEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080),
    NFL_DATA_DB_PATH: z.string().trim().min(1).default(DEFAULT_DATABASE_PATH),
  })
  .passthrough();

function formatConfigError(error) {
  const issues = error?.issues || [];
  if (issues.length === 0) return 'Runtime configuration is invalid.';

  return `Runtime configuration is invalid:\n${issues
    .map(issue => `- ${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('\n')}`;
}

function parseRuntimeConfig(environment = process.env) {
  const result = runtimeEnvironmentSchema.safeParse(environment);
  if (!result.success) {
    const error = new Error(formatConfigError(result.error));
    error.code = 'RUNTIME_CONFIG_INVALID';
    error.cause = result.error;
    throw error;
  }

  return Object.freeze({
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    nflDataDbPath: result.data.NFL_DATA_DB_PATH,
  });
}

module.exports = {
  DEFAULT_DATABASE_PATH,
  formatConfigError,
  parseRuntimeConfig,
  runtimeEnvironmentSchema,
};
