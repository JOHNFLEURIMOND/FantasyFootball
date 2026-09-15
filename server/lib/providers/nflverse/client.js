const { createResourceCache } = require('../../cache');
const { createSafeError, isTransientError } = require('../../errors');
const { withRetry } = require('../../retry');
const { buildDatasetDescriptor } = require('./config');
const { parseCsvObjects } = require('./csv');

const DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024 * 1024;

function buildHttpError(status, dataset) {
  return createSafeError({
    code: status === 404 ? 'NFLVERSE_DATASET_NOT_FOUND' : 'UPSTREAM_ERROR',
    message:
      status === 404
        ? 'The requested nflverse dataset is not available.'
        : 'The nflverse provider returned an error.',
    status: status === 404 ? 404 : 502,
    retryable: [408, 429, 500, 502, 503, 504].includes(status),
    resource: dataset,
  });
}

function parseCsv(text, dataset) {
  try {
    return parseCsvObjects(text);
  } catch (error) {
    const safeError = createSafeError({
      code: 'NFLVERSE_CSV_INVALID',
      message: 'The nflverse dataset could not be parsed.',
      status: 502,
      retryable: false,
      resource: dataset,
    });
    safeError.cause = error;
    throw safeError;
  }
}

function headerValue(response, name) {
  return response.headers?.get?.(name) || null;
}

function parseHttpDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createNflverseClient({
  fetchImpl = globalThis.fetch,
  timeoutMs = 30_000,
  retries = 2,
  maxResponseBytes = DEFAULT_MAX_RESPONSE_BYTES,
  cache = createResourceCache(),
  now = () => new Date(),
  ttlMs = 6 * 60 * 60 * 1000,
  staleTtlMs = 24 * 60 * 60 * 1000,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A fetch implementation is required.');
  }

  async function download(descriptor) {
    return withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetchImpl(descriptor.url, {
            method: 'GET',
            headers: { Accept: 'text/csv' },
            signal: controller.signal,
          });

          if (!response.ok) {
            throw buildHttpError(response.status, descriptor.dataset);
          }

          const contentLength = Number(headerValue(response, 'content-length'));
          if (
            Number.isFinite(contentLength) &&
            contentLength > maxResponseBytes
          ) {
            throw createSafeError({
              code: 'NFLVERSE_DATASET_TOO_LARGE',
              message:
                'The nflverse dataset exceeds the configured size limit.',
              status: 502,
              retryable: false,
              resource: descriptor.dataset,
            });
          }

          const text = await response.text();
          if (Buffer.byteLength(text, 'utf8') > maxResponseBytes) {
            throw createSafeError({
              code: 'NFLVERSE_DATASET_TOO_LARGE',
              message:
                'The nflverse dataset exceeds the configured size limit.',
              status: 502,
              retryable: false,
              resource: descriptor.dataset,
            });
          }

          const fetchedAt = now().toISOString();
          const lastModified = headerValue(response, 'last-modified');
          const etag = headerValue(response, 'etag');

          return {
            rows: parseCsv(text, descriptor.dataset),
            source: {
              fetchedAt,
              sourceUpdatedAt: parseHttpDate(lastModified),
              datasetVersion:
                etag || lastModified || `release:${descriptor.releaseTag}`,
            },
          };
        } catch (cause) {
          if (cause?.isSafeError) {
            throw cause;
          }
          const error = createSafeError({
            code:
              cause?.name === 'AbortError'
                ? 'UPSTREAM_TIMEOUT'
                : 'UPSTREAM_UNAVAILABLE',
            message:
              cause?.name === 'AbortError'
                ? 'The nflverse provider timed out.'
                : 'The nflverse provider is temporarily unavailable.',
            status: cause?.name === 'AbortError' ? 504 : 502,
            retryable: true,
            resource: descriptor.dataset,
          });
          error.cause = cause;
          throw error;
        } finally {
          clearTimeout(timeoutHandle);
        }
      },
      { retries, shouldRetry: isTransientError }
    );
  }

  async function getDataset(dataset, season) {
    const descriptor = buildDatasetDescriptor(dataset, season, { now: now() });
    const cacheKey = `nflverse:${dataset}:${descriptor.season ?? 'all'}`;
    const result = await cache.getOrLoad(cacheKey, () => download(descriptor), {
      ttlMs,
      staleTtlMs,
    });

    return {
      descriptor,
      rows: result.value.rows,
      source: result.value.source,
      cache: result.meta,
    };
  }

  function clearCache() {
    cache.clear();
  }

  return { clearCache, getDataset };
}

module.exports = {
  DEFAULT_MAX_RESPONSE_BYTES,
  createNflverseClient,
  parseHttpDate,
  parseCsv,
};
