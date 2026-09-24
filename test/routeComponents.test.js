const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { ThemeProvider } = require('styled-components');

require.extensions['.css'] = () => {};
require.extensions['.jpeg'] = module => {
  module.exports = '/test-image.jpeg';
};
require.extensions['.jpg'] = require.extensions['.jpeg'];
require.extensions['.png'] = require.extensions['.jpeg'];

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const theme = require('../components/CSS/theme').default;
const { StatsContext, NewsContext } = require('../components/context');
const WeeklyProjections = require('../components/WeeklyProjections/WeeklyProjections').default;
const PPR = require('../components/PPR/PPR').default;
const Schedule = require('../components/Schedule/Schedule').default;

const player = {
  PlayerID: '00-1', Name: 'Test Player', Position: 'WR', Team: 'NE', Opponent: 'NYJ',
  GameDate: null, HomeOrAway: 'N/A', Activated: 1, PassingAttempts: 0,
  PassingCompletions: 0, PassingYards: 0, PassingTouchdowns: 0, RushingAttempts: 0,
  RushingYards: 0, RushingTouchdowns: 0, Receptions: 6, ReceivingYards: 80,
  ReceivingTouchdowns: 1, FantasyPoints: 20, FantasyPointsPPR: 20,
  FantasyPointsFanDuel: null, FantasyPointsDraftKings: null, FantasyPointsYahoo: null,
  DataLabel: 'Observed statistics', Season: '2025', Week: 1,
};

const game = {
  GameKey: '2025_01_NE_NYJ', AwayTeam: 'NE', HomeTeam: 'NYJ',
  AwayTeamName: 'New England Patriots', HomeTeamName: 'New York Jets',
  AwayTeamLogo: null, HomeTeamLogo: null, Date: '2025-09-07T17:00:00.000Z',
  DateTime: '2025-09-07T17:00:00.000Z', Status: 'scheduled', Week: 1,
  Season: '2025', AwayScore: null, HomeScore: null,
};

const noop = () => {};

function renderWithContext(Context, value, Component) {
  return renderToStaticMarkup(
    React.createElement(
      ThemeProvider,
      { theme },
      React.createElement(
        Context.Provider,
        { value },
        React.createElement(Component)
      )
    )
  );
}

function statsValue(overrides = {}) {
  return {
    stats: [player], scores: [player], loading: false, error: null,
    fetchStats: noop, fetchScores: noop, currentPage: 1, setCurrentPage: noop,
    totalPages: 1, selectedPosition: '', setSelectedPosition: noop,
    selectedSeason: 2025, setSelectedSeason: noop, stale: false, partial: false,
    meta: {}, dataKind: 'observed', ...overrides,
  };
}

function newsValue(overrides = {}) {
  return {
    news: [], schedules: [game], allSchedules: [game], loaded: true,
    fetchNews: noop, fetchSchedules: noop, currentPage: 1, setCurrentPage: noop,
    totalPages: 1, selectedSeason: 2025, setSelectedSeason: noop,
    selectedWeek: '', setSelectedWeek: noop, error: null, stale: false,
    partial: false, meta: {}, ...overrides,
  };
}

const statsCases = [
  ['loading', { loading: true, stats: [] }, /Loading/],
  ['success', {}, /Test Player/],
  ['empty', { stats: [] }, /No .*data|No matching/],
  ['stale', { stale: true }, /stale cached NFL data/],
  ['partial', { partial: true }, /partial/],
  ['failure', { error: { message: 'provider failed' }, stats: [] }, /provider failed/],
];

for (const [name, overrides, expected] of statsCases) {
  test(`Weekly Projections renders ${name} state`, () => {
    const html = renderWithContext(StatsContext, statsValue({ ...overrides, dataKind: 'estimated' }), WeeklyProjections);
    assert.match(html, expected);
  });

  test(`PPR Rankings renders ${name} state`, () => {
    const html = renderWithContext(StatsContext, statsValue(overrides), PPR);
    assert.match(html, expected);
    assert.doesNotMatch(html, /id="hero-title"/);
  });
}

const scheduleCases = [
  ['loading', { loaded: false, schedules: [] }, /Loading schedule/],
  ['success', {}, /New England Patriots/],
  ['empty', { schedules: [], allSchedules: [] }, /No games are available/],
  ['stale', { stale: true }, /stale cached schedule data/],
  ['partial', { partial: true }, /schedule records were skipped/],
  ['failure', { error: { message: 'schedule failed' }, schedules: [] }, /schedule failed/],
];

for (const [name, overrides, expected] of scheduleCases) {
  test(`Schedule renders ${name} state`, () => {
    const html = renderWithContext(NewsContext, newsValue(overrides), Schedule);
    assert.match(html, expected);
    assert.doesNotMatch(html, /id="hero-title"/);
  });
}
