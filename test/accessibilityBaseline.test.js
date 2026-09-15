const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const React = require('react');
const ReactDOMClient = require('react-dom/client');
const { JSDOM } = require('jsdom');
const { act } = React;
const {
  Router,
  RouteAnnouncer,
  NavLink,
} = require('../components/routing/SimpleRouter.jsx');
const {
  SkipLink,
  TableRegion,
} = require('../components/accessibility/Accessibility.jsx');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
  });
  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0);
  dom.window.cancelAnimationFrame = timer => dom.window.clearTimeout(timer);
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.MouseEvent = dom.window.MouseEvent;
  return dom;
}

function render(element) {
  const root = ReactDOMClient.createRoot(document.getElementById('root'));
  act(() => root.render(element));
  return root;
}

test('skip link is the keyboard shortcut to the main landmark', { concurrency: false }, () => {
  const dom = setupDom();
  try {
    const root = render(
      React.createElement(React.Fragment, null,
        React.createElement(SkipLink),
        React.createElement('main', { id: 'main-content', tabIndex: -1 }, 'Main')
      )
    );
    const link = document.querySelector('a[href="#main-content"]');
    assert.ok(link);
    assert.equal(link.textContent, 'Skip to main content');
    assert.equal(document.querySelector('main').getAttribute('tabindex'), '-1');
    act(() => root.unmount());
  } finally {
    dom.window.close();
  }
});

test('route changes are announced and focus moves to main content', { concurrency: false }, async () => {
  const dom = setupDom();
  try {
    const root = render(
      React.createElement(Router, null,
        React.createElement(RouteAnnouncer),
        React.createElement(NavLink, { to: '/players' }, 'Players'),
        React.createElement('main', { id: 'main-content', tabIndex: -1 }, 'Players content')
      )
    );

    const link = document.querySelector('a');
    await act(async () => {
      link.dispatchEvent(new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
      }));
      await new Promise(resolve => window.setTimeout(resolve, 10));
    });

    const announcer = document.querySelector('[role="status"]');
    assert.equal(announcer.getAttribute('aria-live'), 'polite');
    assert.equal(announcer.textContent, 'Players page loaded');
    assert.equal(document.activeElement.id, 'main-content');
    act(() => root.unmount());
  } finally {
    dom.window.close();
  }
});

test('scrollable data tables have a labeled keyboard-focusable region', { concurrency: false }, () => {
  const dom = setupDom();
  try {
    const root = render(
      React.createElement(TableRegion, { label: 'Stat summary table' },
        React.createElement('table', null,
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', { scope: 'col' }, 'Player'),
              React.createElement('th', { scope: 'col' }, 'Points')
            )
          ),
          React.createElement('tbody', null,
            React.createElement('tr', null,
              React.createElement('th', { scope: 'row' }, 'Player One'),
              React.createElement('td', null, '20')
            )
          )
        )
      )
    );

    const region = document.querySelector('[role="region"]');
    assert.equal(region.getAttribute('aria-label'), 'Stat summary table');
    assert.equal(region.getAttribute('tabindex'), '0');
    assert.equal(document.querySelectorAll('th[scope="col"]').length, 2);
    assert.equal(document.querySelectorAll('th[scope="row"]').length, 1);
    act(() => root.unmount());
  } finally {
    dom.window.close();
  }
});
