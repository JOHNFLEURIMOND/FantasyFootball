import React from 'react';
import { Helmet } from 'react-helmet';
import { routeName, useLocation } from './SimpleRouter';
import heroImage from '../../public/fantasyfootball.jpeg';

const SITE_URL = 'https://fantasyfootball24.netlify.app';
const descriptions = {
  '/': 'Browse NFL players, teams, schedules, standings, and fantasy statistics without an account.',
  '/players': 'Search NFL players and season rosters by name and position.',
  '/teams': 'Browse NFL teams and explore their season rosters.',
  '/stats': 'Review seasonal NFL passing, rushing, and receiving statistics.',
  '/schedule': 'Browse NFL schedules and results by season and week.',
  '/standings': 'Review NFL team standings calculated from completed games.',
  '/WeeklyProjections': 'Review estimated weekly fantasy projections based on recent observed games.',
  '/PPR': 'Review full-PPR rankings calculated from observed NFL statistics.',
  '/compare': 'Compare NFL player statistics.',
  '/leaderboards': 'Browse NFL statistical leaderboards.',
};

export function getRouteMetadata(pathname) {
  const path = pathname === '/Schedule' ? '/schedule' : pathname;
  const name = routeName(path);
  return {
    title: path === '/' ? 'NFL & Fantasy Football Dashboard' : `${name} | Fantasy Football`,
    description: descriptions[path] || (name === 'Team players'
      ? 'Explore NFL team season rosters and player profiles.'
      : name === 'Player profile' ? 'Review an NFL player profile and statistics.' : descriptions['/']),
    canonical: `${SITE_URL}${path}`,
    noindex: name === 'Page not found',
  };
}

export default function RouteMetadata() {
  const { pathname } = useLocation();
  const { title, description, canonical, noindex } = getRouteMetadata(pathname);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='robots' content={noindex ? 'noindex,follow' : 'index,follow'} />
      <link rel='canonical' href={canonical} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={canonical} />
      <meta property='og:image' content={new URL(heroImage, SITE_URL).href} />
      <meta property='og:image:alt' content='Fantasy Football artwork' />
    </Helmet>
  );
}
