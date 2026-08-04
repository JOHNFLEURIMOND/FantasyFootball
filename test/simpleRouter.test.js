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

const { Router, Route, Routes, NavLink, useLocation } = require('../components/routing/SimpleRouter.jsx');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const createDom = url => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: globalThis.navigator,
    location: globalThis.location,
    history: globalThis.history,
    Event: globalThis.Event,
    MouseEvent: globalThis.MouseEvent,
    PopStateEvent: globalThis.PopStateEvent,
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.location = dom.window.location;
  globalThis.history = dom.window.history;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.PopStateEvent = dom.window.PopStateEvent;

  return {
    dom,
    restore() {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.navigator = previous.navigator;
      globalThis.location = previous.location;
      globalThis.history = previous.history;
      globalThis.Event = previous.Event;
      globalThis.MouseEvent = previous.MouseEvent;
      globalThis.PopStateEvent = previous.PopStateEvent;
      dom.window.close();
    },
  };
};

const render = element => {
  const container = document.getElementById('root');
  let root;
  act(() => {
    root = ReactDOMClient.createRoot(container);
    root.render(element);
  });

  return {
    root,
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
    },
  };
};

const LocationProbe = () => {
  const location = useLocation();

  return React.createElement(
    'div',
    { 'data-testid': 'location' },
    `${location.pathname}${location.search}${location.hash}`
  );
};

const click = (element, init = {}) => {
  const event = new window.MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });

  element.dispatchEvent(event);
  return event;
};

const waitForPopState = () =>
  new Promise(resolve => {
    window.addEventListener('popstate', resolve, { once: true });
  });

test(
  'router matches pathnames while preserving query strings and fragments',
  { concurrency: false },
  () => {
    const dom = createDom('http://localhost/Schedule?week=2#top');

    try {
      render(
        React.createElement(
          Router,
          null,
          React.createElement(
            React.Fragment,
            null,
            React.createElement(LocationProbe),
            React.createElement(
              Routes,
              null,
              React.createElement(Route, {
                path: '/Schedule',
                element: React.createElement('div', { 'data-testid': 'schedule' }, 'Schedule'),
              }),
              React.createElement(Route, {
                path: '*',
                element: React.createElement('div', { 'data-testid': 'fallback' }, 'Fallback'),
              })
            )
          )
        )
      );

      assert.equal(document.querySelector('[data-testid="schedule"]').textContent, 'Schedule');
      assert.equal(document.querySelector('[data-testid="fallback"]'), null);
      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/Schedule?week=2#top');
    } finally {
      dom.restore();
    }
  }
);

test(
  'router falls back on unknown routes when no exact path matches',
  { concurrency: false },
  () => {
    const dom = createDom('http://localhost/unknown?foo=1#frag');

    try {
      render(
        React.createElement(
          Router,
          null,
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: '/Schedule',
              element: React.createElement('div', { 'data-testid': 'schedule' }, 'Schedule'),
            }),
            React.createElement(Route, {
              path: '*',
              element: React.createElement('div', { 'data-testid': 'fallback' }, 'Not Found'),
            })
          )
        )
      );

      assert.equal(document.querySelector('[data-testid="schedule"]'), null);
      assert.equal(document.querySelector('[data-testid="fallback"]').textContent, 'Not Found');
    } finally {
      dom.restore();
    }
  }
);

test(
  'NavLink handles internal links, external links, modified clicks, and history navigation',
  { concurrency: false },
  async () => {
    const dom = createDom('http://localhost/');
    const addCalls = [];
    const removeCalls = [];
    const originalAddEventListener = window.addEventListener.bind(window);
    const originalRemoveEventListener = window.removeEventListener.bind(window);

    window.addEventListener = (type, handler, options) => {
      if (type === 'popstate') {
        addCalls.push(handler);
      }

      return originalAddEventListener(type, handler, options);
    };

    window.removeEventListener = (type, handler, options) => {
      if (type === 'popstate') {
        removeCalls.push(handler);
      }

      return originalRemoveEventListener(type, handler, options);
    };

    try {
      const App = () =>
        React.createElement(
          Router,
          null,
          React.createElement(
            'div',
            null,
            React.createElement(NavLink, {
              to: '/PPR?week=5#details',
              'data-testid': 'internal',
            }, 'Internal'),
            React.createElement(NavLink, {
              to: 'https://example.com/report',
              target: '_blank',
              'data-testid': 'external',
            }, 'External'),
            React.createElement(LocationProbe)
          )
        );

      const { unmount } = render(React.createElement(App));
      const internal = document.querySelector('[data-testid="internal"]');
      const external = document.querySelector('[data-testid="external"]');

      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/');

      act(() => {
        click(internal);
      });
      assert.equal(window.location.pathname, '/PPR');
      assert.equal(window.location.search, '?week=5');
      assert.equal(window.location.hash, '#details');
      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/PPR?week=5#details');
      assert.equal(internal.getAttribute('aria-current'), 'page');

      const ctrlClick = click(internal, { ctrlKey: true });
      assert.equal(ctrlClick.defaultPrevented, false);
      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/PPR?week=5#details');

      const externalClick = click(external);
      assert.equal(externalClick.defaultPrevented, false);
      assert.equal(window.location.pathname, '/PPR');
      assert.equal(window.location.search, '?week=5');
      assert.equal(window.location.hash, '#details');

      const backPromise = waitForPopState();
      await act(async () => {
        window.history.back();
        await backPromise;
      });
      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/');

      const forwardPromise = waitForPopState();
      await act(async () => {
        window.history.forward();
        await forwardPromise;
      });
      assert.equal(document.querySelector('[data-testid="location"]').textContent, '/PPR?week=5#details');

      unmount();
      assert.ok(addCalls.length >= 1);
      assert.ok(removeCalls.length >= 1);
      assert.ok(removeCalls.some(handler => addCalls.includes(handler)));
    } finally {
      window.addEventListener = originalAddEventListener;
      window.removeEventListener = originalRemoveEventListener;
      dom.restore();
    }
  }
);