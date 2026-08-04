const test = require('node:test');
const assert = require('node:assert/strict');

const analytics = require('../lib/analytics.cjs');

test('analytics module exports the expected public API', () => {
  assert.equal(typeof analytics.bucketDuration, 'function');
  assert.equal(typeof analytics.buildAnalyticsEvent, 'function');
  assert.equal(typeof analytics.createAnalyticsTracker, 'function');
  assert.equal(typeof analytics.sanitizeAnalyticsDetails, 'function');
});

test('analytics helpers bucket, sanitize, and forward events safely', () => {
  assert.equal(analytics.bucketDuration(-1), 'unknown');
  assert.equal(analytics.bucketDuration(240), 'lt250ms');
  assert.equal(analytics.bucketDuration(4000), 'gte2500ms');

  assert.deepEqual(
    analytics.sanitizeAnalyticsDetails({
      outcome: 'success',
      cacheStatus: 'fresh',
      username: 'alice',
      durationMs: 200,
      warningCount: 1,
    }),
    {
      outcome: 'success',
      cacheStatus: 'fresh',
      warningCount: 1,
    }
  );

  const events = [];
  const tracker = analytics.createAnalyticsTracker({
    sink: event => events.push(event),
  });

  const event = tracker.track('command_center_load', {
    outcome: 'success',
    durationMs: 240,
    leagueId: 'hidden',
  });

  assert.deepEqual(event, {
    event: 'command_center_load',
    outcome: 'success',
    durationBucket: 'lt250ms',
  });
  assert.deepEqual(events, [event]);
});