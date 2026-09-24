const test = require('node:test');
const assert = require('node:assert/strict');
require('@babel/register')({ extensions: ['.js', '.jsx'], presets: ['@babel/preset-env', '@babel/preset-react'], ignore: [/node_modules/], cache: false });
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { JSDOM, VirtualConsole } = require('jsdom');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

for (const hostname of ['localhost', 'deploy-preview-51--fantasyfootball24.netlify.app', 'fantasyfootball24.netlify.app']) {
  test(`consent controls respect environment and choices on ${hostname}`, async () => {
    const dom = new JSDOM('<div id="root"></div>', { url: `https://${hostname}/`, virtualConsole: new VirtualConsole() });
    global.window = dom.window; global.document = dom.window.document;
    const keys = ['GTM_CONTAINER_ID', 'GA4_MEASUREMENT_ID', 'ANALYTICS_HOSTNAME'];
    const previous = keys.map(key => process.env[key]);
    process.env.GTM_CONTAINER_ID = 'GTM-TEST123'; process.env.GA4_MEASUREMENT_ID = 'G-TEST123'; process.env.ANALYTICS_HOSTNAME = 'fantasyfootball24.netlify.app';
    const path = require.resolve('../components/Analytics/AnalyticsConsent');
    delete require.cache[path];
    const Consent = require(path).default;
    const root = createRoot(document.getElementById('root'));
    const click = text => act(() => [...document.querySelectorAll('button')].find(button => button.textContent === text).click());
    try {
      await act(async () => root.render(React.createElement(Consent)));
      assert.equal(document.querySelectorAll('script').length, 0);
      if (hostname !== 'fantasyfootball24.netlify.app') {
        assert.equal(document.querySelector('aside'), null);
        return;
      }
      click('Reject analytics');
      assert.equal(window.localStorage.getItem('ff.analytics.consent.v1'), 'denied');
      assert.equal(document.querySelectorAll('script').length, 0);
      click('Analytics preferences');
      click('Allow analytics');
      assert.equal(window.localStorage.getItem('ff.analytics.consent.v1'), 'granted');
      assert.equal(document.querySelectorAll('script').length, 1);
      assert.equal(window.dataLayer.filter(event => event.event === 'ff_page_view').length, 1);
      click('Analytics preferences');
      click('Reject analytics');
      assert.equal(window['ga-disable-G-TEST123'], true);
      assert.equal(window.localStorage.getItem('ff.analytics.consent.v1'), 'denied');
    } finally {
      act(() => root.unmount()); dom.window.close();
      keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
    }
  });
}
