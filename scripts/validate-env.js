#!/usr/bin/env node

const { parseRuntimeConfig } = require('../server/lib/runtimeConfig');

try {
  const config = parseRuntimeConfig(process.env);
  process.stdout.write(
    `Runtime configuration valid (${config.nodeEnv}, port ${config.port}).\n`
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
