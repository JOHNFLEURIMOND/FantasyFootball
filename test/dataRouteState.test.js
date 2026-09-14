const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const { resolveDataRouteState } = require('../components/routing/dataRouteState');

for (const route of ['Weekly Projections', 'PPR Rankings', 'Schedule']) {
  test(`${route} route-state model covers loading`, () => {
    assert.deepEqual(resolveDataRouteState({ loading: true }), {
      primary: 'loading',
      stale: false,
      partial: false,
    });
  });

  test(`${route} route-state model covers failure`, () => {
    assert.equal(
      resolveDataRouteState({ error: new Error('provider failed') }).primary,
      'failure'
    );
  });

  test(`${route} route-state model covers empty`, () => {
    assert.equal(resolveDataRouteState({ items: [] }).primary, 'empty');
  });

  test(`${route} route-state model covers success`, () => {
    assert.equal(resolveDataRouteState({ items: [{ id: 1 }] }).primary, 'success');
  });

  test(`${route} route-state model covers stale success`, () => {
    const state = resolveDataRouteState({ items: [{ id: 1 }], stale: true });
    assert.equal(state.primary, 'success');
    assert.equal(state.stale, true);
  });

  test(`${route} route-state model covers partial success`, () => {
    const state = resolveDataRouteState({ items: [{ id: 1 }], partial: true });
    assert.equal(state.primary, 'success');
    assert.equal(state.partial, true);
  });
}
