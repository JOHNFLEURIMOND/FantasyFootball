import analytics from './analytics.cjs';

const {
  bucketDuration,
  buildAnalyticsEvent,
  createAnalyticsTracker,
  sanitizeAnalyticsDetails,
} = analytics;

export {
  bucketDuration,
  buildAnalyticsEvent,
  createAnalyticsTracker,
  sanitizeAnalyticsDetails,
};

export default analytics;