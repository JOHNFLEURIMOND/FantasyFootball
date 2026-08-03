import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme'; // Adjust path as necessary
import Loading from './Loading'; // Fixed import path
import ReactHelmet from 'react-helmet';

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
  </ThemeProvider>
);

export default App;
