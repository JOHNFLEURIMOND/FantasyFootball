import React, { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';
import Nav from '../components/Navbar/Nav.jsx';
import Footer from '../components/Footer/Footer';
import MainHero from '../components/MainHero/MainHero';
import FantasyFootballRanking from '../components/FantasyFootballRanking/FantasyFootballRanking';
import WeeklyProjections from '../components/WeeklyProjections/WeeklyProjections';
import PPR from '../components/PPR/PPR';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { GlobalStyle, Container } from '../components/CSS/global-style';
const key = process.env.REACT_APP_MY_API_KEY;
const debug =
  process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

export const StatsContext = createContext();
export const NewsContext = createContext();

const Homepage = props => {
  const [card, flipCard] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const key = process.env.REACT_APP_MY_API_KEY;

  useEffect(() => {
    const getPlayers = async () => {
      setLoaded(true);
      await axios
        .get(
          `https://api.sportsdata.io/v3/nfl/scores/json/News?key=${process.env.REACT_APP_MY_API_KEY}`
        )
        .then(responses => setData(responses.data))
        .catch(error => setError(error.message))
        .finally(() => setLoaded(false));
    };

    getPlayers();
  }, [search]);

  return (
    <NewsContext.Provider
      value={{
        card,
        flipCard,
        data,
        setData,
        search,
        setSearch,
        loaded,
        setLoaded,
      }}
    >
      <Container>
        <GlobalStyle />
        <Nav />
        <MainHero />

        <FantasyFootballRanking />
        <Footer />
      </Container>
    </NewsContext.Provider>
  );
};

const App = () => {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastStat = currentPage * 12;
  const totalPages = stats.length / 12;
  const indexOfFirstStat = indexOfLastStat - 12;
  const currentStats = stats.slice(indexOfFirstStat, indexOfLastStat);
  console.log(
    'this is the total pages and current pages in app.jsx',
    totalPages,
    currentPage,
    stats.length
  );
  useEffect(() => {
    setLoading(true);
    const getStats = async () => {
      await axios
        .get(
          `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/6?key=${key}`
        )
        .then(responses => {
          setStats(responses.data);
        })
        .catch(responses => setError(responses.error))
        .finally(() => setLoading(false));
    };
    getStats();
  }, []);

  return (
    <StatsContext.Provider
      value={{
        stats,
        error,
        currentPage,
        totalPages,
        currentPage,
        currentStats,
        loading,
        setCurrentPage,
      }}
    >
      <StyletronProvider value={engine} debug={debug} debugAfterHydration>
        <Router location={history.location} navigator={history}>
          <Switch>
            <Route path='/' exact component={Homepage} stats={stats} />
          </Switch>
          <Switch>
            <Route path='/WeeklyProjections' component={WeeklyProjections} />
          </Switch>
          <Switch>
            <Route path='/PPR' component={PPR} stats={stats} />
          </Switch>
        </Router>
      </StyletronProvider>
    </StatsContext.Provider>
  );
};

export default App;
