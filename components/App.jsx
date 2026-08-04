import React, { Suspense, lazy } from 'react';
import { Router, Route, Routes } from './routing/SimpleRouter';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme'; // Adjust path as necessary
import Loading from './Loading'; // Fixed import path
import ReactHelmet from 'react-helmet';
import { NewsProvider, StatsProvider } from './context';

// Lazy load components
const Nav = lazy(() => import('./Navbar/Nav'));
const Footer = lazy(() => import('./Footer/Footer'));
const CommandCenter = lazy(() => import('./CommandCenter/CommandCenter'));
const WeeklyProjections = lazy(
  () => import('./WeeklyProjections/WeeklyProjections')
);
const PPR = lazy(() => import('./PPR/PPR'));
const Schedule = lazy(() => import('./Schedule/Schedule')); // Import Schedule

// App Component
const App = () => (
  <ThemeProvider theme={theme}>
    <StatsProvider>
      <NewsProvider>
        <Router>
          <Suspense fallback={<Loading percentage={100} />}>
            <Routes>
              <Route
                path='/'
                element={
                  <>
                    <ReactHelmet>
                      <title>Fantasy Football Command Center</title>
                      <meta
                        name='description'
                        content='Look up a Sleeper username, inspect leagues, and review normalized fantasy data.'
                      />
                    </ReactHelmet>
                    <Nav />
                    <CommandCenter />
                    <Footer />
                  </>
                }
              />
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
