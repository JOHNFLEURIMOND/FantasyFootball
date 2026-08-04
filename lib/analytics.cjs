const SAFE_ANALYTICS_KEYS = new Set([
  'outcome',
  'errorCategory',
  'resultCount',
  'cacheStatus',
  'durationBucket',
  'selectedWeek',
  'responseSource',
  'statePhase',
  'warningCount',
]);

const durationBuckets = [
  { max: 100, label: 'lt100ms' },
  { max: 250, label: 'lt250ms' },
  { max: 500, label: 'lt500ms' },
  { max: 1000, label: 'lt1s' },
  { max: 2500, label: 'lt2500ms' },
];

function bucketDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return 'unknown';
  }

  const match = durationBuckets.find(bucket => durationMs <= bucket.max);
  return match ? match.label : 'gte2500ms';
}

function sanitizeAnalyticsDetails(details = {}) {
  return Object.entries(details).reduce((accumulator, [key, value]) => {
    if (!SAFE_ANALYTICS_KEYS.has(key)) {
      return accumulator;
    }

    if (value === undefined || value === null) {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function buildAnalyticsEvent(event, details = {}) {
  const sanitizedDetails = sanitizeAnalyticsDetails(details);

  if (details.durationMs !== undefined && sanitizedDetails.durationBucket === undefined) {
    sanitizedDetails.durationBucket = bucketDuration(details.durationMs);
  }

  return {
    event,
    ...sanitizedDetails,
  };
}

function createAnalyticsTracker({ sink } = {}) {
  return {
    track(event, details = {}) {
      const analyticsEvent = buildAnalyticsEvent(event, details);

      if (typeof sink === 'function') {
        sink(analyticsEvent);
      }

      return analyticsEvent;
    },
  };
}

module.exports = {
  bucketDuration,
  buildAnalyticsEvent,
  createAnalyticsTracker,
  sanitizeAnalyticsDetails,
};
