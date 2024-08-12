import React, { Suspense, lazy, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme'; // Adjust path as necessary
import Loading from './Loading'; // Fixed import path
import {
  NewsProvider,
  StatsProvider,
  NewsContext,
  StatsContext,
} from './context'; // Import context providers
import ReactHelmet from 'react-helmet';

// Lazy load components
const Nav = lazy(() => import('./Navbar/Nav'));
const Footer = lazy(() => import('./Footer/Footer'));
const MainHero = lazy(() => import('./MainHero/MainHero'));
const FantasyFootballRanking = lazy(
  () => import('./FantasyFootballRanking/FantasyFootballRanking')
);
const WeeklyProjections = lazy(
  () => import('./WeeklyProjections/WeeklyProjections')
);
const PPR = lazy(() => import('./PPR/PPR'));
const Schedule = lazy(() => import('./Schedule/Schedule')); // Import Schedule

// Homepage Component
const Homepage = () => {
  const { fetchNews } = useContext(NewsContext);
  const { fetchStats } = useContext(StatsContext);

  useEffect(() => {
    fetchNews(); // Fetch news on mount
    fetchStats(); // Fetch stats on mount
  }, [fetchNews, fetchStats]);

  return (
    <>
      <ReactHelmet>
        <title>Homepage - Fantasy Football</title>
        <meta
          name='description'
          content='Get the latest news and updates on Fantasy Football.'
        />
        <meta
          name='keywords'
          content='fantasy football, football, fantasy, ESPN, Yahoo Sports'
        />
      </ReactHelmet>
      <Nav />
      <MainHero />
      <FantasyFootballRanking />
      <Footer />
    </>
  );
};

// App Component
const App = () => (
  <StatsProvider>
    <NewsProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Suspense fallback={<Loading percentage={100} />}>
            <Routes>
              <Route path='/' element={<Homepage />} />
              <Route
                path='/WeeklyProjections'
                element={<WeeklyProjections />}
              />
              <Route path='/PPR' element={<PPR />} />
              <Route path='/Schedule' element={<Schedule />} />{' '}
              {/* Add route for Schedule */}
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </NewsProvider>
  </StatsProvider>
);

export default App;
