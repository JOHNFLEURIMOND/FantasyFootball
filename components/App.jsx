import React, {useState, useEffect, useContext, createContext} from 'react';
import axios from 'axios';
import Nav from '../components/Navbar/Nav.jsx';
import Footer from '../components/Footer/Footer';
import MainHero from '../components/MainHero/MainHero';
import FantasyFootballRanking from '../components/FantasyFootballRanking/FantasyFootballRanking';
import WeeklyProjections from '../components/WeeklyProjections/WeeklyProjections';
import PPR from '../components/PPR/PPR';
import {Provider as StyletronProvider, DebugEngine} from 'styletron-react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import {GlobalStyle, Container} from '../components/CSS/global-style';
const key = process.env.REACT_APP_MY_API_KEY;
const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

export const StatsContext = createContext();

const Homepage = (props) => {
  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <FantasyFootballRanking />
      <Footer />
    </Container>
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
  console.log('this is the total pages and current pages in app.jsx', totalPages, currentPage, stats.length);
  useEffect(() => {
    setLoading(true);
    const getStats = async () => {
      await axios
        .get(
          `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=31c47054e334469486c840aee3f595b6`,
        )
        .then((responses) => {
          setStats(responses.data);
        })
        .catch((responses) => setError(responses.error))
        .finally(() => setLoading(false));
    };
    getStats();
  }, []);

  return (
    <StatsContext.Provider
      value={{stats, error, currentPage, totalPages, currentPage, currentStats, loading, setCurrentPage}}>
      <StyletronProvider value={engine} debug={debug} debugAfterHydration>
        <Router location={history.location} navigator={history}>
          <Switch>
            <Route path='/' exact component={Homepage} />
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
