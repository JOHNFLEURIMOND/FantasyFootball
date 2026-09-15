const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-runtime'],
  ignore: [/node_modules/],
  cache: false,
});

const { searchItems } = require('../components/Dashboard/PublicDashboard');
const { matchPath, routeName } = require('../components/routing/SimpleRouter');

const players = [
  { playerId: '00-1', displayName: 'Alpha Receiver', position: 'WR', teamId: 'NE' },
  { playerId: '00-2', displayName: 'Beta Quarterback', position: 'QB', teamId: 'NYJ' },
];
const teams = [
  { teamId: 'NE', abbreviation: 'NE', city: 'New England', name: 'Patriots' },
  { teamId: 'NYJ', abbreviation: 'NYJ', city: 'New York', name: 'Jets' },
];

test('global dashboard search matches players and teams without account state', () => {
  const playerResults = searchItems(players, teams, 'alpha');
  assert.equal(playerResults[0].title, 'Alpha Receiver');
  assert.equal(playerResults[0].href, '/players/00-1');

  const teamResults = searchItems(players, teams, 'patriots');
  assert.equal(teamResults[0].type, 'Team');
  assert.equal(teamResults[0].title, 'New England Patriots');
});

test('dynamic canonical player URLs resolve route parameters', () => {
  const match = matchPath('/players/:id', '/players/00-0033873');
  assert.equal(match.matched, true);
  assert.equal(match.params.id, '00-0033873');
  assert.equal(routeName('/players/00-0033873'), 'Player profile');
});

test('route announcer names public dashboard destinations', () => {
  assert.equal(routeName('/'), 'NFL dashboard');
  assert.equal(routeName('/standings'), 'Standings');
  assert.equal(routeName('/leaderboards'), 'Leaderboards');
});
