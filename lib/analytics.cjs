const ALLOWED_EVENTS = new Set([
  'command_center_load',
  'username_lookup_submitted',
  'league_selected',
  'matchup_week_changed',
]);

const durationBuckets = [
  { max: 100, label: 'lt100ms' },
  { max: 250, label: 'lt250ms' },
  { max: 500, label: 'lt500ms' },
  { max: 1000, label: 'lt1s' },
  { max: 2500, label: 'lt2500ms' },
];

const oneOf = values => value => values.includes(value);
const integerBetween = (min, max) => value =>
  Number.isInteger(value) && value >= min && value <= max;

// Fixed vocabularies prevent identifiers or free-form text in allowed fields.
const validators = {
  outcome: oneOf(['success', 'partial', 'failure']),
  errorCategory: oneOf([
    'UNKNOWN_ERROR',
    'INTERNAL_ERROR',
    'INVALID_REQUEST',
    'API_RESPONSE_INVALID',
    'SERVICE_RESPONSE_INVALID',
    'UPSTREAM_TIMEOUT',
    'UPSTREAM_NOT_FOUND',
    'UPSTREAM_ERROR',
    'UPSTREAM_INVALID_JSON',
    'UPSTREAM_RESPONSE_INVALID',
  ]),
  resultCount: integerBetween(0, 10000),
  warningCount: integerBetween(0, 1000),
  selectedWeek: integerBetween(0, 22),
  cacheStatus: oneOf(['fresh', 'stale', 'miss']),
  durationBucket: oneOf([
    ...durationBuckets.map(bucket => bucket.label),
    'gte2500ms',
    'unknown',
  ]),
};

function bucketDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return 'unknown';
  const match = durationBuckets.find(bucket => durationMs < bucket.max);
  return match ? match.label : 'gte2500ms';
}

function validDetails(details) {
  return (
    details !== null && typeof details === 'object' && !Array.isArray(details)
  );
}

function sanitizeAnalyticsDetails(details = {}) {
  if (!validDetails(details)) return {};
  return Object.entries(validators).reduce((result, [key, validate]) => {
    if (
      Object.prototype.hasOwnProperty.call(details, key) &&
      validate(details[key])
    ) {
      result[key] = details[key];
    }
    return result;
  }, {});
}

function buildAnalyticsEvent(event, details = {}) {
  if (!ALLOWED_EVENTS.has(event)) return null;
  const sanitizedDetails = sanitizeAnalyticsDetails(details);
  if (
    validDetails(details) &&
    Object.prototype.hasOwnProperty.call(details, 'durationMs') &&
    sanitizedDetails.durationBucket === undefined
  ) {
    sanitizedDetails.durationBucket = bucketDuration(details.durationMs);
  }
  return { event, ...sanitizedDetails };
}

// Consent is read for every emission so withdrawal takes effect immediately.
// No queue: events attempted before consent are never replayed.
function createAnalyticsTracker({ sink, getConsent = () => false } = {}) {
  return {
    track(event, details = {}) {
      try {
        if (typeof getConsent !== 'function' || getConsent() !== true)
          return null;
        const analyticsEvent = buildAnalyticsEvent(event, details);
        if (!analyticsEvent) return null;
        if (typeof sink === 'function') sink(analyticsEvent);
        return analyticsEvent;
      } catch {
        // Optional telemetry must not turn a successful application action into an error.
        return null;
      }
    },
  };
}

module.exports = {
  bucketDuration,
  buildAnalyticsEvent,
  createAnalyticsTracker,
  sanitizeAnalyticsDetails,
};
