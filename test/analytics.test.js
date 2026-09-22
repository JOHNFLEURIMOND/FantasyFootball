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
    getConsent: () => true,
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

test('duration buckets use exclusive upper bounds', () => {
  for (const [value, expected] of [
    [0, 'lt100ms'],
    [99, 'lt100ms'],
    [100, 'lt250ms'],
    [250, 'lt500ms'],
    [500, 'lt1s'],
    [1000, 'lt2500ms'],
    [2499, 'lt2500ms'],
    [2500, 'gte2500ms'],
    [NaN, 'unknown'],
    [Infinity, 'unknown'],
    ['100', 'unknown'],
  ])
    assert.equal(analytics.bucketDuration(value), expected);
});

test('allowed fields reject private objects, free text and invalid numbers', () => {
  assert.deepEqual(
    analytics.sanitizeAnalyticsDetails({
      outcome: { username: 'alice' },
      errorCategory: 'alice@example.test',
      cacheStatus: ['fresh'],
      durationBucket: 'https://example.test/?user=alice',
      resultCount: Infinity,
      warningCount: -1,
      selectedWeek: 23,
      responseSource: 'alice',
      statePhase: 'alice',
    }),
    {}
  );
  for (const value of [null, undefined, [], 'alice', 12]) {
    assert.deepEqual(analytics.sanitizeAnalyticsDetails(value), {});
  }
  assert.deepEqual(
    analytics.sanitizeAnalyticsDetails({
      resultCount: 10000,
      warningCount: 1000,
      selectedWeek: 22,
      errorCategory: 'UPSTREAM_TIMEOUT',
    }),
    {
      errorCategory: 'UPSTREAM_TIMEOUT',
      resultCount: 10000,
      warningCount: 1000,
      selectedWeek: 22,
    }
  );
  assert.deepEqual(
    analytics.sanitizeAnalyticsDetails({
      resultCount: 10001,
      warningCount: 1001,
      selectedWeek: 1.5,
    }),
    {}
  );
  assert.deepEqual(
    analytics.sanitizeAnalyticsDetails(Object.create({ outcome: 'success' })),
    {}
  );
});

test('unknown event names cannot reach the sink', () => {
  const events = [];
  const tracker = analytics.createAnalyticsTracker({
    getConsent: () => true,
    sink: event => events.push(event),
  });
  for (const name of [
    'alice@example.test',
    'page_view',
    '',
    null,
    {},
    '__proto__',
  ]) {
    assert.equal(analytics.buildAnalyticsEvent(name), null);
    assert.equal(tracker.track(name), null);
  }
  assert.deepEqual(events, []);
});

test('consent defaults off and only explicit current true permits delivery', () => {
  const events = [];
  const sink = event => events.push(event);
  assert.equal(
    analytics.createAnalyticsTracker({ sink }).track('league_selected'),
    null
  );
  let consent;
  const tracker = analytics.createAnalyticsTracker({
    sink,
    getConsent: () => consent,
  });
  for (consent of [undefined, null, false, 'true', 1]) {
    assert.equal(tracker.track('league_selected'), null);
  }
  consent = true;
  assert.deepEqual(tracker.track('league_selected'), {
    event: 'league_selected',
  });
  consent = false;
  assert.equal(tracker.track('league_selected'), null);
  consent = true;
  assert.equal(events.length, 1, 'no replay of pre-consent or revoked events');
  tracker.track('league_selected');
  assert.equal(events.length, 2);
});

test('consent and sink failures do not break application actions', () => {
  const failure = () => {
    throw new Error('unavailable');
  };
  assert.equal(
    analytics
      .createAnalyticsTracker({ getConsent: failure, sink: failure })
      .track('league_selected'),
    null
  );
  assert.equal(
    analytics
      .createAnalyticsTracker({ getConsent: () => true, sink: failure })
      .track('league_selected'),
    null
  );
  assert.deepEqual(analytics.buildAnalyticsEvent('league_selected', null), {
    event: 'league_selected',
  });
});
