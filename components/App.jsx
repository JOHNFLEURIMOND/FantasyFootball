import React, { Suspense, lazy } from 'react';
import { Router, Route, RouteAnnouncer, Routes } from './routing/SimpleRouter';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme';
import Loading from './Loading';
import ReactHelmet from 'react-helmet';
import { NewsProvider, StatsProvider } from './context';
import {
  PlayersPage,
  TeamsPage,
  StandingsPage,
  StatsPage,
} from './Dashboard/PublicDataPages';

const Nav = lazy(() => import('./Navbar/Nav'));
const Footer = lazy(() => import('./Footer/Footer'));
const PublicDashboard = lazy(() => import('./Dashboard/PublicDashboard'));
const WeeklyProjections = lazy(() => import('./WeeklyProjections/WeeklyProjections'));
const PPR = lazy(() => import('./PPR/PPR'));
const Schedule = lazy(() => import('./Schedule/Schedule'));
const PlayerProfile = lazy(() => import('./Players/PlayerProfile'));
const ComparePlayers = lazy(() => import('./Players/ComparePlayers'));
const Leaderboards = lazy(() => import('./Players/Leaderboards'));

const Shell = ({ children }) => <><Nav />{children}<Footer /></>;

const App = () => (
  <ThemeProvider theme={theme}>
    <StatsProvider>
      <NewsProvider>
        <Router>
          <RouteAnnouncer />
          <Suspense fallback={<Loading percentage={100} />}>
            <Routes>
              <Route
                path='/'
                element={
                  <Shell>
                    <ReactHelmet>
                      <title>NFL & Fantasy Football Dashboard</title>
                      <meta
                        name='description'
                        content='Browse public NFL players, teams, schedules, statistics, projections, rankings, comparisons, and leaderboards without an account.'
                      />
                    </ReactHelmet>
                    <PublicDashboard />
                  </Shell>
                }
              />
              <Route path='/players' element={<Shell><PlayersPage /></Shell>} />
              <Route path='/players/:id' element={<Shell><PlayerProfile /></Shell>} />
              <Route path='/teams' element={<Shell><TeamsPage /></Shell>} />
              <Route path='/standings' element={<Shell><StandingsPage /></Shell>} />
              <Route path='/stats' element={<Shell><StatsPage /></Shell>} />
              <Route path='/compare' element={<Shell><ComparePlayers /></Shell>} />
              <Route path='/leaderboards' element={<Shell><Leaderboards /></Shell>} />
              <Route path='/WeeklyProjections' element={<WeeklyProjections />} />
              <Route path='/PPR' element={<PPR />} />
              <Route path='/Schedule' element={<Schedule />} />
            </Routes>
          </Suspense>
        </Router>
      </NewsProvider>
    </StatsProvider>
  </ThemeProvider>
);

export default App;
