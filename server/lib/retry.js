const { isTransientError } = require('./errors');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(operation, options = {}) {
  const {
    retries = 2,
    delayMs = 150,
    factor = 2,
    sleep = delay,
    shouldRetry = isTransientError,
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delayMs * factor ** attempt;
      await sleep(waitTime);
      attempt += 1;
    }
  }

  throw lastError;
}

module.exports = {
  withRetry,
};