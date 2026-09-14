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
                  <>
                    <ReactHelmet>
                      <title>NFL & Fantasy Football Dashboard</title>
                      <meta
                        name='description'
                        content='Browse public NFL players, teams, schedules, statistics, projections, rankings, comparisons, and leaderboards without an account.'
                      />
                    </ReactHelmet>
                    <Nav />
                    <PublicDashboard />
                    <Footer />
                  </>
                }
              />
              <Route path='/players' element={<><Nav /><PlayersPage /><Footer /></>} />
              <Route path='/teams' element={<><Nav /><TeamsPage /><Footer /></>} />
              <Route path='/standings' element={<><Nav /><StandingsPage /><Footer /></>} />
              <Route path='/stats' element={<><Nav /><StatsPage /><Footer /></>} />
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
