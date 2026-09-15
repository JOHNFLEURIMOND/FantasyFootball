const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  DEFAULT_DATABASE_PATH,
  parseRuntimeConfig,
} = require('../server/lib/runtimeConfig');

test('runtime config supplies safe local defaults', () => {
  const config = parseRuntimeConfig({});
  assert.equal(config.nodeEnv, 'development');
  assert.equal(config.port, 8080);
  assert.equal(config.nflDataDbPath, DEFAULT_DATABASE_PATH);
});

test('runtime config accepts explicit supported values', () => {
  const databasePath = path.join('/tmp', 'fantasy-football.sqlite');
  const config = parseRuntimeConfig({
    NODE_ENV: 'production',
    PORT: '9090',
    NFL_DATA_DB_PATH: databasePath,
  });
  assert.deepEqual(config, {
    nodeEnv: 'production',
    port: 9090,
    nflDataDbPath: databasePath,
  });
});

test('runtime config rejects invalid ports and runtime modes with actionable errors', () => {
  assert.throws(
    () => parseRuntimeConfig({ NODE_ENV: 'staging', PORT: '99999' }),
    error =>
      error.code === 'RUNTIME_CONFIG_INVALID' &&
      /NODE_ENV/.test(error.message) &&
      /PORT/.test(error.message)
  );
});

test('runtime config rejects empty database paths', () => {
  assert.throws(
    () => parseRuntimeConfig({ NFL_DATA_DB_PATH: '   ' }),
    error =>
      error.code === 'RUNTIME_CONFIG_INVALID' &&
      /NFL_DATA_DB_PATH/.test(error.message)
  );
});
