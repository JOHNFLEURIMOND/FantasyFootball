import React, { Suspense, lazy, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './CSS/theme'; // Adjust path as necessary
import Loading from './Loading'; // Fixed import path
import ReactHelmet from 'react-helmet';
import {
  NewsProvider,
  StatsProvider,
  NewsContext,
  StatsContext,
} from './context'; // Import context providers

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

// Homepage Component
const Homepage = () => {
  const { news, search, setSearch, loaded, fetchNews } =
    useContext(NewsContext);
  const { fetchStats } = useContext(StatsContext);

  useEffect(() => {
    fetchNews(process.env.REACT_APP_MY_API_KEY); // Fetch news on mount
    fetchStats(process.env.REACT_APP_MY_API_KEY); // Fetch stats on mount
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
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </NewsProvider>
  </StatsProvider>
);

export default App;
